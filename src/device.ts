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

import { USBDirection, USBControlTransferParameters, USBInTransferResult, USBOutTransferResult, USBIsochronousInTransferResult, USBIsochronousOutTransferResult } from "./interfaces";

export class USBDevice {

    public usbVersionMajor: number;
    public usbVersionMinor: number;
    public usbVersionSubminor: number;
    public deviceClass: number;
    public deviceSubclass: number;
    public deviceProtocol: number;
    public vendorId: number;
    public productId: number;
    public deviceVersionMajor: number;
    public deviceVersionMinor: number;
    public deviceVersionSubminor: number;

    public manufacturerName: string = null;
    public productName: string = null;
    public serialNumber: string = null;

    public url: string = null;

    public opened: boolean = false;

    /**
     * @hidden
     */
    constructor(init?: Partial<USBDevice>) {
        for (const key in init) {
            if (init.hasOwnProperty(key)) {
                this[key] = init[key];
            }
        }
    }

    public open(): Promise<void> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public close(): Promise<void> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public selectConfiguration(_configurationValue: number): Promise<void> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public claimInterface(_interfaceNumber: number): Promise<void> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public releaseInterface(_interfaceNumber: number): Promise<void> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public selectAlternateInterface(_interfaceNumber: number, _alternateSetting: number): Promise<void> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public controlTransferIn(_setup: USBControlTransferParameters, _length: number): Promise<USBInTransferResult> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public controlTransferOut(_setup: USBControlTransferParameters, _data?: BufferSource): Promise<USBOutTransferResult> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public clearHalt(_direction: USBDirection, _endpointNumber: number): Promise<void> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public transferIn(_endpointNumber: number, _length: number): Promise<USBInTransferResult> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public transferOut(_endpointNumber: number, _data: BufferSource): Promise<USBOutTransferResult> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public isochronousTransferIn(_endpointNumber: number, _packetLengths: Array<number>): Promise<USBIsochronousInTransferResult> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public isochronousTransferOut(_endpointNumber: number, _data: BufferSource, _packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }

    public reset(): Promise<void> {
        return new Promise((resolve, _reject) => {
            resolve();
        });
    }
}
