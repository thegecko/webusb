/// <reference types="w3c-web-usb" />
/**
 * @hidden
 */
export declare class DOMEvent implements Event {
    /**
     * Type of the event
     */
    type: string;
    /**
     * @hidden
     */
    target: EventTarget;
    /**
     * @hidden
     */
    currentTarget: EventTarget;
    /**
     * @hidden
     */
    srcElement: EventTarget;
    /**
     * @hidden
     */
    timeStamp: number;
    /**
     * @hidden
     */
    bubbles: boolean;
    /**
     * @hidden
     */
    cancelable: boolean;
    /**
     * @hidden
     */
    cancelBubble: boolean;
    /**
     * @hidden
     */
    composed: boolean;
    /**
     * @hidden
     */
    defaultPrevented: boolean;
    /**
     * @hidden
     */
    eventPhase: number;
    /**
     * @hidden
     */
    isTrusted: boolean;
    /**
     * @hidden
     */
    returnValue: boolean;
    /**
     * @hidden
     */
    AT_TARGET: number;
    /**
     * @hidden
     */
    BUBBLING_PHASE: number;
    /**
     * @hidden
     */
    CAPTURING_PHASE: number;
    /**
     * @hidden
     */
    NONE: number;
    /**
     * @hidden
     */
    composedPath(): Array<EventTarget>;
    /**
     * @hidden
     */
    initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
    /**
     * @hidden
     */
    preventDefault(): void;
    /**
     * @hidden
     */
    stopImmediatePropagation(): void;
    /**
     * @hidden
     */
    stopPropagation(): void;
}
/**
 * @hidden
 */
export declare class W3CUSBConnectionEvent extends DOMEvent implements USBConnectionEvent {
    /**
     * Device connected or disconnected
     */
    readonly device: USBDevice;
    /**
     * Type of the event
     */
    readonly type: "connect" | "disconnect";
    /**
     * @hidden
     */
    constructor(target: EventTarget, type: "connect" | "disconnect", eventInitDict: USBConnectionEventInit);
}
