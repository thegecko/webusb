import { EventDispatcher } from "./dispatcher";
import { USBDevice } from "./device";
import { USBOptions, USBDeviceRequestOptions } from "./interfaces";
/**
 * USB class
 */
export declare class USB extends EventDispatcher {
    /**
     * Allowed device Connected event
     * @event
     */
    static EVENT_DEVICE_CONNECT: string;
    /**
     * Allowed device Disconnected event
     * @event
     */
    static EVENT_DEVICE_DISCONNECT: string;
    private allowedDevices;
    private devicesFound;
    /**
     * USB constructor
     * @param options USB initialisation options
     */
    constructor(options?: USBOptions);
    private replaceAllowedDevice;
    private filterDevice;
    /**
     * Gets all allowed Web USB devices
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
