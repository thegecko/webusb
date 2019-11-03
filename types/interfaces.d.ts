import { USBRequestType, USBRecipient, USBTransferStatus } from "./enums";
import { USBDevice } from "./device";
/**
 * USB Options
 */
export interface USBOptions {
    /**
     * A `device found` callback function to allow the user to select a device
     */
    devicesFound?: (devices: Array<USBDevice>, selectFn?: (device: USBDevice) => void) => USBDevice | void;
}
/**
 * Device filter
 */
export interface USBDeviceFilter {
    vendorId?: number;
    productId?: number;
    classCode?: number;
    subclassCode?: number;
    protocolCode?: number;
    serialnumber?: string;
}
/**
 * Device request options
 */
export interface USBDeviceRequestOptions {
    filters: Array<USBDeviceFilter>;
}
/**
 * Control transfer parameters
 */
export interface USBControlTransferParameters {
    requestType: USBRequestType;
    recipient: USBRecipient;
    request: number;
    value: number;
    index: number;
}
/**
 * In transfer result
 */
export interface USBInTransferResult {
    data?: DataView;
    status: USBTransferStatus;
}
/**
 * Out transfer result
 */
export interface USBOutTransferResult {
    bytesWritten: number;
    status: USBTransferStatus;
}
/**
 * @hidden
 * Isochronous transfer packet (in)
 */
export interface USBIsochronousInTransferPacket {
    data?: DataView;
    status: USBTransferStatus;
}
/**
 * @hidden
 * Isochronous transfer result (in)
 */
export interface USBIsochronousInTransferResult {
    data?: DataView;
    packets: Array<USBIsochronousInTransferPacket>;
}
/**
 * @hidden
 * Isochronous transfer packet (out)
 */
export interface USBIsochronousOutTransferPacket {
    bytesWritten: number;
    status: USBTransferStatus;
}
/**
 * @hidden
 * Isochronous transfer result (out)
 */
export interface USBIsochronousOutTransferResult {
    packets: Array<USBIsochronousOutTransferPacket>;
}
