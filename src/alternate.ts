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

import { USBEndpoint } from "./endpoint";
import { W3CUSBAlternateInterface } from "./interfaces";

/**
 * USB Alternate Interface
 */
export class USBAlternateInterface implements W3CUSBAlternateInterface {

    /**
     * The alternate setting for this interface
     */
    public readonly alternateSetting: number = null;

    /**
     * The class of this interface
     */
    public readonly interfaceClass: number = null;

    /**
     * The sub class of this interface
     */
    public readonly interfaceSubclass: number = null;

    /**
     * The protocol of this interface
     */
    public readonly interfaceProtocol: number = null;

    /**
     * The name of this interface
     */
    public readonly interfaceName?: string = null;

    /**
     * The array of endpoints on this interface
     */
    public readonly endpoints: Array<USBEndpoint> = [];

    /**
     * @hidden
     */
    constructor(init?: Partial<USBAlternateInterface>) {
        this.alternateSetting = init.alternateSetting;
        this.interfaceClass = init.interfaceClass;
        this.interfaceSubclass = init.interfaceSubclass;
        this.interfaceProtocol = init.interfaceProtocol;
        this.interfaceName = init.interfaceName;
        this.endpoints = init.endpoints;
    }
}
