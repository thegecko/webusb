/*
* Node WebUSB
* Copyright (c) 2020 Rob Moran
*
* The MIT License (MIT)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

import { USBDevice } from "../device";
import { USBAdapter } from "../index";
import { TypedDispatcher } from "../dispatcher";
export * from "./usb-adapter";
export * from "./ws-adapter";

/**
 * @hidden
 */
export interface USBEvents {
    connect: USBDevice;
    disconnect: string;
}

/**
 * @hidden
 */
export interface Adapter extends TypedDispatcher<USBEvents> {
    getConnected(handle: string): boolean;
    getOpened(handle: string): boolean;

    listUSBDevices(): Promise<Array<USBDevice>>;
    open(handle: string): Promise<void>;
    close(handle: string): Promise<void>;
    selectConfiguration(handle: string, id: number): Promise<void>;
    claimInterface(handle: string, address: number): Promise<void>;
    releaseInterface(handle: string, address: number): Promise<void>;
    selectAlternateInterface(handle: string, interfaceNumber: number, alternateSetting: number): Promise<void>;
    controlTransferIn(handle: string, setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
    controlTransferOut(handle: string, setup: USBControlTransferParameters, data: ArrayBuffer | ArrayBufferView): Promise<USBOutTransferResult>;
    clearHalt(handle: string, direction: USBDirection, endpointNumber: number): Promise<void>;
    transferIn(handle: string, endpointNumber: number, length: number): Promise<USBInTransferResult>;
    transferOut(handle: string, endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
    isochronousTransferIn(_handle: string, _endpointNumber: number, _packetLengths: Array<number>): Promise<USBIsochronousInTransferResult>;
    isochronousTransferOut(_handle: string, _endpointNumber: number, _data: BufferSource, _packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult>;
    reset(handle: string): Promise<void>;
}

/**
 * @hidden
 */
export let adapter: Adapter = new USBAdapter();

/**
 * @hidden
 */
export const setAdapter = (newAdapter: Adapter) => adapter = newAdapter;
