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
import { USBDeviceRequestOptions } from "./interfaces";
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

    /**
     * USB constructor
     * @param init A partial class to initialise values
     */
    constructor() {
        super();
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
     * Requests a sungle Web USB device
     * @returns Promise containing the selected device
     */
    public requestDevice(_options: USBDeviceRequestOptions): Promise<USBDevice> {
        return new Promise((resolve, _reject) => {
            adapter.findDevices()
            .then(foundDevices => {
                const devices = foundDevices.map(device => {
                    return new USBDevice(device);
                });

                resolve(devices[0]);
            });
        });
    }
}
