/*
* Node WebUSB
* Copyright (c) 2017 Rob Moran
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

import { W3CUSBEndpoint } from "./interfaces";

/**
 * USB Endpoint
 */
export class USBEndpoint implements W3CUSBEndpoint {

    /**
     * The number of this endpoint
     */
    public readonly endpointNumber: number = null;

    /**
     * The direction of this endpoint
     */
    public readonly direction: USBDirection = null;

    /**
     * The type of this endpoint
     */
    public readonly type: USBEndpointType = null;

    /**
     * The packet size of this endpoint
     */
    public readonly packetSize: number = null;

    /**
     * @hidden
     */
    constructor(init?: Partial<USBEndpoint>) {
        this.endpointNumber = init.endpointNumber;
        this.direction = init.direction;
        this.type = init.type;
        this.packetSize = init.packetSize;
    }
}
