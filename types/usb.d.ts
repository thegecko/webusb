import { TypedDispatcher } from "./dispatcher";
import { USBDevice } from "./device";
import { USBOptions, USBDeviceRequestOptions } from "./interfaces";
/**
 * Events raised by the USB class
 */
export interface USBEvents {
    /**
     * @hidden
     */
    newListener: keyof USBEvents;
    /**
     * @hidden
     */
    removeListener: keyof USBEvents;
    /**
     * USBDevice connected event
     */
    connect: USBDevice;
    /**
     * USBDevice disconnected event
     */
    disconnect: USBDevice;
}
declare const USB_base: new () => TypedDispatcher<USBEvents>;
/**
 * USB class
 */
export declare class USB extends USB_base {
    private allowedDevices;
    private devicesFound;
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
