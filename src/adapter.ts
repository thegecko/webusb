/*
* Node WebUSB
* Copyright (c) 2017 Rob Moran
*
* The MIT License (MIT)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

import { EventEmitter } from "events";
import {
    getDeviceList,
    Device,
    Endpoint,
    InEndpoint,
    OutEndpoint,
    ConfigDescriptor,
    InterfaceDescriptor,
    on,
    removeListener,
    LIBUSB_ENDPOINT_IN,
    LIBUSB_ENDPOINT_OUT,
    LIBUSB_TRANSFER_OVERFLOW,
    LIBUSB_TRANSFER_STALL,
    LIBUSB_TRANSFER_TYPE_INTERRUPT,
    LIBUSB_TRANSFER_TYPE_BULK,
    LIBUSB_RECIPIENT_DEVICE,
    LIBUSB_RECIPIENT_INTERFACE,
    LIBUSB_RECIPIENT_ENDPOINT,
    LIBUSB_RECIPIENT_OTHER,
    LIBUSB_REQUEST_TYPE_STANDARD,
    LIBUSB_REQUEST_TYPE_CLASS,
    LIBUSB_REQUEST_TYPE_VENDOR,
    EndpointDescriptor,
    DeviceDescriptor,
    Capability
} from "usb";
import { USBConfiguration } from "./configuration";
import { USBInterface } from "./interface";
import { USBAlternateInterface } from "./alternate";
import { USBEndpoint } from "./endpoint";
import { USBDevice } from "./device";

/**
 * @hidden
 */
const DEFAULT_DELAY_TIMEOUT = 200;
/**
 * @hidden
 */
const DEFAULT_RETRY_COUNT = 10;

/**
 * @hidden
 */
const CONSTANTS = {
    WEB_UUID: "3408b638-09a9-47a0-8bfd-a0768815b665",
    LIBUSB_DT_BOS: 0x0f,
    LIBUSB_DT_BOS_SIZE: 0x05,
    LIBUSB_TRANSFER_TYPE_MASK: 0x03,
    USB_VERSION: 0x201,
    CAPABILITY_VERSION: 0x0100,
    URL_REQUEST_TYPE: 0xC0,
    URL_REQUEST_INDEX: 0x02,
    CLEAR_FEATURE: 0x01,
    ENDPOINT_HALT: 0x00
};

/**
 * @hidden
 */
export interface Adapter {
    getConnected(handle: string): boolean;
    getOpened(handle: string): boolean;

    listUSBDevices(preFilters?: Array<USBDeviceFilter>): Promise<Array<USBDevice>>;
    open(handle: string): Promise<void>;
    close(handle: string): Promise<void>;
    selectConfiguration(handle: string, id: number): Promise<void>;
    claimInterface(handle: string, address: number): Promise<void>;
    releaseInterface(handle: string, address: number): Promise<void>;
    selectAlternateInterface(handle: string, interfaceNumber: number, alternateSetting: number): Promise<void>;
    controlTransferIn(handle: string, setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
    controlTransferOut(handle: string, setup: USBControlTransferParameters, data: ArrayBuffer | ArrayBufferView): Promise<USBOutTransferResult>;
    clearHalt(handle: string, direction: USBDirection, endpointNumber: number): Promise<void>;
    transferIn(handle: string, endpointNumber: number, length: number): Promise<USBInTransferResult>;
    transferOut(handle: string, endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
    isochronousTransferIn(_handle: string, _endpointNumber: number, _packetLengths: Array<number>): Promise<USBIsochronousInTransferResult>;
    isochronousTransferOut(_handle: string, _endpointNumber: number, _data: BufferSource, _packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult>;
    reset(handle: string): Promise<void>;
}

/**
 * @hidden
 */
export class USBAdapter extends EventEmitter implements Adapter {

    public static EVENT_DEVICE_CONNECT: string = "connect";
    public static EVENT_DEVICE_DISCONNECT: string = "disconnect";

    // Maintains a live list of connected Web USB devices
    private devices: { [key: string]: { device: Device, url: string }} = {};

    constructor() {
        super();

        const attachCallback = device => {
            this.loadDevice(device, DEFAULT_RETRY_COUNT)
            .then(loadedDevice => {
                if (loadedDevice) {
                    const handle = this.getDeviceHandle(loadedDevice);
                    this.devicetoUSBDevice(handle)
                    .then(usbDevice => {
                        if (usbDevice) {
                            this.emit(USBAdapter.EVENT_DEVICE_CONNECT, usbDevice);
                        }
                    });
                }
            });
        };

        const detachCallback = device => {
            const handle = this.getDeviceHandle(device);

            if (handle && this.devices[handle]) {
                delete this.devices[handle];
                this.emit(USBAdapter.EVENT_DEVICE_DISCONNECT, handle);
            }
        };

        this.on("newListener", event => {
            const listenerCount = this.listenerCount(event);

            if (listenerCount !== 0) {
                return;
            }

            if (event === USBAdapter.EVENT_DEVICE_CONNECT) {
                on("attach", attachCallback);
            } else if (event === USBAdapter.EVENT_DEVICE_DISCONNECT) {
                on("detach", detachCallback);
            }
        });

        this.on("removeListener", event => {
            const listenerCount = this.listenerCount(event);

            if (listenerCount !== 0) {
                return;
            }

            if (event === USBAdapter.EVENT_DEVICE_CONNECT) {
                removeListener("attach", attachCallback);
            } else if (event === USBAdapter.EVENT_DEVICE_DISCONNECT) {
                removeListener("detach", detachCallback);
            }
        });
    }

    private getDeviceHandle(device: Device): string {
        if (device.busNumber === null || device.deviceAddress === null) {
            return null;
        }

        return `${device.busNumber}.${device.deviceAddress}`;
    }

    private serialPromises<T>(task: (param: any) => Promise<T>, params: Array<any>): Promise<Array<T>> {
        function reducer(chain, param) {
            return chain
            .then(results => {
                return task.call(this, param)
                .then(result => {
                    if (result) {
                        results.push(result);
                    }
                    return results;
                });
            });
        }
        return params.reduce(reducer.bind(this), Promise.resolve([]));
    }

    private serialDevicePromises<T>(task: (device: Device, descriptor: any) => Promise<T>, device: Device, descriptors: Array<any>): Promise<Array<T>> {
        function reducer(chain, descriptor) {
            return chain
            .then(results => {
                return task.call(this, device, descriptor)
                .then(result => {
                    results.push(result);
                    return results;
                });
            });
        }
        return descriptors.reduce(reducer.bind(this), Promise.resolve([]));
    }

    private delay(timeout: number = DEFAULT_DELAY_TIMEOUT): Promise<void> {
        return new Promise((resolve, _reject) => {
            setTimeout(resolve, timeout);
        });
    }

    private retryPromise(fn: () => Promise<any>, retries: number = 0, timeout: number = DEFAULT_DELAY_TIMEOUT): Promise<void> {
        return new Promise((resolve, reject) => {
            fn()
            .then(resolve)
            .catch(error => {
                if (retries === 0) {
                    return reject(error);
                }

                return this.delay(timeout)
                .then(() => this.retryPromise(fn, --retries, timeout))
                .then(resolve)
                .catch(retryError => reject(retryError));
            });
        });
    }

    private loadDevices(preFilters?: Array<USBDeviceFilter>): Promise<Array<Device>> {
        // Reset device cache
        this.devices = {};
        let devices = getDeviceList();

        if (preFilters) {
            // Pre-filter devices
            devices = this.preFilterDevices(devices, preFilters);
        }

        return this.serialPromises(this.loadDevice, devices);
    }

    private preFilterDevices(devices: Array<Device>, preFilters: Array<USBDeviceFilter>): Array<Device> {
        // Just pre-filter on vid/pid
        return devices.filter(device => preFilters.some(filter => {
            // Vendor
            if (filter.vendorId && filter.vendorId !== device.deviceDescriptor.idVendor) return false;

            // Product
            if (filter.productId && filter.productId !== device.deviceDescriptor.idProduct) return false;

            // Ignore serial number for node-usb as it requires device connection
            return true;
        }));
    }

    private loadDevice(device: Device, retries: number = 0): Promise<Device> {

        // Early guard against unsupported USB devices
        try {
            // tslint:disable-next-line:no-unused-expression
            device.configDescriptor;
            // tslint:disable-next-line:no-unused-expression
            device.allConfigDescriptors;
            // tslint:disable-next-line:no-unused-expression
            device.deviceDescriptor;
        } catch (_error) {
            return Promise.resolve(null);
        }

        return this.getCapabilities(device, retries)
        .then(capabilities => this.getWebCapability(capabilities))
        .then(capability => {
            return this.getWebUrl(device, capability)
            .then(url => {
                const handle = this.getDeviceHandle(device);
                this.devices[handle] = {
                    device: device,
                    url: url
                };
                return device;
            });
        });
    }

    private getCapabilities(device: Device, retries: number): Promise<Array<Capability>> {
        return new Promise((resolve, _reject) => {

            this.openDevice(device, retries)
            .then(() => {
                device.getCapabilities((error, capabilities) => {
                    try {
                        // Older macs (<10.12) can error with some host devices during a close at this point
                        device.close();
                    // tslint:disable-next-line:no-empty
                    } catch (_error) {}
                    if (error) return resolve([]);
                    resolve(capabilities);
                });
            })
            .catch(_error => {
                resolve([]);
            });
        });
    }

    private getWebCapability(capabilities: Array<Capability>): Capability {
        const platformCapabilities = capabilities.filter(capability => {
            return capability.type === 5;
        });

        const webCapability = platformCapabilities.find(capability => {
            const uuid = this.decodeUUID(capability.data.slice(1, 17));
            const version = capability.data.readUInt16LE(17);
            return uuid === CONSTANTS.WEB_UUID && version === CONSTANTS.CAPABILITY_VERSION;
        });

        return webCapability;
    }

    private decodeUUID(buffer: Buffer): string {
        const data1 = `00000000${buffer.readUInt32LE(0).toString(16)}`.slice(-8);
        const data2 = `0000${buffer.readUInt16LE(4).toString(16)}`.slice(-4);
        const data3 = `0000${buffer.readUInt16LE(6).toString(16)}`.slice(-4);

        const data4 = [];
        for (let i = 8; i < 10; i ++) {
            data4.push(`00${buffer.readUInt8(i).toString(16)}`.slice(-2));
        }

        const data5 = [];
        for (let i = 10; i < 16; i ++) {
            data5.push(`00${buffer.readUInt8(i).toString(16)}`.slice(-2));
        }

        return `${data1}-${data2}-${data3}-${data4.join("")}-${data5.join("")}`;
    }

    private getWebUrl(device: Device, capability: Capability, suppressErrors: boolean = true): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!capability || !capability.data || capability.data.byteLength < 20) return resolve(null);

            const vendor = capability.data.readUInt8(19);
            const page = capability.data.readUInt8(20);

            this.openDevice(device)
            .then(() => {
                device.controlTransfer(CONSTANTS.URL_REQUEST_TYPE, vendor, page, CONSTANTS.URL_REQUEST_INDEX, 64, (error, buffer) => {
                    device.close();

                    if (error) {
                        // An error may be due to the URL not existing
                        if (suppressErrors) return resolve(null);
                        else return reject(error);
                    }

                    // const length = buffer.readUInt8(0);
                    // const type = buffer.readUInt8(1);
                    let url = buffer.toString("utf8", 3);

                    const scheme = buffer.readUInt8(2); // 0 - http, 1 - https, 255 - in url
                    if (scheme === 0) url = "http://" + url;
                    if (scheme === 1) url = "https://" + url;

                    resolve(url);
                });
            })
            .catch(_error => {
                resolve("");
            });
        });
    }

    private devicetoUSBDevice(handle: string): Promise<USBDevice> {
        return new Promise((resolve, _reject) => {
            const device = this.devices[handle].device;
            const url = this.devices[handle].url;

            let configs: Array<ConfigDescriptor> = null;
            let configDescriptor: ConfigDescriptor = null;
            let deviceDescriptor: DeviceDescriptor = null;

            try {
                configDescriptor = device.configDescriptor;
                configs = device.allConfigDescriptors;
                deviceDescriptor = device.deviceDescriptor;
            } catch (_error) {
                return resolve(null);
            }

            if (!configs) return resolve(null);

            return this.serialDevicePromises(this.configToUSBConfiguration, device, configs)
            .then(configurations => {

                if (!deviceDescriptor) {
                    return resolve(new USBDevice({
                        _handle: this.getDeviceHandle(device),
                        url: url,
                        configurations: configurations
                    }));
                }

                const deviceVersion = this.decodeVersion(deviceDescriptor.bcdDevice);
                const usbVersion = this.decodeVersion(deviceDescriptor.bcdUSB);
                let manufacturerName = null;
                let productName = null;

                return this.getStringDescriptor(device, deviceDescriptor.iManufacturer)
                .then(name => {
                    manufacturerName = name;
                    return this.getStringDescriptor(device, deviceDescriptor.iProduct);
                })
                .then(name => {
                    productName = name;
                    return this.getStringDescriptor(device, deviceDescriptor.iSerialNumber);
                })
                .then(serialNumber => {
                    const props: Partial<USBDevice> = {
                        _handle: this.getDeviceHandle(device),
                        _maxPacketSize: deviceDescriptor.bMaxPacketSize0,
                        url: url,
                        deviceClass: deviceDescriptor.bDeviceClass,
                        deviceSubclass: deviceDescriptor.bDeviceSubClass,
                        deviceProtocol: deviceDescriptor.bDeviceProtocol,
                        productId: deviceDescriptor.idProduct,
                        vendorId: deviceDescriptor.idVendor,
                        deviceVersionMajor: deviceVersion.major,
                        deviceVersionMinor: deviceVersion.minor,
                        deviceVersionSubminor: deviceVersion.sub,
                        usbVersionMajor: usbVersion.major,
                        usbVersionMinor: usbVersion.minor,
                        usbVersionSubminor: usbVersion.sub,
                        manufacturerName: manufacturerName,
                        productName: productName,
                        serialNumber: serialNumber,
                        configurations: configurations,
                        _currentConfiguration: configDescriptor.bConfigurationValue
                    };
                    return resolve(new USBDevice(props));
                });
            }).catch(_error => {
                resolve(null);
            });
        });
    }

    private decodeVersion(version: number): { [key: string]: number } {
        const hex = `0000${version.toString(16)}`.slice(-4);
        return {
            major: parseInt(hex.substr(0, 2), null),
            minor: parseInt(hex.substr(2, 1), null),
            sub: parseInt(hex.substr(3, 1), null),
        };
    }

    private getStringDescriptor(device: Device, index: number): Promise<string> {
        return new Promise(resolve => {
            this.openDevice(device)
            .then(() => {
                device.getStringDescriptor(index, (error, buffer) => {
                    device.close();
                    resolve(error ? "" : buffer.toString());
                });
            })
            .catch(_error => {
                resolve("");
            });
        });
    }

    private bufferToDataView(buffer: Buffer): DataView {
        const arrayBuffer = new Uint8Array(buffer).buffer;
        return new DataView(arrayBuffer);
    }

    private bufferSourceToBuffer(bufferSource: ArrayBuffer | ArrayBufferView): Buffer {
        const arrayBuffer = ArrayBuffer.isView(bufferSource)
            ? bufferSource.buffer.slice(bufferSource.byteOffset, bufferSource.byteOffset + bufferSource.byteLength)
            : bufferSource;

        return Buffer.from(arrayBuffer);
    }

    private getEndpoint(device: Device, direction: USBDirection, endpointNumber: number): Endpoint {
        let endpoint: Endpoint = null;
        const address = endpointNumber | (direction === "in" ? LIBUSB_ENDPOINT_IN : LIBUSB_ENDPOINT_OUT);

        device.interfaces.some(iface => {
            const epoint = iface.endpoint(address);

            if (epoint) {
                endpoint = epoint;
                return true;
            }
            return false;
        });

        return endpoint;
    }

    private getInEndpoint(device: Device, endpointNumber: number): InEndpoint {
        const endpoint = this.getEndpoint(device, "in", endpointNumber);
        if (endpoint && endpoint.direction === "in") return (endpoint as InEndpoint);
    }

    private getOutEndpoint(device: Device, endpointNumber: number): OutEndpoint {
        const endpoint = this.getEndpoint(device, "out", endpointNumber);
        if (endpoint && endpoint.direction === "out") return (endpoint as OutEndpoint);
    }

    private endpointToUSBEndpoint(descriptor: EndpointDescriptor): USBEndpoint {
        const direction = descriptor.bEndpointAddress & LIBUSB_ENDPOINT_IN ? "in" : "out";
        return new USBEndpoint({
            endpointNumber: descriptor.bEndpointAddress ^ (direction === "in" ? LIBUSB_ENDPOINT_IN : LIBUSB_ENDPOINT_OUT),
            direction: direction,
            type: (descriptor.bmAttributes & CONSTANTS.LIBUSB_TRANSFER_TYPE_MASK) === LIBUSB_TRANSFER_TYPE_BULK ? "bulk"
                : (descriptor.bmAttributes & CONSTANTS.LIBUSB_TRANSFER_TYPE_MASK) === LIBUSB_TRANSFER_TYPE_INTERRUPT ? "interrupt"
                : "isochronous",
            packetSize: descriptor.wMaxPacketSize
        });
    }

    private interfaceToUSBAlternateInterface(device: Device, descriptor: InterfaceDescriptor): Promise<USBAlternateInterface> {
        return this.getStringDescriptor(device, descriptor.iInterface)
        .then(name => {
            return new USBAlternateInterface({
                alternateSetting: descriptor.bAlternateSetting,
                interfaceClass: descriptor.bInterfaceClass,
                interfaceSubclass: descriptor.bInterfaceSubClass,
                interfaceProtocol: descriptor.bInterfaceProtocol,
                interfaceName: name,
                endpoints: descriptor.endpoints.map(this.endpointToUSBEndpoint)
            });
        });
    }

    private interfacesToUSBInterface(device: Device, descriptors: Array<InterfaceDescriptor>): Promise<USBInterface> {
        return this.serialDevicePromises(this.interfaceToUSBAlternateInterface, device, descriptors)
        .then(alternates => {
            return new USBInterface({
                _handle: this.getDeviceHandle(device),
                interfaceNumber: descriptors[0].bInterfaceNumber,
                alternates: alternates
            });
        });
    }

    private configToUSBConfiguration(device: Device, descriptor: ConfigDescriptor): Promise<USBConfiguration> {
        return this.getStringDescriptor(device, descriptor.iConfiguration)
        .then(name => {
            const allInterfaces = descriptor.interfaces || [];

            return this.serialDevicePromises(this.interfacesToUSBInterface, device, allInterfaces)
            .then(interfaces => {
                return new USBConfiguration({
                    configurationValue: descriptor.bConfigurationValue,
                    configurationName: name,
                    interfaces: interfaces
                });
            });
        });
    }

    private getDevice(handle: string): Device {
        if (!this.devices[handle]) return null;
        return this.devices[handle].device;
    }

    private controlTransferParamsToType(setup: USBControlTransferParameters, direction: number): number {
        const recipient = setup.recipient === "device" ? LIBUSB_RECIPIENT_DEVICE
                        : setup.recipient === "interface" ? LIBUSB_RECIPIENT_INTERFACE
                        : setup.recipient === "endpoint" ? LIBUSB_RECIPIENT_ENDPOINT
                        : LIBUSB_RECIPIENT_OTHER;

        const requestType = setup.requestType === "standard" ? LIBUSB_REQUEST_TYPE_STANDARD
                          : setup.requestType === "class" ? LIBUSB_REQUEST_TYPE_CLASS
                          : LIBUSB_REQUEST_TYPE_VENDOR;

        return recipient | requestType | direction;
    }

    private openDevice(device: Device, retries: number = 0): Promise<void> {
        return this.retryPromise(() => {
            return new Promise<void>((resolve, reject) => {
                try {
                    device.open();
                } catch (error) {
                    return reject(error);
                }
                resolve();
            });
        }, retries);
    }

    public getConnected(handle: string): boolean {
        return this.getDevice(handle) !== null;
    }

    public getOpened(handle: string): boolean {
        const device = this.getDevice(handle);
        if (!device) return false;
        return (device.interfaces !== null);
    }

    public listUSBDevices(preFilters?: Array<USBDeviceFilter>): Promise<Array<USBDevice>> {
        return this.loadDevices(preFilters)
        .then(() => {
            return this.serialPromises(this.devicetoUSBDevice, Object.keys(this.devices));
        });
    }

    public open(handle: string): Promise<void> {
        const device = this.getDevice(handle);
        return this.openDevice(device);
    }

    public close(handle: string): Promise<void> {
        return new Promise((resolve, _reject) => {
            const device = this.getDevice(handle);
            device.close();
            resolve();
        });
    }

    public selectConfiguration(handle: string, id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);

            device.setConfiguration(id, error => {
                if (error) return reject(error);
                resolve();
            });
        });
    }

    public claimInterface(handle: string, address: number): Promise<void> {
        return new Promise((resolve, _reject) => {
            const device = this.getDevice(handle);

            device.interface(address).claim();
            resolve();
        });
    }

    public releaseInterface(handle: string, address: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);

            device.interface(address).release(true, error => {
                if (error) return reject(error);
                resolve();
            });
        });
    }

    public selectAlternateInterface(handle: string, interfaceNumber: number, alternateSetting: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const iface = device.interface(interfaceNumber);

            iface.setAltSetting(alternateSetting, error => {
                if (error) return reject(error);
                resolve();
            });
        });
    }

    public controlTransferIn(handle: string, setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const type = this.controlTransferParamsToType(setup, LIBUSB_ENDPOINT_IN);

            device.controlTransfer(type, setup.request, setup.value, setup.index, length, (error, buffer) => {
                if (error) {
                    if (error.errno === LIBUSB_TRANSFER_STALL) {
                        return resolve({
                            status: "stall"
                        });
                    } else if (error.errno === LIBUSB_TRANSFER_OVERFLOW) {
                        return resolve({
                            status: "babble"
                        });
                    }

                    return reject(error);
                }

                resolve({
                    data: this.bufferToDataView(buffer),
                    status: "ok"
                });
            });
        });
    }

    public controlTransferOut(handle: string, setup: USBControlTransferParameters, data?: ArrayBuffer | ArrayBufferView): Promise<USBOutTransferResult> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const type = this.controlTransferParamsToType(setup, LIBUSB_ENDPOINT_OUT);
            const buffer = data ? this.bufferSourceToBuffer(data) : new Buffer(0);

            device.controlTransfer(type, setup.request, setup.value, setup.index, buffer, error => {
                if (error) {
                    if (error.errno === LIBUSB_TRANSFER_STALL) {
                        return resolve({
                            bytesWritten: 0,
                            status: "stall"
                        });
                    }

                    return reject(error);
                }

                resolve({
                    bytesWritten: buffer.byteLength, // hack, should be bytes actually written
                    status: "ok" // hack
                });
            });
        });
    }

    public clearHalt(handle: string, direction: USBDirection, endpointNumber: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const wIndex = endpointNumber | (direction === "in" ? LIBUSB_ENDPOINT_IN : LIBUSB_ENDPOINT_OUT);
            device.controlTransfer(LIBUSB_RECIPIENT_ENDPOINT, CONSTANTS.CLEAR_FEATURE, CONSTANTS.ENDPOINT_HALT, wIndex, 0, error => {
                if (error) return reject(error);
                resolve();
            });
        });
    }

    public transferIn(handle: string, endpointNumber: number, length: number): Promise<USBInTransferResult> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const endpoint = this.getInEndpoint(device, endpointNumber);

            endpoint.transfer(length, (error, data) => {
                if (error) {
                    if (error.errno === LIBUSB_TRANSFER_STALL) {
                        return resolve({
                            status: "stall"
                        });
                    } else if (error.errno === LIBUSB_TRANSFER_OVERFLOW) {
                        return resolve({
                            status: "babble"
                        });
                    }

                    return reject(error);
                }

                resolve({
                    data: this.bufferToDataView(data),
                    status: "ok"
                });
            });
        });
    }

    public transferOut(handle: string, endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const endpoint = this.getOutEndpoint(device, endpointNumber);
            const buffer = this.bufferSourceToBuffer(data);

            endpoint.transfer(buffer, error => {
                if (error) {
                    if (error.errno === LIBUSB_TRANSFER_STALL) {
                        return resolve({
                            bytesWritten: 0,
                            status: "stall"
                        });
                    }

                    return reject(error);
                }

                resolve({
                    bytesWritten: buffer.byteLength, // hack, should be bytes actually written
                    status: "ok" // hack
                });
            });
        });
    }

    public isochronousTransferIn(_handle: string, _endpointNumber: number, _packetLengths: Array<number>): Promise<USBIsochronousInTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("isochronousTransferIn error: method not implemented");
        });
    }

    public isochronousTransferOut(_handle: string, _endpointNumber: number, _data: BufferSource, _packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("isochronousTransferOut error: method not implemented");
        });
    }

    public reset(handle: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            device.reset(error => {
                if (error) return reject(error);
                resolve();
            });
        });
    }
}

/**
 * @hidden
 */
export const adapter = new USBAdapter();
