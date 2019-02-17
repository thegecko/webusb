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
 * USB Options
 */
export interface USBOptions {
    /**
     * A `device found` callback function to allow the user to select a device
     */
    devicesFound?: (devices: Array<USBDevice>, selectFn?: (device: USBDevice) => void) => USBDevice | void;
}

/**
 * Device filter
 */
export interface USBDeviceFilter {
    vendorId?: number;
    productId?: number;
    classCode?: number;
    subclassCode?: number;
    protocolCode?: number;
    serialnumber?: string;
}

/**
 * Device request options
 */
export interface USBDeviceRequestOptions {
    filters: Array<USBDeviceFilter>;
}

/**
 * Control transfer parameters
 */
export interface USBControlTransferParameters {
    requestType: USBRequestType;
    recipient: USBRecipient;
    request: number;
    value: number;
    index: number;
}

/**
 * In transfer result
 */
export interface USBInTransferResult {
    data?: DataView;
    status: USBTransferStatus;
}

/**
 * Out transfer result
 */
export interface USBOutTransferResult {
    bytesWritten: number;
    status: USBTransferStatus;
}

/**
 * @hidden
 * Isochronous transfer packet (in)
 */
export interface USBIsochronousInTransferPacket {
    data?: DataView;
    status: USBTransferStatus;
}

/**
 * @hidden
 * Isochronous transfer result (in)
 */
export interface USBIsochronousInTransferResult {
    data?: DataView;
    packets: Array<USBIsochronousInTransferPacket>;
}

/**
 * @hidden
 * Isochronous transfer packet (out)
 */
export interface USBIsochronousOutTransferPacket {
    bytesWritten: number;
    status: USBTransferStatus;
}

/**
 * @hidden
 * Isochronous transfer result (out)
 */
export interface USBIsochronousOutTransferResult {
    packets: Array<USBIsochronousOutTransferPacket>;
}
