import { W3CUSBInterface } from "./interfaces";
import { USBAlternateInterface } from "./alternate";
/**
 * USB Interface
 */
export declare class USBInterface implements W3CUSBInterface {
    /**
     * Number of this interface
     */
    readonly interfaceNumber: number;
    /**
     * Array of alternate interfaces
     */
    readonly alternates: Array<USBAlternateInterface>;
    private _claimed;
    /**
     * Whether this interface is claimed
     */
    readonly claimed: boolean;
    private _currentAlternate;
    /**
     * Return the current alternate interface
     */
    readonly alternate: USBAlternateInterface;
    /**
     * @hidden
     */
    readonly _handle: string;
    /**
     * @hidden
     */
    constructor(init?: Partial<USBInterface>);
    /**
     * @hidden
     */
    selectAlternateInterface(alternateSetting: number): Promise<void>;
    /**
     * @hidden
     */
    claimInterface(): Promise<void>;
    /**
     * @hidden
     */
    releaseInterface(): Promise<void>;
    /**
     * @hidden
     */
    reset(): void;
}
