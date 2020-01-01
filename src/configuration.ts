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

import { USBInterface } from "./interface";
import { W3CUSBConfiguration } from "./interfaces";

/**
 * USB Configuration
 */
export class USBConfiguration implements W3CUSBConfiguration {

    /**
     * The value of this configuration
     */
    public readonly configurationValue: number = null;

    /**
     * The name of this configuration
     */
    public readonly configurationName?: string = null;

    /**
     * The array of interfaces on this configuration
     */
    public readonly interfaces: Array<USBInterface> = [];

    /**
     * @hidden
     */
    constructor(init?: Partial<USBConfiguration>) {
        this.configurationValue = init.configurationValue;
        this.configurationName = init.configurationName;
        this.interfaces = init.interfaces;
    }
}
