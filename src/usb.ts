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
import { adapter } from "./adapter";

/**
 * USB class
 */
export class USB extends EventDispatcher {
    /**
     * Device Connected event
     * @event
     */
    public static EVENT_DEVICE_CONNECT: string = "connect";

    /**
     * Device Disconnected event
     * @event
     */
    public static EVENT_DEVICE_DISCONNECT: string = "disconnect";

    private devicesFound: (devices: Array<USBDevice>, selectFn: (device: USBDevice) => void) => USBDevice = null;

    /**
     * USB constructor
     * @param options USB initialisation options
     */
    constructor(options?: USBOptions) {
        super();

        options = options || {};
        this.devicesFound = options.devicesFound;
    }

    private filterDevice(options: USBDeviceRequestOptions, device: USBDevice): boolean {
        return options.filters.every(filter => {
            // Vendor
            if (filter.vendorId && filter.vendorId !== device.vendorId) return;

            // Product
            if (filter.productId && filter.productId !== device.productId) return;

            // Class
            if (filter.classCode && filter.classCode !== device.deviceClass) return;

            // Subclass
            if (filter.subclassCode && filter.subclassCode !== device.deviceSubclass) return;

            // Protocol
            if (filter.protocolCode && filter.protocolCode !== device.deviceProtocol) return;

            // Serial
            if (filter.serialnumber && filter.serialnumber !== device.serialNumber) return;

            return true;
        });
    }

    /**
     * Gets all Web USB devices connected to the system
     * @returns Promise containing an array of devices
     */
    public getDevices(): Promise<Array<USBDevice>> {
        return new Promise((resolve, _reject) => {
            adapter.findDevices()
            .then(foundDevices => {
                resolve(foundDevices.map(device => new USBDevice(device)));
            });
        });
    }

    /**
     * Requests a single Web USB device
     * @param options The options to use when scanning
     * @returns Promise containing the selected device
     */
    public requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice> {
        return new Promise((resolve, reject) => {
            options = options || {
                filters: []
            };

            // Must have a filter
            if (!options.filters || options.filters.length === 0) {
                return reject(new TypeError("requestDevice error: no filters specified"));
            }

            // Don't allow empty filters
            const emptyFilter = options.filters.some(filter => {
                return (Object.keys(filter).length === 0);
            });
            if (emptyFilter) {
                return reject(new TypeError("requestDevice error: empty filter specified"));
            }

            return this.getDevices()
            .then(devices => {
                devices = devices.filter(device => this.filterDevice(options, device));
                // If no deviceFound function, resolve with the first device found
                if (!this.devicesFound) return resolve(devices[0]);

                function selectFn(device: USBDevice) {
                    resolve(device);
                }

                const selectedDevice = this.devicesFound(devices, selectFn.bind(this));
                if (selectedDevice) resolve(selectedDevice);
            }).catch(error => {
                reject(`requestDevice error: ${error}`);
            });
        });
    }
}
