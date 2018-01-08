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

import { USBConfiguration, USBDirection, USBControlTransferParameters, USBInTransferResult, USBOutTransferResult, USBIsochronousInTransferResult, USBIsochronousOutTransferResult } from "./interfaces";

/**
 * USB Device class
 */
export class USBDevice {

    public readonly usbVersionMajor: number;
    public readonly usbVersionMinor: number;
    public readonly usbVersionSubminor: number;
    public readonly deviceClass: number;
    public readonly deviceSubclass: number;
    public readonly deviceProtocol: number;
    public readonly vendorId: number;
    public readonly productId: number;
    public readonly deviceVersionMajor: number;
    public readonly deviceVersionMinor: number;
    public readonly deviceVersionSubminor: number;

    public readonly manufacturerName: string = null;
    public readonly productName: string = null;
    public readonly serialNumber: string = null;

    public readonly configuration?: USBConfiguration;
    public readonly configurations: Array<USBConfiguration>;

    public readonly opened: boolean = false;

    public readonly url: string = null;

    /**
     * USB Device constructor
     * @param init A partial class to initialise values
     */
    constructor(init?: Partial<USBDevice>) {
        Object.assign(this, init);
    }

    public open(): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public close(): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public selectConfiguration(_configurationValue: number): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public claimInterface(_interfaceNumber: number): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public releaseInterface(_interfaceNumber: number): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public selectAlternateInterface(_interfaceNumber: number, _alternateSetting: number): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public controlTransferIn(_setup: USBControlTransferParameters, _length: number): Promise<USBInTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public controlTransferOut(_setup: USBControlTransferParameters, _data?: BufferSource): Promise<USBOutTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public clearHalt(_direction: USBDirection, _endpointNumber: number): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public transferIn(_endpointNumber: number, _length: number): Promise<USBInTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public transferOut(_endpointNumber: number, _data: BufferSource): Promise<USBOutTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    public isochronousTransferIn(_endpointNumber: number, _packetLengths: Array<number>): Promise<USBIsochronousInTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("isochronousTransferIn error: method not implemented");
        });
    }

    public isochronousTransferOut(_endpointNumber: number, _data: BufferSource, _packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("isochronousTransferOut error: method not implemented");
        });
    }

    public reset(): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }
}
