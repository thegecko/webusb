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

import { LIBUSB_ENDPOINT_IN } from "usb";
import { USBConfiguration } from "./configuration";
import { adapter } from "./adapter";
import { W3CUSBDevice } from "./interfaces";

/**
 * @hidden
 */
interface EndpointResult {
    endpoint: USBEndpoint;
    iface: USBInterface;
}

/**
 * USB Device
 */
export class USBDevice implements W3CUSBDevice {

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
     * @hidden
     */
    public get connected(): boolean {
        return adapter.getConnected(this._handle);
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
    public readonly _maxPacketSize: number = 0;

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
        this._maxPacketSize = init._maxPacketSize;
        this._handle = init._handle;
        this._currentConfiguration = init._currentConfiguration;
    }

    private getEndpoint(direction: USBDirection, endpointNumber: number): EndpointResult {
        let endpoint = null;
        let iface = null;

        this.configuration.interfaces.some(usbInterface => {
            endpoint = usbInterface.alternate.endpoints.find(usbEndpoint => {
                return (usbEndpoint.endpointNumber === endpointNumber && usbEndpoint.direction === direction);
            });

            if (endpoint) iface = usbInterface;
            return endpoint;
        });

        return {
            endpoint: endpoint,
            iface: iface
        };
    }

    private setupInvalid(setup: USBControlTransferParameters): string {
        if (setup.recipient === "interface") {
            const interfaceNumber = setup.index & 0xff; // lower 8 bits
            const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
            if (!iface) return "interface not found";
            if (!iface.claimed) return "invalid state";

        } else if (setup.recipient === "endpoint") {
            const endpointNumber = setup.index & 0x0f; // lower 4 bits
            const direction = setup.index & LIBUSB_ENDPOINT_IN ? "in" : "out";

            const result = this.getEndpoint(direction, endpointNumber);
            if (!result.endpoint) return "endpoint not found";
            if (!result.iface.claimed) return "invalid state";
        }
    }

    /**
     * Opens the device
     */
    public open(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("open error: device not found"));
            if (this.opened) return resolve();

            adapter.open(this._handle)
            .then(resolve)
            .catch(error => {
                reject(new Error(`open error: ${error}`));
            });
        });
    }

    /**
     * Closes the device
     */
    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("close error: device not found"));
            if (!this.opened) return resolve();

            const releaseInterfacePromises = this.configuration.interfaces.map(
                iface => this.releaseInterface(iface.interfaceNumber));

            Promise.all(releaseInterfacePromises)
            .catch(_error => { /* Ignore */ })
            .then(() => adapter.close(this._handle))
            .then(resolve)
            .catch(error => {
                reject(new Error(`close error: ${error}`));
            });
        });
    }

    /**
     * Select a configuration for the device
     * @param configurationValue The configuration value to select
     * @returns Promise containing any error
     */
    public selectConfiguration(configurationValue: number): Promise<void> {
        return new Promise((resolve, reject) => {

            // Don't change the configuration if it's already set correctly
            if (configurationValue === this._currentConfiguration) return resolve();

            if (!this.connected) return reject(new Error("selectConfiguration error: device not found"));

            const config =  this.configurations.find(configuration => configuration.configurationValue === configurationValue);
            if (!config) return reject(new Error("selectConfiguration error: configuration not found"));

            if (!this.opened) return reject(new Error("selectConfiguration error: invalid state"));

            adapter.selectConfiguration(this._handle, configurationValue)
            .then(() => {
                this._currentConfiguration = configurationValue;
                this.configuration.interfaces.forEach(iface => iface.reset());
                resolve();
            })
            .catch(error => {
                reject(new Error(`selectConfiguration error: ${error}`));
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
            if (!this.connected) return reject(new Error("claimInterface error: device not found"));

            const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
            if (!iface) return reject(new Error("claimInterface error: interface not found"));
            if (!this.opened) return reject(new Error("claimInterface error: invalid state"));
            if (iface.claimed) return resolve();

            iface.claimInterface()
            .then(resolve)
            .catch(error => {
                reject(new Error(`claimInterface error: ${error}`));
            });
        });
    }

    /**
     * Release an interface on the device
     * @param interfaceNumber The interface number to release
     * @returns Promise containing any error
     */
    public releaseInterface(interfaceNumber: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("releaseInterface error: device not found"));

            const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
            if (!iface) return reject(new Error("releaseInterface error: interface not found"));
            if (!this.opened) return reject(new Error("releaseInterface error: invalid state"));
            if (!iface.claimed) return resolve();

            iface.releaseInterface()
            .then(resolve)
            .catch(error => {
                reject(new Error(`releaseInterface error: ${error}`));
            });
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
            if (!this.connected) return reject(new Error("selectAlternateInterface error: device not found"));

            const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
            if (!iface) return reject(new Error("selectAlternateInterface error: interface not found"));

            if (!this.opened || !iface.claimed) return reject(new Error("selectAlternateInterface error: invalid state"));

            iface.selectAlternateInterface(alternateSetting)
            .then(resolve)
            .catch(error => {
                reject(new Error(`selectAlternateInterface error: ${error}`));
            });
        });
    }

    /**
     * Undertake a control transfer in from the device
     *
     * @param setup The USB control transfer parameters
     * @param length The amount of data to transfer
     * @returns Promise containing a result
     */
    public controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("controlTransferIn error: device not found"));
            if (!this.opened) return reject(new Error("controlTransferIn error: invalid state"));

            const setupError = this.setupInvalid(setup);
            if (setupError) return reject(new Error(`controlTransferIn error: ${setupError}`));

            adapter.controlTransferIn(this._handle, setup, length)
            .then(resolve)
            .catch(error => {
                reject(new Error(`controlTransferIn error: ${error}`));
            });
        });
    }

    /**
     * Undertake a control transfer out to the device
     *
     * __Note:__ The bytesWritten always set to the length of the data
     *
     * @param setup The USB control transfer parameters
     * @param data The data to transfer
     * @returns Promise containing a result
     */
    public controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("controlTransferOut error: device not found"));
            if (!this.opened) return reject(new Error("controlTransferOut error: invalid state"));

            const setupError = this.setupInvalid(setup);
            if (setupError) return reject(new Error(`controlTransferOut error: ${setupError}`));

            adapter.controlTransferOut(this._handle, setup, data)
            .then(resolve)
            .catch(error => {
                reject(new Error(`controlTransferOut error: ${error}`));
            });
        });
    }

    /**
     * Clear a halt condition on an endpoint
     *
     * @param direction The direction of the endpoint to clear
     * @param endpointNumber The endpoint number of the endpoint to clear
     * @returns Promise containing any error
     */
    public clearHalt(direction: USBDirection, endpointNumber: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("clearHalt error: device not found"));

            const result = this.getEndpoint(direction, endpointNumber);
            if (!result.endpoint) return reject(new Error("clearHalt error: endpoint not found"));
            if (!this.opened || !result.iface.claimed) return reject(new Error("clearHalt error: invalid state"));

            adapter.clearHalt(this._handle, direction, endpointNumber)
            .then(resolve)
            .catch(error => {
                reject(new Error(`clearHalt error: ${error}`));
            });
        });
    }

    /**
     * Undertake a transfer in from the device
     *
     * @param endpointNumber The number of the endpoint to transfer from
     * @param length The amount of data to transfer
     * @returns Promise containing a result
     */
    public transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("transferIn error: device not found"));

            const result = this.getEndpoint("in", endpointNumber);
            if (!result.endpoint) return reject(new Error("transferIn error: endpoint not found"));
            if (result.endpoint.type !== "interrupt" && result.endpoint.type !== "bulk") return reject(new Error("transferIn error: invalid access"));
            if (!this.opened || !result.iface.claimed) return reject(new Error("transferIn error: invalid state"));

            adapter.transferIn(this._handle, endpointNumber, length)
            .then(resolve)
            .catch(error => {
                reject(new Error(`transferIn error: ${error}`));
            });
        });
    }

    /**
     * Undertake a transfer out to the device
     *
     * __Note:__ The bytesWritten always set to the length of the data
     *
     * @param endpointNumber The number of the endpoint to transfer to
     * @param data The data to transfer
     * @returns Promise containing a result
     */
    public transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("transferOut error: device not found"));

            const result = this.getEndpoint("out", endpointNumber);
            if (!result.endpoint) return reject(new Error("transferOut error: endpoint not found"));
            if (result.endpoint.type !== "interrupt" && result.endpoint.type !== "bulk") return reject(new Error("transferOut error: invalid access"));
            if (!this.opened || !result.iface.claimed) return reject(new Error("transferOut error: invalid state"));

            adapter.transferOut(this._handle, endpointNumber, data)
            .then(resolve)
            .catch(error => {
                reject(new Error(`transferOut error: ${error}`));
            });
        });
    }

    /**
     * @hidden
     * Undertake an isochronous transfer in from the device
     * @param endpointNumber The number of the endpoint to transfer from
     * @param packetLengths An array of packet lengths outlining the amount to transfer
     * @returns Promise containing a result
     */
    public isochronousTransferIn(endpointNumber: number, packetLengths: Array<number>): Promise<USBIsochronousInTransferResult> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("isochronousTransferIn error: device not found"));

            const result = this.getEndpoint("in", endpointNumber);
            if (!result.endpoint) return reject(new Error("isochronousTransferIn error: endpoint not found"));
            if (result.endpoint.type !== "isochronous") return reject(new Error("isochronousTransferIn error: invalid access"));
            if (!this.opened || !result.iface.claimed) return reject(new Error("isochronousTransferIn error: invalid state"));

            adapter.isochronousTransferIn(this._handle, endpointNumber, packetLengths)
            .then(resolve)
            .catch(error => {
                reject(new Error(`isochronousTransferIn error: ${error}`));
            });
        });
    }

    /**
     * @hidden
     * Undertake an isochronous transfer out to the device
     * @param endpointNumber The number of the endpoint to transfer to
     * @param data The data to transfer
     * @param packetLengths An array of packet lengths outlining the amount to transfer
     * @returns Promise containing a result
     */
    public isochronousTransferOut(endpointNumber: number, data: BufferSource, packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("isochronousTransferOut error: device not found"));

            const result = this.getEndpoint("out", endpointNumber);
            if (!result.endpoint) return reject(new Error("isochronousTransferOut error: endpoint not found"));
            if (result.endpoint.type !== "isochronous") return reject(new Error("isochronousTransferOut error: invalid access"));
            if (!this.opened || !result.iface.claimed) return reject(new Error("isochronousTransferOut error: invalid state"));

            adapter.isochronousTransferOut(this._handle, endpointNumber, data, packetLengths)
            .then(resolve)
            .catch(error => {
                reject(new Error(`isochronousTransferOut error: ${error}`));
            });
        });
    }

    /**
     * Soft reset the device
     * @returns Promise containing any error
     */
    public reset(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.connected) return reject(new Error("reset error: device not found"));
            if (!this.opened) return reject(new Error("reset error: invalid state"));

            adapter.reset(this._handle)
            .then(resolve)
            .catch(error => {
                reject(new Error(`reset error: ${error}`));
            });
        });
    }
}
