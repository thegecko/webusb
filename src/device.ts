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
import { USBControlTransferParameters, USBInTransferResult, USBOutTransferResult, USBIsochronousInTransferResult, USBIsochronousOutTransferResult } from "./interfaces";
import { USBConfiguration } from "./configuration";
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

    private _configurations: Array<USBConfiguration> = [];
    public get configurations(): Array<USBConfiguration> {
        return this._configurations;
    }

    /**
     * @hidden
     */
    public _currentConfiguration: number = null;

    public get configuration(): USBConfiguration {
        return this.configurations.find(configuration => configuration.configurationValue === this._currentConfiguration);
    }

    public get opened(): boolean {
        return adapter.getOpened(this._handle);
    }

    public readonly url: string = null;

    /**
     * @hidden
     */
    public readonly _handle: string = null;

    /**
     * @hidden
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

        this._configurations = init.configurations;

        this.url = init.url;
        this._handle = init._handle;
        this._currentConfiguration = init._currentConfiguration;
    }

    public open(): Promise<void> {
        return adapter.open(this._handle);
    }

    public close(): Promise<void> {
        return adapter.close(this._handle);
    }

    public selectConfiguration(configurationValue: number): Promise<void> {
        return adapter.selectConfiguration(this._handle, configurationValue)
        .then(() => {
            this._currentConfiguration = configurationValue;
            this.configuration.interfaces.forEach(iface => iface.reset());
        });
    }

    public selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void> {
        const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
        return iface.selectAlternateInterface(alternateSetting);
    }

    public claimInterface(interfaceNumber: number): Promise<void> {
        const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
        return iface.claimInterface();
    }

    public releaseInterface(interfaceNumber: number): Promise<void> {
        const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
        return iface.releaseInterface();
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
    public clearHalt(direction: USBDirection, endpointNumber: number): Promise<void> {
        return adapter.clearHalt(this._handle, direction, endpointNumber);
    }

    /**
     * @hidden
     */
    public isochronousTransferIn(endpointNumber: number, packetLengths: Array<number>): Promise<USBIsochronousInTransferResult> {
        return adapter.isochronousTransferIn(this._handle, endpointNumber, packetLengths);
    }

    /**
     * @hidden
     */
    public isochronousTransferOut(endpointNumber: number, data: BufferSource, packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult> {
        return adapter.isochronousTransferOut(this._handle, endpointNumber, data, packetLengths);
    }
}
