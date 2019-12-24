import { USBAlternateInterface } from "./alternate";
/**
 * USB Interface
 */
export declare class USBInterface {
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
    get claimed(): boolean;
    private _currentAlternate;
    /**
     * Return the current alternate interface
     */
    get alternate(): USBAlternateInterface;
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
