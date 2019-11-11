
import { ok } from "assert";
import { USBDevice } from "./device";

/**
 * @param num - must be short int(2 bytes).
 * encodes short int to hex. (Always return 4 byte hex)
 */

export function encodeU16ToHex(num: number): string {
    ok((num & 0xffff) === num);
    const hex = num.toString(16);

    return "0".repeat(4 - hex.length) + hex;
}

/**
 * This will encode device to string for mapping.
 * Format will be concatination of:
 *  `0000-ffff` - hex of vendorId (short int)
 *  `0000-ffff` - hex of productId (short int)
 *  `...` - serial number is optional string.
 */

export function deviceToKey(device: USBDevice): string {
    const vendorId = encodeU16ToHex(device.vendorId);
    const productId = encodeU16ToHex(device.productId);

    return vendorId + productId + device.serialNumber;
}
