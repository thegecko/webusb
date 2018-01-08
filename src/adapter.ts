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

import { getDeviceList, Device } from "usb";
import { USBDevice } from "./device";

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
export interface Adapter {
    findDevices: () => Promise<Array<Partial<USBDevice>>>;
}

/**
 * @hidden
 */
export class USBAdapter implements Adapter {

    private getBosDescriptor(device, callback) {

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

    private getDeviceCapabilities(device, callback) {
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

    private getCapabilities(device) {
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

    private getWebCapability(capabilities) {
        const platformCapabilities = capabilities.filter(capability => {
            return capability.type === 5;
        });

        const webCapability = platformCapabilities.find(capability => {
            const version = capability.data.readUInt16LE(17);
            return version === 256;

            // var uuid = unparse(data, 1);//.readUInt16LE(1);
            // console.log(uuid); // {3408b638-09a9-47a0-8bfd-a0768815b665}
        });

        if (webCapability) {
            return {
                vendor: webCapability.data.readUInt8(19),
                page: webCapability.data.readUInt8(20)
            };
        }

        return null;
    }

    private getWebUrl(device, capability): Promise<string> {
        return new Promise((resolve, reject) => {
            const REQUEST_TYPE = 0xC0;
            const GET_URL = 2;

            device.open();
            device.controlTransfer(REQUEST_TYPE, capability.vendor, capability.page, GET_URL, 64, (error, buffer) => {
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

    private decodeVersion(version: number): { [key: string]: number } {
        const hex = `0000${version.toString(16)}`.slice(-4);
        return {
            major: parseInt(hex.substr(0, 2), null),
            minor: parseInt(hex.substr(2, 1), null),
            sub: parseInt(hex.substr(3, 1), null),
        };
    }

    public findDevices(): Promise<Array<Partial<USBDevice>>> {
        return new Promise((resolve, _reject) => {
            const promises = getDeviceList().map(device => {
                return this.getCapabilities(device)
                .then(capabilities => this.getWebCapability(capabilities))
                .then(capability => {
                    if (!capability) return null;

                    return this.getWebUrl(device, capability)
                    .then(url => {
                        const props: any = {
                            url: url
                        };

                        if (!device.deviceDescriptor) return props;

                        const descriptor = device.deviceDescriptor;
                        props.deviceClass = descriptor.bDeviceClass;
                        props.deviceSubclass = descriptor.bDeviceSubClass;
                        props.deviceProtocol = descriptor.bDeviceProtocol;

                        props.productId = descriptor.idProduct;
                        props.vendorId = descriptor.idVendor;

                        const deviceVersion = this.decodeVersion(descriptor.bcdDevice);
                        props.deviceVersionMajor = deviceVersion.major;
                        props.deviceVersionMinor = deviceVersion.minor;
                        props.deviceVersionSubminor = deviceVersion.sub;

                        const usbVersion = this.decodeVersion(descriptor.bcdUSB);
                        props.usbVersionMajor = usbVersion.major;
                        props.usbVersionMinor = usbVersion.minor;
                        props.usbVersionSubminor = usbVersion.sub;

                        return this.getStringDescriptor(device, descriptor.iManufacturer)
                        .then(manufacturerName => {
                            props.manufacturerName = manufacturerName;
                            return this.getStringDescriptor(device, descriptor.iProduct);
                        })
                        .then(productName => {
                            props.productName = productName;
                            return this.getStringDescriptor(device, descriptor.iSerialNumber);
                        })
                        .then(serialNumber => {
                            props.serialNumber = serialNumber;
                            return props;
                        });
                    });
                });
            });

            return Promise.all(promises)
            .then(devices => {
                const filtered = devices.filter(device => device);
                resolve(filtered);
            });
        });
    }
}

/**
 * @hidden
 */
export const adapter = new USBAdapter();
