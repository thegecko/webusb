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
export interface Adapter {
    findDevices: () => Promise<Array<Partial<USBDevice>>>;
}

/**
 * @hidden
 */
export class USBAdapter implements Adapter {

    private getWebCapability(device) {
        device.open();
        const platformCapabilities = device.capabilities.filter(capability => {
            return capability.type === 5;
        });
        device.close();

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
            const REQUEST_TYPE = 192; // 11000000B;
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

            const promises = getDeviceList().reduce((sequence, device) => {
                const capability = this.getWebCapability(device);
                if (capability) {
                    sequence.push(
                        this.getWebUrl(device, capability)
                        .then(url => {
                            const props: Partial<USBDevice> = {
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
                        })
                    );
                }
                return sequence;
            }, []);

            return Promise.all(promises)
            .then(devices => resolve(devices));
        });
    }
}

/**
 * @hidden
 */
export const adapter = new USBAdapter();
