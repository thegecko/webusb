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

import { USBRequestType, USBRecipient, USBTransferStatus } from "./enums";
import { USBDevice } from "./device";

/**
 * USB Options interface
 */
export interface USBOptions {
    /**
     * A `device found` callback function to allow the user to select a device
     */
    devicesFound?: (devices: Array<USBDevice>, selectFn: (device: USBDevice) => void) => USBDevice;
}

export interface USBDeviceFilter {
    vendorId?: number;
    productId?: number;
    classCode?: number;
    subclassCode?: number;
    protocolCode?: number;
    serialnumber?: string;
}

export interface USBDeviceRequestOptions {
    filters: Array<USBDeviceFilter>;
    deviceFound?: (device: USBDevice, selectFn: any) => void;
}

export interface USBControlTransferParameters {
    requestType: USBRequestType;
    recipient: USBRecipient;
    request: number;
    value: number;
    index: number;
}

export interface USBInTransferResult {
    data?: DataView;
    status: USBTransferStatus;
}

export interface USBOutTransferResult {
    bytesWritten: number;
    status: USBTransferStatus;
}

/**
 * @hidden
 */
export interface USBIsochronousInTransferPacket {
    data?: DataView;
    status: USBTransferStatus;
}

/**
 * @hidden
 */
export interface USBIsochronousInTransferResult {
    data?: DataView;
    packets: Array<USBIsochronousInTransferPacket>;
}

/**
 * @hidden
 */
export interface USBIsochronousOutTransferPacket {
    bytesWritten: number;
    status: USBTransferStatus;
}

/**
 * @hidden
 */
export interface USBIsochronousOutTransferResult {
    packets: Array<USBIsochronousOutTransferPacket>;
}
