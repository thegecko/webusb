/// <reference types="w3c-web-usb" />
import { TypedDispatcher } from "./dispatcher";
import { W3CUSB } from "./interfaces";
/**
 * USB Options
 */
export interface USBOptions {
    /**
     * A `device found` callback function to allow the user to select a device
     */
    devicesFound?: (devices: Array<USBDevice>) => Promise<USBDevice | void>;
}
/**
 * @hidden
 */
export interface USBEvents {
    /**
     * USBDevice connected event
     */
    connect: USBConnectionEvent;
    /**
     * USBDevice disconnected event
     */
    disconnect: USBConnectionEvent;
}
declare const USB_base: new () => TypedDispatcher<USBEvents>;
/**
 * USB class
 */
export declare class USB extends USB_base implements W3CUSB {
    private allowedDevices;
    private devicesFound;
    private _onconnect;
    onconnect: (ev: USBConnectionEvent) => void;
    private _ondisconnect;
    ondisconnect: (ev: USBConnectionEvent) => void;
    /**
     * USB constructor
     * @param options USB initialisation options
     */
    constructor(options?: USBOptions);
    private replaceAllowedDevice;
    private isSameDevice;
    private filterDevice;
    /**
     * Gets all allowed Web USB devices which are connected
     * @returns Promise containing an array of devices
     */
    getDevices(): Promise<Array<USBDevice>>;
    /**
     * Requests a single Web USB device
     * @param options The options to use when scanning
     * @returns Promise containing the selected device
     */
    requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
}
export {};
