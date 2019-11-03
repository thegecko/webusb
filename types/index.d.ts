import { USB } from "./usb";
/**
 * Default usb instance synonymous with `navigator.usb`
 */
export declare const usb: USB;
/**
 * USB class for creating new instances
 */
export { USB };
/**
 * Adapter
 */
export { adapter, USBAdapter } from "./adapter";
/**
 * Interfaces
 */
export { USBOptions, USBDeviceFilter, USBDeviceRequestOptions, USBControlTransferParameters, USBInTransferResult, USBOutTransferResult, USBIsochronousInTransferPacket, USBIsochronousInTransferResult, USBIsochronousOutTransferPacket, USBIsochronousOutTransferResult } from "./interfaces";
/**
 * Enums
 */
export { USBDirection, USBEndpointType, USBRecipient, USBRequestType, USBTransferStatus } from "./enums";
/**
 * Other classes if required
 */
export { USBAlternateInterface } from "./alternate";
export { USBConfiguration } from "./configuration";
export { USBDevice } from "./device";
export { USBEndpoint } from "./endpoint";
export { USBInterface } from "./interface";
