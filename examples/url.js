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

const path = require("path");
const exec = require("child_process").exec;
const usb = require("../").usb;

const openUrl = url => {
    console.log(`Opening url: ${url}`);

    const cmd = path.join(__dirname, "xdg-open");
    if (process.platform === "darwin") cmd = "open";
    else if (process.platform === "win32") cmd = `start ""`;

    exec(`${cmd} ${url}`);
}

const deviceConnected = event => {
    console.log(`Device '${event.device.productName || event.device.serialNumber}' connected`);
    if (event.device.url) openUrl(event.device.url);
}

usb.onconnect = deviceConnected;

usb.ondisconnect = event => {
    console.log(`Device '${event.device.productName || event.device.serialNumber}' disconnected`);
};

console.log("Searching for Web USB devices...");

(async () => {
    try {
        const device = await usb.requestDevice({
            filters: [{vendorId: 0x0d28}]
        });

        deviceConnected({ device });
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
})();
