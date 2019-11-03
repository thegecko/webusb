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

import { EventDispatcher } from "./dispatcher";
import { USBDevice } from "./device";
import { USBOptions, USBDeviceRequestOptions } from "./interfaces";
import { USBAdapter, adapter } from "./adapter";

/**
 * USB class
 */
export class USB extends EventDispatcher {
    /**
     * Allowed device Connected event
     * @event
     */
    public static EVENT_DEVICE_CONNECT: string = "connect";

    /**
     * Allowed device Disconnected event
     * @event
     */
    public static EVENT_DEVICE_DISCONNECT: string = "disconnect";

    private allowedDevices: Array<USBDevice> = [];
    private devicesFound: (devices: Array<USBDevice>, selectFn?: (device: USBDevice) => void) => USBDevice | void;

    /**
     * USB constructor
     * @param options USB initialisation options
     */
    constructor(options?: USBOptions) {
        super();

        options = options || {};
        this.devicesFound = options.devicesFound;

        adapter.addListener(USBAdapter.EVENT_DEVICE_CONNECT, device => {
            if (this.replaceAllowedDevice(device)) {
                this.emit(USB.EVENT_DEVICE_CONNECT, device);
            }
        });

        adapter.addListener(USBAdapter.EVENT_DEVICE_DISCONNECT, handle => {
            const allowedDevice = this.allowedDevices.find(allowedDevices => allowedDevices._handle === handle);

            if (allowedDevice) {
                this.emit(USB.EVENT_DEVICE_DISCONNECT, allowedDevice);

                // Delete device from cache
                const index = this.allowedDevices.indexOf(allowedDevice);
                this.allowedDevices.splice(index, 1);
            }
        });
    }

    private replaceAllowedDevice(device: USBDevice): boolean {
        for (const i in this.allowedDevices) {
            if (this.allowedDevices[i].productId === device.productId
                && this.allowedDevices[i].vendorId === device.vendorId
                && this.allowedDevices[i].serialNumber === device.serialNumber) {
                this.allowedDevices[i] = device;
                return true;
            }
        }

        return false;
    }

    private filterDevice(options: USBDeviceRequestOptions, device: USBDevice): boolean {
        return options.filters.some(filter => {
            // Vendor
            if (filter.vendorId && filter.vendorId !== device.vendorId) return false;

            // Product
            if (filter.productId && filter.productId !== device.productId) return false;

            // Class
            if (filter.classCode) {

                // Interface Descriptors
                const match = device.configuration.interfaces.some(iface => {
                    // Class
                    if (filter.classCode && filter.classCode !== iface.alternate.interfaceClass) return false;

                    // Subclass
                    if (filter.subclassCode && filter.subclassCode !== iface.alternate.interfaceSubclass) return false;

                    // Protocol
                    if (filter.protocolCode && filter.protocolCode !== iface.alternate.interfaceProtocol) return false;

                    return true;
                });

                if (match) return true;
            }

            // Class
            if (filter.classCode && filter.classCode !== device.deviceClass) return false;

            // Subclass
            if (filter.subclassCode && filter.subclassCode !== device.deviceSubclass) return false;

            // Protocol
            if (filter.protocolCode && filter.protocolCode !== device.deviceProtocol) return false;

            // Serial
            if (filter.serialnumber && filter.serialnumber !== device.serialNumber) return false;

            return true;
        });
    }

    /**
     * Gets all allowed Web USB devices
     * @returns Promise containing an array of devices
     */
    public getDevices(): Promise<Array<USBDevice>> {
        return new Promise((resolve, _reject) => {
            resolve(this.allowedDevices);
        });
    }

    /**
     * Requests a single Web USB device
     * @param options The options to use when scanning
     * @returns Promise containing the selected device
     */
    public requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice> {
        return new Promise((resolve, reject) => {
            // Must have options
            if (!options) {
                return reject(new TypeError("requestDevice error: 1 argument required, but only 0 present"));
            }

            // Options must be an object
            if (options.constructor !== {}.constructor) {
                return reject(new TypeError("requestDevice error: parameter 1 (options) is not an object"));
            }

            // Must have a filter
            if (!options.filters) {
                return reject(new TypeError("requestDevice error: required member filters is undefined"));
            }

            // Filter must be an array
            if (options.filters.constructor !== [].constructor) {
                return reject(new TypeError("requestDevice error: the provided value cannot be converted to a sequence"));
            }

            // Check filters
            const check = options.filters.every(filter => {

                // Protocol & Subclass
                if (filter.protocolCode && !filter.subclassCode) {
                    reject(new TypeError("requestDevice error: subclass code is required"));
                    return false;
                }

                // Subclass & Class
                if (filter.subclassCode && !filter.classCode) {
                    reject(new TypeError("requestDevice error: class code is required"));
                    return false;
                }

                return true;
            });

            if (!check) return;

            return adapter.listUSBDevices()
            .then(devices => {
                devices = devices.filter(device => this.filterDevice(options, device));

                if (devices.length === 0) {
                    return reject(new Error("requestDevice error: no devices found"));
                }

                function selectFn(device: USBDevice) {
                    if (!this.replaceAllowedDevice(device)) this.allowedDevices.push(device);
                    resolve(device);
                }

                // If no devicesFound function, select the first device found
                if (!this.devicesFound) return selectFn.call(this, devices[0]);

                const selectedDevice = this.devicesFound(devices, selectFn.bind(this));
                if (selectedDevice) selectFn.call(this, selectedDevice);
            }).catch(error => {
                reject(new Error(`requestDevice error: ${error}`));
            });
        });
    }
}
