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

import { USBDirection } from "./enums";
import { USBConfiguration, USBControlTransferParameters, USBInTransferResult, USBOutTransferResult, USBIsochronousInTransferResult, USBIsochronousOutTransferResult } from "./interfaces";
import { adapter } from "./adapter";

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

    public get configuration(): USBConfiguration {
        return adapter.getConfiguration(this._handle);
    }

    public get configurations(): Array<USBConfiguration> {
        return adapter.getConfigurations(this._handle);
    }

    public get opened(): boolean {
        return adapter.getOpened(this._handle);
    }

    public readonly url: string = null;

    /**
     * @hidden
     */
    public readonly _handle: any = null;

    /**
     * USB Device constructor
     * @param init A partial class to initialise values
     */
    constructor(init?: Partial<USBDevice>) {
        this.usbVersionMajor = init.usbVersionMajor;
        this.usbVersionMinor = init.usbVersionMinor;
        this.usbVersionSubminor = init.usbVersionSubminor;
        this.deviceClass = init.deviceClass;
        this.deviceSubclass = init.deviceSubclass;
        this.deviceProtocol = init.deviceProtocol;
        this.vendorId = init.vendorId;
        this.productId = init.productId;
        this.deviceVersionMajor = init.deviceVersionMajor;
        this.deviceVersionMinor = init.deviceVersionMinor;
        this.deviceVersionSubminor = init.deviceVersionSubminor;

        this.manufacturerName = init.manufacturerName;
        this.productName = init.productName;
        this.serialNumber = init.serialNumber;

        this.url = init.url;
        this._handle = init._handle;
    }

    public open(): Promise<void> {
        return adapter.open(this._handle);
    }

    public close(): Promise<void> {
        return adapter.close(this._handle);
    }

    public selectConfiguration(configurationValue: number): Promise<void> {
        return adapter.selectConfiguration(this._handle, configurationValue);
    }

    public claimInterface(interfaceNumber: number): Promise<void> {
        return adapter.claimInterface(this._handle, interfaceNumber);
    }

    public releaseInterface(interfaceNumber: number): Promise<void> {
        return adapter.releaseInterface(this._handle, interfaceNumber);
    }

    public selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void> {
        return adapter.selectAlternateInterface(this._handle, interfaceNumber, alternateSetting);
    }

    public controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult> {
        return adapter.controlTransferIn(this._handle, setup, length);
    }

    public controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult> {
        return adapter.controlTransferOut(this._handle, setup, data);
    }

    public transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult> {
        return adapter.transferIn(this._handle, endpointNumber, length);
    }

    public transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult> {
        return adapter.transferOut(this._handle, endpointNumber, data);
    }

    public reset(): Promise<void> {
        return adapter.reset(this._handle);
    }

    /**
     * @hidden
     */
    public clearHalt(_direction: USBDirection, _endpointNumber: number): Promise<void> {
        return new Promise((_resolve, reject) => {
            reject("error: method not implemented");
        });
    }

    /**
     * @hidden
     */
    public isochronousTransferIn(_endpointNumber: number, _packetLengths: Array<number>): Promise<USBIsochronousInTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("isochronousTransferIn error: method not implemented");
        });
    }

    /**
     * @hidden
     */
    public isochronousTransferOut(_endpointNumber: number, _data: BufferSource, _packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult> {
        return new Promise((_resolve, reject) => {
            reject("isochronousTransferOut error: method not implemented");
        });
    }
}
