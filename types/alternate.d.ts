import { USBEndpoint } from "./endpoint";
/**
 * USB Alternate Interface
 */
export declare class USBAlternateInterface {
    /**
     * The alternate setting for this interface
     */
    readonly alternateSetting: number;
    /**
     * The class of this interface
     */
    readonly interfaceClass: number;
    /**
     * The sub class of this interface
     */
    readonly interfaceSubclass: number;
    /**
     * The protocol of this interface
     */
    readonly interfaceProtocol: number;
    /**
     * The name of this interface
     */
    readonly interfaceName?: string;
    /**
     * The array of endpoints on this interface
     */
    readonly endpoints: Array<USBEndpoint>;
    /**
     * @hidden
     */
    constructor(init?: Partial<USBAlternateInterface>);
}
