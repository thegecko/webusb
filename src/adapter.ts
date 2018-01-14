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
import { getDeviceList, Device, Endpoint, InEndpoint, OutEndpoint, ConfigDescriptor, InterfaceDescriptor, on } from "usb";
import { USBDevice } from "./device";
import { USBTransferStatus, USBDirection } from "./enums";
import { USBControlTransferParameters, USBInTransferResult, USBOutTransferResult, USBConfiguration, USBInterface, USBAlternateInterface, USBEndpoint, USBIsochronousInTransferResult, USBIsochronousOutTransferResult } from "./interfaces";

/**
 * @hidden
 */
const usb = {
    LIBUSB_ENDPOINT_IN: 0x80,
    LIBUSB_REQUEST_GET_DESCRIPTOR: 0x06,
    LIBUSB_DT_BOS: 0x0f,
    LIBUSB_DT_BOS_SIZE: 5
};

/**
 * @hidden
 */
export class USBAdapter extends EventEmitter {

    public static EVENT_DEVICE_CONNECT: string = "connect";
    public static EVENT_DEVICE_DISCONNECT: string = "disconnect";

    private devices: { [key: string]: { device: Device, url: string }} = {};

    constructor() {
        super();

        on("attach", device => {
            this.loadDevice(device)
            .then(loadedDevice => {
                if (loadedDevice) {
                    this.devicetoUSBDevice(loadedDevice.deviceAddress.toString())
                    .then(usbDevice => {
                        this.emit(USBAdapter.EVENT_DEVICE_CONNECT, usbDevice);
                    });
                }
            });
        });

        on("detach", device => {
            if (device.deviceAddress) {
                const address = device.deviceAddress.toString();
                if (this.devices[address]) {
                    this.emit(USBAdapter.EVENT_DEVICE_DISCONNECT, address);
                    delete this.devices[address];
                }
            }
        });
    }

    private loadDevices(): Promise<Array<Device>> {
        const promises: Array<Promise<Device>> = getDeviceList().map(this.loadDevice.bind(this));
        return Promise.all(promises);
    }

    private loadDevice(device: Device): Promise<Device> {
        return this.getCapabilities(device)
        .then(capabilities => this.getWebCapability(capabilities))
        .then(capability => {
            if (!capability) return null;

            return this.getWebUrl(device, capability)
            .then(url => {
                this.devices[device.deviceAddress.toString()] = {
                    device: device,
                    url: url
                };
                return device;
            });
        });
    }

    private getCapabilities(device: Device): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                device.open();
            } catch (_e) {
                resolve([]);
            }
            // device.getCapabilities((error, capabilities) => {
            this.getDeviceCapabilities(device, (error, capabilities) => {
                device.close();
                if (error) return reject(error);
                resolve(capabilities);
            });
        });
    }

    private getDeviceCapabilities(device: Device, callback: (error: string, capabilities: any) => any) {
        const capabilities = [];

        this.getBosDescriptor(device, (error, descriptor) => {
            if (error) return callback(error, null);

            const len = descriptor ? descriptor.capabilities.length : 0;
            for (let i = 0; i < len; i++) {
                capabilities.push({
                    device: device,
                    id: i,
                    descriptor: descriptor.capabilities[i],
                    type: descriptor.capabilities[i].bDevCapabilityType,
                    data: descriptor.capabilities[i].dev_capability_data
                });
            }

            callback(undefined, capabilities);
        });
    }

    private getBosDescriptor(device: Device, callback: (error: string, descriptor: any) => any) {

        if (device.deviceDescriptor.bcdUSB < 0x201) {
            // BOS is only supported from USB 2.0.1
            return callback(undefined, null);
        }

        device.controlTransfer(
            usb.LIBUSB_ENDPOINT_IN,
            usb.LIBUSB_REQUEST_GET_DESCRIPTOR,
            (usb.LIBUSB_DT_BOS << 8),
            0,
            usb.LIBUSB_DT_BOS_SIZE,
            (error1, buffer1) => {
                if (error1) return callback(undefined, null);

                const totalLength = buffer1.readUInt16LE(2);
                device.controlTransfer(
                    usb.LIBUSB_ENDPOINT_IN,
                    usb.LIBUSB_REQUEST_GET_DESCRIPTOR,
                    (usb.LIBUSB_DT_BOS << 8),
                    0,
                    totalLength,
                    (error, buffer) => {
                        if (error) return callback(undefined, null);

                        const descriptor = {
                            bLength: buffer.readUInt8(0),
                            bDescriptorType: buffer.readUInt8(1),
                            wTotalLength: buffer.readUInt16LE(2),
                            bNumDeviceCaps: buffer.readUInt8(4),
                            capabilities: []
                        };

                        let i = usb.LIBUSB_DT_BOS_SIZE;
                        while (i < descriptor.wTotalLength) {
                            const capability: any = {
                                bLength: buffer.readUInt8(i + 0),
                                bDescriptorType: buffer.readUInt8(i + 1),
                                bDevCapabilityType: buffer.readUInt8(i + 2)
                            };

                            capability.dev_capability_data = buffer.slice(i + 3, i + capability.bLength);
                            descriptor.capabilities.push(capability);
                            i += capability.bLength;
                        }

                        // Cache descriptor
                        callback(undefined, descriptor);
                    }
                );
            }
        );
    }

    private getWebCapability(capabilities: any): any {
        const platformCapabilities = capabilities.filter(capability => {
            return capability.type === 5;
        });

        const webCapability = platformCapabilities.find(capability => {
            const version = capability.data.readUInt16LE(17);
            return version === 256;

            // var uuid = unparse(data, 1);//.readUInt16LE(1);
            // console.log(uuid); // {3408b638-09a9-47a0-8bfd-a0768815b665}
        });

        return webCapability;
    }

    private getWebUrl(device: Device, capability: any): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!capability || !capability.data || capability.data.byteLength < 20) return null;

            const REQUEST_TYPE = 0xC0;
            const GET_URL = 2;

            const vendor = capability.data.readUInt8(19);
            const page = capability.data.readUInt8(20);

            device.open();
            device.controlTransfer(REQUEST_TYPE, vendor, page, GET_URL, 64, (error, buffer) => {
                device.close();
                if (error) return reject(error);

                // const length = buffer.readUInt8(0);
                // const type = buffer.readUInt8(1);
                let url = buffer.toString("utf8", 3);

                const scheme = buffer.readUInt8(2); // 0 - http, 1 - https, 255 - in url
                if (scheme === 0) url = "http://" + url;
                if (scheme === 1) url = "https://" + url;

                resolve(url);
            });
        });
    }

    private devicetoUSBDevice(handle: string): Promise<USBDevice> {
        return new Promise((resolve, _reject) => {
            const device = this.devices[handle].device;
            const url = this.devices[handle].url;

            if (!device.deviceDescriptor) {
                return resolve(new USBDevice({
                    _handle: device.deviceAddress.toString(),
                    url: url
                }));
            }

            const descriptor = device.deviceDescriptor;
            const deviceVersion = this.decodeVersion(descriptor.bcdDevice);
            const usbVersion = this.decodeVersion(descriptor.bcdUSB);
            let manufacturerName = null;
            let productName = null;

            return this.getStringDescriptor(device, descriptor.iManufacturer)
            .then(name => {
                manufacturerName = name;
                return this.getStringDescriptor(device, descriptor.iProduct);
            })
            .then(name => {
                productName = name;
                return this.getStringDescriptor(device, descriptor.iSerialNumber);
            })
            .then(serialNumber => {
                const props: Partial<USBDevice> = {
                    _handle: device.deviceAddress.toString(),
                    url: url,
                    deviceClass: descriptor.bDeviceClass,
                    deviceSubclass: descriptor.bDeviceSubClass,
                    deviceProtocol: descriptor.bDeviceProtocol,
                    productId: descriptor.idProduct,
                    vendorId: descriptor.idVendor,
                    deviceVersionMajor: deviceVersion.major,
                    deviceVersionMinor: deviceVersion.minor,
                    deviceVersionSubminor: deviceVersion.sub,
                    usbVersionMajor: usbVersion.major,
                    usbVersionMinor: usbVersion.minor,
                    usbVersionSubminor: usbVersion.sub,
                    manufacturerName: manufacturerName,
                    productName: productName,
                    serialNumber: serialNumber
                };
                return resolve(new USBDevice(props));
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
        return new Promise((resolve, reject) => {
            device.open();
            device.getStringDescriptor(index, (error, buffer) => {
                device.close();
                if (error) return reject(error);
                resolve(buffer.toString());
            });
        });
    }

    private bufferToDataView(buffer): DataView {
        // Buffer to ArrayBuffer
        const arrayBuffer = new Uint8Array(buffer).buffer;
        return new DataView(arrayBuffer);
    }

    private bufferSourceToBuffer(bufferSource: ArrayBuffer | ArrayBufferView): Buffer {
        function isView(source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView {
            return (source as ArrayBufferView).buffer !== undefined;
        }

        const arrayBuffer = isView(bufferSource) ? bufferSource.buffer : bufferSource;
        return this.arrayBufferToBuffer(arrayBuffer);
    }

    private arrayBufferToBuffer(arrayBuffer: ArrayBuffer): Buffer {
        return new Buffer(arrayBuffer);
    }
/*
    private dataViewToBuffer(dataView) {
        // DataView to TypedArray
        const typedArray = new Uint8Array(dataView.buffer);
        return new Buffer(typedArray);
    }
*/
    private getEndpoint(device: Device, endpointNumber: number): Endpoint {
        let endpoint: Endpoint = null;

        device.interfaces.some(iface => {
            const epoint = iface.endpoint(endpointNumber);

            if (epoint) {
                endpoint = epoint;
                return true;
            }
        });

        return endpoint;
    }

    private getInEndpoint(device: Device, endpointNumber: number): InEndpoint {
        const endpoint = this.getEndpoint(device, endpointNumber);
        if (endpoint && endpoint.direction === "in") return (endpoint as InEndpoint);
    }

    private getOutEndpoint(device: Device, endpointNumber: number): OutEndpoint {
        const endpoint = this.getEndpoint(device, endpointNumber);
        if (endpoint && endpoint.direction === "out") return (endpoint as OutEndpoint);
    }

    private endpointToUSBEndpoint(endpoint: Endpoint): USBEndpoint {
        return {
            endpointNumber: endpoint.descriptor.bEndpointAddress,
            direction: endpoint.direction === "in" ? "in" : "out",
            type: endpoint.descriptor.bDescriptorType,
            packetSize: endpoint.descriptor.wMaxPacketSize
        };
    }

    private interfaceToUSBAlternateInterface(iface: InterfaceDescriptor): USBAlternateInterface {
        return {
            alternateSetting: iface.bAlternateSetting,
            interfaceClass: iface.bInterfaceClass,
            interfaceSubclass: iface.bInterfaceSubClass,
            interfaceProtocol: iface.bInterfaceProtocol,
            interfaceName: "unknown",
            endpoints: []  // iface.endpoints.map(this.endpointToUSBEndpoint)
        };
    }

    private interfacesToUSBInterface(interfaces: Array<InterfaceDescriptor>): USBInterface {
        const alternate = interfaces.find(iface => iface.bAlternateSetting === 0);

        return {
            interfaceNumber: alternate.bInterfaceNumber,
            alternate: this.interfaceToUSBAlternateInterface(alternate),
            alternates: interfaces.map(this.interfaceToUSBAlternateInterface),
            claimed: false // iface.descriptor
        };
    }

    private configDescriptorToUSBConfiguration(descriptor: ConfigDescriptor): USBConfiguration {
        // tslint:disable-next-line:no-string-literal
        const allInterfaces: Array<Array<InterfaceDescriptor>> = descriptor["interfaces"] || [];

        return {
            configurationValue: descriptor.bConfigurationValue,
            configurationName: "unknown",
            interfaces: allInterfaces.map(interfaces => this.interfacesToUSBInterface(interfaces))
        };
    }

    private getDevice(handle: string): Device {
        return this.devices[handle].device;
    }

    public getUSBDevices(): Promise<Array<USBDevice>> {
        return this.loadDevices()
        .then(() => {
            const promises: Array<Promise<USBDevice>> = Object.keys(this.devices).map(key => this.devicetoUSBDevice(key));
            return Promise.all(promises);
        });
    }

    public open(handle: string): Promise<void> {
        return new Promise((resolve, _reject) => {
            const device = this.getDevice(handle);
            device.open();
            resolve();
        });
    }

    public close(handle: string): Promise<void> {
        return new Promise((resolve, _reject) => {
            const device = this.getDevice(handle);
            device.close();
            resolve();
        });
    }

    public getOpened(handle: string): boolean {
        const device = this.getDevice(handle);
        return (device.interfaces !== null);
    }

    public getConfiguration(handle: string): USBConfiguration {
        const device = this.getDevice(handle);
        const config: USBConfiguration = this.configDescriptorToUSBConfiguration(device.configDescriptor);

        config.interfaces.forEach(iface => {
            const endpoints = device.interface(iface.interfaceNumber).endpoints.map(this.endpointToUSBEndpoint);
            iface.alternate.endpoints = endpoints;
            iface.alternates.find(alt => alt.alternateSetting === iface.alternate.alternateSetting).endpoints = endpoints;
        });
        return config;
    }

    public getConfigurations(handle: string): Array<USBConfiguration> {
        // tslint:disable-next-line:no-string-literal
        const configs: Array<ConfigDescriptor> = handle["allConfigDescriptors"];

        return configs.map(config => {
            return this.configDescriptorToUSBConfiguration(config);
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
            // device.interface(address).release(true, error => {
            device.interface(address).release(error => {
                if (error) return reject(error);
                resolve();
            });
        });
    }

    public selectAlternateInterface(handle: string, interfaceNumber: number, alternateSetting: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const iface = device.interface(interfaceNumber);
            if (!iface) return reject("selectAlternateInterface error");

            iface.setAltSetting(alternateSetting, error => {
                if (error) return reject(error);
                resolve();
            });
        });
    }

    public controlTransferIn(handle: string, setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const type = (setup.recipient | setup.requestType | 0x80);

            device.controlTransfer(type, setup.request, setup.value, setup.index, length, (error, buffer) => {
                if (error) return reject(error);
                resolve({
                    data: this.bufferToDataView(buffer),
                    status: USBTransferStatus.ok
                });
            });
        });
    }

    public controlTransferOut(handle: string, setup: USBControlTransferParameters, data: ArrayBuffer | ArrayBufferView): Promise<USBOutTransferResult> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const type = (setup.recipient | setup.requestType | 0x00);
            const buffer = this.bufferSourceToBuffer(data);

            device.controlTransfer(type, setup.request, setup.value, setup.index, buffer, error => {
                if (error) return reject(error);
                resolve({
                    bytesWritten: buffer.byteLength,
                    status: USBTransferStatus.ok
                });
            });
        });
    }

    public transferIn(handle: string, endpointNumber: number, length: number): Promise<USBInTransferResult> {
        return new Promise((resolve, reject) => {
            const device = this.getDevice(handle);
            const endpoint = this.getInEndpoint(device, endpointNumber);

            endpoint.transfer(length, (error, data) => {
                if (error) return reject(error);
                resolve({
                    data: this.bufferToDataView(data),
                    status: USBTransferStatus.ok
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
                if (error) return reject(error);
                resolve({
                    bytesWritten: buffer.byteLength, // hack
                    status: USBTransferStatus.ok
                });
            });
        });
    }

    public clearHalt(_handle: string, _direction: USBDirection, _endpointNumber: number): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
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
