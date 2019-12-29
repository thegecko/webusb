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

import { adapter } from "./adapter";
import { W3CUSBInterface } from "./interfaces";
import { USBAlternateInterface } from "./alternate";

/**
 * USB Interface
 */
export class USBInterface implements W3CUSBInterface {

    /**
     * Number of this interface
     */
    public readonly interfaceNumber: number = null;

    /**
     * Array of alternate interfaces
     */
    public readonly alternates: Array<USBAlternateInterface> = [];

    private _claimed: boolean = false;
    /**
     * Whether this interface is claimed
     */
    public get claimed(): boolean {
        return this._claimed;
    }

    private _currentAlternate: number = 0;
    /**
     * Return the current alternate interface
     */
    public get alternate(): USBAlternateInterface {
        return this.alternates.find(alternate => alternate.alternateSetting === this._currentAlternate);
    }

    /**
     * @hidden
     */
    public readonly _handle: string = null;

    /**
     * @hidden
     */
    constructor(init?: Partial<USBInterface>) {
        this.interfaceNumber = init.interfaceNumber;
        this.alternates = init.alternates;

        this._handle = init._handle;
    }

    /**
     * @hidden
     */
    public selectAlternateInterface(alternateSetting: number): Promise<void> {
        return adapter.selectAlternateInterface(this._handle, this.interfaceNumber, alternateSetting)
        .then(() => {
            this._currentAlternate = alternateSetting;
        });
    }

    /**
     * @hidden
     */
    public claimInterface(): Promise<void> {
        return adapter.claimInterface(this._handle, this.interfaceNumber)
        .then(() => {
            this._claimed = true;
        });
    }

    /**
     * @hidden
     */
    public releaseInterface(): Promise<void> {
        return adapter.releaseInterface(this._handle, this.interfaceNumber)
        .then(() => {
            this._claimed = false;
        });
    }

    /**
     * @hidden
     */
    public reset() {
        this._currentAlternate = 0;
    }
}
