/**
 * Request type
 */
export declare type USBRequestType = "standard" | "class" | "vendor";
/**
 * Recipient
 */
export declare type USBRecipient = "device" | "interface" | "endpoint" | "other";
/**
 * Transfer status
 */
export declare type USBTransferStatus = "ok" | "stall" | "babble";
/**
 * Endpoint direction
 */
export declare type USBDirection = "in" | "out";
/**
 * Endpoint type
 */
export declare type USBEndpointType = "bulk" | "interrupt" | "isochronous";
