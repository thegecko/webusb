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

    /**
     * Major USB protocol version supported by the device
     */
    public readonly usbVersionMajor: number;

    /**
     * Minor USB protocol version supported by the device
     */
    public readonly usbVersionMinor: number;

    /**
     * Sub minor USB protocol version supported by the device
     */
    public readonly usbVersionSubminor: number;

    /**
     * Communication interface class of the device
     */
    public readonly deviceClass: number;

    /**
     * Communication interface sub class of the device
     */
    public readonly deviceSubclass: number;

    /**
     * Communication interface protocol of the device
     */
    public readonly deviceProtocol: number;

    /**
     * Vendor Identifier of the device
     */
    public readonly vendorId: number;

    /**
     * Product Identifier of the device
     */
    public readonly productId: number;

    /**
     * Major version of the device
     */
    public readonly deviceVersionMajor: number;

    /**
     * Minor version of the device
     */
    public readonly deviceVersionMinor: number;

    /**
     * Sub minor version of the device
     */
    public readonly deviceVersionSubminor: number;

    /**
     * Manufacturer name of the device
     */
    public readonly manufacturerName: string = null;

    /**
     * Product name of the device
     */
    public readonly productName: string = null;

    /**
     * Serial number of the device
     */
    public readonly serialNumber: string = null;

    private _configurations: Array<USBConfiguration> = [];
    /**
     * List of configurations supported by the device
     */
    public get configurations(): Array<USBConfiguration> {
        return this._configurations;
    }

    /**
     * @hidden
     */
    public _currentConfiguration: number = null;
    /**
     * The currently selected configuration
     */
    public get configuration(): USBConfiguration {
        return this.configurations.find(configuration => configuration.configurationValue === this._currentConfiguration);
    }

    /**
     * A flag indicating whether the device is open
     */
    public get opened(): boolean {
        return adapter.getOpened(this._handle);
    }

    /**
     * URL advertised by the device (not part of Web USB specification)
     */
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

    /**
     * Opens the device
     */
    public open(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (adapter.getOpened(this._handle)) return resolve();
            return adapter.open(this._handle)
            .catch(error => reject(error));
        });
    }

    /**
     * Closes the device
     */
    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!adapter.getOpened(this._handle)) return resolve();
            return adapter.close(this._handle)
            .catch(error => reject(error));
        });
    }

    /**
     * Select a configuration for the device
     * @param configurationValue The configuration value to select
     * @returns Promise containing any error
     */
    public selectConfiguration(configurationValue: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const config =  this.configurations.find(configuration => configuration.configurationValue === configurationValue);
            if (!config) return reject("selectConfiguration error: configuration not found");
            if (!this.opened) return reject("selectConfiguration error: invalid state");

            adapter.selectConfiguration(this._handle, configurationValue)
            .then(() => {
                this._currentConfiguration = configurationValue;
                this.configuration.interfaces.forEach(iface => iface.reset());
                resolve();
            });
        });
    }

    /**
     * Claim an interface on the device
     * @param interfaceNumber The interface number to claim
     * @returns Promise containing any error
     */
    public claimInterface(interfaceNumber: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
            if (!iface) return reject("claimInterface error: interface not found");
            if (!this.opened || iface.claimed) return reject("claimInterface error: invalid state");

            return iface.claimInterface()
            .then(() => resolve);
        });
    }

    /**
     * Release an interface on the device
     * @param interfaceNumber The interface number to release
     * @returns Promise containing any error
     */
    public releaseInterface(interfaceNumber: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
            if (!iface) return reject("releaseInterface error: interface not found");
            if (!this.opened || !iface.claimed) return reject("releaseInterface error: invalid state");

            return iface.releaseInterface()
            .then(() => resolve);
        });
    }

    /**
     * Select an alternate interface on the device
     * @param interfaceNumber The interface number to change
     * @param alternateSetting The alternate setting to use
     * @returns Promise containing any error
     */
    public selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
            if (!iface) return reject("selectAlternateInterface error: interface not found");
            if (!this.opened || !iface.claimed) return reject("selectAlternateInterface error: invalid state");

            return iface.selectAlternateInterface(alternateSetting)
            .then(() => resolve);
        });
    }

    // mention hacks
    public controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult> {
        return adapter.controlTransferIn(this._handle, setup, length);
    }

    // mention hacks
    public controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult> {
        return adapter.controlTransferOut(this._handle, setup, data);
    }

    // mention hacks
    public transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult> {
        return adapter.transferIn(this._handle, endpointNumber, length);
    }

    // mention hacks
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
