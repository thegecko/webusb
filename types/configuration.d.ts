import { USBInterface } from "./interface";
import { W3CUSBConfiguration } from "./interfaces";
/**
 * USB Configuration
 */
export declare class USBConfiguration implements W3CUSBConfiguration {
    /**
     * The value of this configuration
     */
    readonly configurationValue: number;
    /**
     * The name of this configuration
     */
    readonly configurationName?: string;
    /**
     * The array of interfaces on this configuration
     */
    readonly interfaces: Array<USBInterface>;
    /**
     * @hidden
     */
    constructor(init?: Partial<USBConfiguration>);
}
