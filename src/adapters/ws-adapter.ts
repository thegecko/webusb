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

// tslint:disable max-classes-per-file
import { EventDispatcher, TypedDispatcher } from "../dispatcher";
import { USBDevice } from "../device";
import { USBEvents, Adapter } from "./index";

/**
 * @hidden
 */
type wsRequestArg = any; // number | string | Uint8Array;

/**
 * @hidden
 */
type wsResponseArg = any; //  number | string | Uint8Array;

/**
 * @hidden
 */
interface WSRequest {
    sequence: number;
    command: string;
    data: Array<wsRequestArg>;
}

/**
 * @hidden
 */
interface WSResponse {
    sequence: number;
    type: "event" | "result";
    data: wsResponseArg;
}

/**
 * @hidden
 */
class Deferred<T> {
    public resolve: (value?: T) => void;
    public reject: (err?: any) => void;

    public promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

/**
 * @hidden
 */
export class WSAdapter extends (EventDispatcher as new() => TypedDispatcher<USBEvents>) implements Adapter {

    protected sequence = 0;
    protected socket: WebSocket;
    protected deferreds: Map<number, Deferred<any>> = new Map();
    protected connected = false;

    constructor(uri: string) {
        super();
        this.socket = new WebSocket(uri);

        this.socket.onmessage = event => {
            const response: WSResponse = JSON.parse(event.data);
            const deferred = this.deferreds.get(response.sequence);

            if (deferred) {
                deferred.resolve(JSON.parse(response.data));
                this.deferreds.delete(response.sequence);
            }
        };

        this.socket.onopen = () => {
            this.connected = true;
        };
    }

    public getConnected(_handle: string): boolean {
        return true;
    }

    public getOpened(_handle: string): boolean {
        return true;
    }

    public listUSBDevices(): Promise<Array<USBDevice>> {
        return this.send<Array<USBDevice>>("listUSBDevices");
    }

    public open(handle: string): Promise<void> {
        return this.send<void>("open", handle);
    }

    public close(handle: string): Promise<void> {
        return this.send<void>("close", handle);
    }

    public selectConfiguration(handle: string, id: number): Promise<void> {
        return this.send<void>("selectConfiguration", handle, id);
    }

    public claimInterface(handle: string, address: number): Promise<void> {
        return this.send<void>("claimInterface", handle, address);
    }

    public releaseInterface(handle: string, address: number): Promise<void> {
        return this.send<void>("releaseInterface", handle, address);
    }

    public selectAlternateInterface(handle: string, interfaceNumber: number, alternateSetting: number): Promise<void> {
        return this.send<void>("selectAlternateInterface", handle, interfaceNumber, alternateSetting);
    }

    public controlTransferIn(handle: string, setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult> {
        return this.send<USBInTransferResult>("controlTransferIn", handle, setup, length);
    }

    public controlTransferOut(handle: string, setup: USBControlTransferParameters, data?: ArrayBuffer | ArrayBufferView): Promise<USBOutTransferResult> {
        return this.send<USBOutTransferResult>("controlTransferOut", handle, setup, data);
    }

    public clearHalt(handle: string, direction: USBDirection, endpointNumber: number): Promise<void> {
        return this.send<void>("clearHalt", handle, direction, endpointNumber);
    }

    public transferIn(handle: string, endpointNumber: number, length: number): Promise<USBInTransferResult> {
        return this.send<USBInTransferResult>("transferIn", handle, endpointNumber, length);
    }

    public transferOut(handle: string, endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult> {
        return this.send<USBOutTransferResult>("transferOut", handle, endpointNumber, data);
    }

    public isochronousTransferIn(handle: string, endpointNumber: number, packetLengths: Array<number>): Promise<USBIsochronousInTransferResult> {
        return this.send<USBIsochronousInTransferResult>("isochronousTransferIn", handle, endpointNumber, packetLengths);
    }

    public isochronousTransferOut(handle: string, endpointNumber: number, data: BufferSource, packetLengths: Array<number>): Promise<USBIsochronousOutTransferResult> {
        return this.send<USBIsochronousOutTransferResult>("isochronousTransferOut", handle, endpointNumber, data, packetLengths);
    }

    public reset(handle: string): Promise<void> {
        return this.send<void>("reset", handle);
    }

    protected async send<T>(command: string, ...data: Array<wsRequestArg>): Promise<T> {
        this.sequence ++;

        const request: WSRequest = {
            sequence: this.sequence,
            command,
            data
        };

        const deferred = new Deferred<T>();
        this.deferreds.set(this.sequence, deferred);

        while (!this.connected) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.socket.send(JSON.stringify(request));
        return deferred.promise;
    }
}
