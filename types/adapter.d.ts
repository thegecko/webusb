/// <reference types="w3c-web-usb" />
/// <reference types="node" />
import { EventEmitter } from "events";
import { USBDevice } from "./device";
/**
 * @hidden
 */
export interface Adapter {
    getConnected(handle: string): boolean;
    getOpened(handle: string): boolean;
    listUSBDevices(preFilters?: Array<USBDeviceFilter>): Promise<Array<USBDevice>>;
    open(handle: string): Promise<void>;
    close(handle: string): Promise<void>;
    selectConfiguration(handle: string, id: number): Promise<void>;
    claimInterface(handle: string, address: number): Promise<void>;
    releaseInterface(handle: string, address: number): Promise<void>;
    selectAlternateInterface(handle: string, interfaceNumber: number, alternateSetting: number): Promise<void>;
    controlTransferIn(handle: string, setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
    controlTransferOut(handle: string, setup: USBControlTransferParameters, data: ArrayBuffer | ArrayBufferView): Promise<USBOutTransferResult>;
    clearHalt(handle: string, direction: USBDirection, endpointNumber: number): Promise<void>;
    transferIn(handle: string, endpointNumber: number, length: number): Promise<USBInTransferResult>;
    transferOut(handle: string, endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
    isochronousTransferIn(_handle: string, _endpointNumber: number, _packetLengths: Array<number>): Promise<USBIsochronousInTransferResult>;
    isochronousTransferOut(_handle: string, _endpointNumber: number, _data: BufferSource, _packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult>;
    reset(handle: string): Promise<void>;
}
/**
 * @hidden
 */
export declare class USBAdapter extends EventEmitter implements Adapter {
    static EVENT_DEVICE_CONNECT: string;
    static EVENT_DEVICE_DISCONNECT: string;
    private devices;
    constructor();
    private getDeviceHandle;
    private serialPromises;
    private serialDevicePromises;
    private delay;
    private retryPromise;
    private loadDevices;
    private preFilterDevices;
    private loadDevice;
    private getCapabilities;
    private getWebCapability;
    private decodeUUID;
    private getWebUrl;
    private devicetoUSBDevice;
    private decodeVersion;
    private getStringDescriptor;
    private bufferToDataView;
    private bufferSourceToBuffer;
    private getEndpoint;
    private getInEndpoint;
    private getOutEndpoint;
    private endpointToUSBEndpoint;
    private interfaceToUSBAlternateInterface;
    private interfacesToUSBInterface;
    private configToUSBConfiguration;
    private getDevice;
    private controlTransferParamsToType;
    private openDevice;
    getConnected(handle: string): boolean;
    getOpened(handle: string): boolean;
    listUSBDevices(preFilters?: Array<USBDeviceFilter>): Promise<Array<USBDevice>>;
    open(handle: string): Promise<void>;
    close(handle: string): Promise<void>;
    selectConfiguration(handle: string, id: number): Promise<void>;
    claimInterface(handle: string, address: number): Promise<void>;
    releaseInterface(handle: string, address: number): Promise<void>;
    selectAlternateInterface(handle: string, interfaceNumber: number, alternateSetting: number): Promise<void>;
    controlTransferIn(handle: string, setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
    controlTransferOut(handle: string, setup: USBControlTransferParameters, data?: ArrayBuffer | ArrayBufferView): Promise<USBOutTransferResult>;
    clearHalt(handle: string, direction: USBDirection, endpointNumber: number): Promise<void>;
    transferIn(handle: string, endpointNumber: number, length: number): Promise<USBInTransferResult>;
    transferOut(handle: string, endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
    isochronousTransferIn(_handle: string, _endpointNumber: number, _packetLengths: Array<number>): Promise<USBIsochronousInTransferResult>;
    isochronousTransferOut(_handle: string, _endpointNumber: number, _data: BufferSource, _packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult>;
    reset(handle: string): Promise<void>;
}
/**
 * @hidden
 */
export declare const adapter: USBAdapter;
