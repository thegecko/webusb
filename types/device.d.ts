/// <reference types="w3c-web-usb" />
import { USBConfiguration } from "./configuration";
import { W3CUSBDevice } from "./interfaces";
/**
 * USB Device
 */
export declare class USBDevice implements W3CUSBDevice {
    /**
     * Major USB protocol version supported by the device
     */
    readonly usbVersionMajor: number;
    /**
     * Minor USB protocol version supported by the device
     */
    readonly usbVersionMinor: number;
    /**
     * Sub minor USB protocol version supported by the device
     */
    readonly usbVersionSubminor: number;
    /**
     * Communication interface class of the device
     */
    readonly deviceClass: number;
    /**
     * Communication interface sub class of the device
     */
    readonly deviceSubclass: number;
    /**
     * Communication interface protocol of the device
     */
    readonly deviceProtocol: number;
    /**
     * Vendor Identifier of the device
     */
    readonly vendorId: number;
    /**
     * Product Identifier of the device
     */
    readonly productId: number;
    /**
     * Major version of the device
     */
    readonly deviceVersionMajor: number;
    /**
     * Minor version of the device
     */
    readonly deviceVersionMinor: number;
    /**
     * Sub minor version of the device
     */
    readonly deviceVersionSubminor: number;
    /**
     * Manufacturer name of the device
     */
    readonly manufacturerName: string;
    /**
     * Product name of the device
     */
    readonly productName: string;
    /**
     * Serial number of the device
     */
    readonly serialNumber: string;
    private _configurations;
    /**
     * List of configurations supported by the device
     */
    readonly configurations: Array<USBConfiguration>;
    /**
     * @hidden
     */
    _currentConfiguration: number;
    /**
     * The currently selected configuration
     */
    readonly configuration: USBConfiguration;
    /**
     * @hidden
     */
    readonly connected: boolean;
    /**
     * A flag indicating whether the device is open
     */
    readonly opened: boolean;
    /**
     * URL advertised by the device (not part of Web USB specification)
     */
    readonly url: string;
    /**
     * @hidden
     */
    readonly _maxPacketSize: number;
    /**
     * @hidden
     */
    readonly _handle: string;
    /**
     * @hidden
     */
    constructor(init?: Partial<USBDevice>);
    private getEndpoint;
    private setupInvalid;
    /**
     * Opens the device
     */
    open(): Promise<void>;
    /**
     * Closes the device
     */
    close(): Promise<void>;
    /**
     * Select a configuration for the device
     * @param configurationValue The configuration value to select
     * @returns Promise containing any error
     */
    selectConfiguration(configurationValue: number): Promise<void>;
    /**
     * Claim an interface on the device
     * @param interfaceNumber The interface number to claim
     * @returns Promise containing any error
     */
    claimInterface(interfaceNumber: number): Promise<void>;
    /**
     * Release an interface on the device
     * @param interfaceNumber The interface number to release
     * @returns Promise containing any error
     */
    releaseInterface(interfaceNumber: number): Promise<void>;
    /**
     * Select an alternate interface on the device
     * @param interfaceNumber The interface number to change
     * @param alternateSetting The alternate setting to use
     * @returns Promise containing any error
     */
    selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>;
    /**
     * Undertake a control transfer in from the device
     *
     * @param setup The USB control transfer parameters
     * @param length The amount of data to transfer
     * @returns Promise containing a result
     */
    controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
    /**
     * Undertake a control transfer out to the device
     *
     * __Note:__ The bytesWritten always set to the length of the data
     *
     * @param setup The USB control transfer parameters
     * @param data The data to transfer
     * @returns Promise containing a result
     */
    controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult>;
    /**
     * Clear a halt condition on an endpoint
     *
     * @param direction The direction of the endpoint to clear
     * @param endpointNumber The endpoint number of the endpoint to clear
     * @returns Promise containing any error
     */
    clearHalt(direction: USBDirection, endpointNumber: number): Promise<void>;
    /**
     * Undertake a transfer in from the device
     *
     * @param endpointNumber The number of the endpoint to transfer from
     * @param length The amount of data to transfer
     * @returns Promise containing a result
     */
    transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
    /**
     * Undertake a transfer out to the device
     *
     * __Note:__ The bytesWritten always set to the length of the data
     *
     * @param endpointNumber The number of the endpoint to transfer to
     * @param data The data to transfer
     * @returns Promise containing a result
     */
    transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
    /**
     * @hidden
     * Undertake an isochronous transfer in from the device
     * @param endpointNumber The number of the endpoint to transfer from
     * @param packetLengths An array of packet lengths outlining the amount to transfer
     * @returns Promise containing a result
     */
    isochronousTransferIn(endpointNumber: number, packetLengths: Array<number>): Promise<USBIsochronousInTransferResult>;
    /**
     * @hidden
     * Undertake an isochronous transfer out to the device
     * @param endpointNumber The number of the endpoint to transfer to
     * @param data The data to transfer
     * @param packetLengths An array of packet lengths outlining the amount to transfer
     * @returns Promise containing a result
     */
    isochronousTransferOut(endpointNumber: number, data: BufferSource, packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult>;
    /**
     * Soft reset the device
     * @returns Promise containing any error
     */
    reset(): Promise<void>;
}
