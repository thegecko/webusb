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

const USB = require("../").USB;

const devicesFound = devices => new Promise(resolve => {
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdin.on("readable", () => {
        const input = process.stdin.read();

        if (input === "\u0003") {
            process.exit();
        } else {
            const index = parseInt(input);
            if (index && index <= devices.length) {
                process.stdin.setRawMode(false);
                resolve(devices[index - 1]);
            }
        }
    });

    console.log("select a device to see it's active configuration:");
    devices.forEach((device, index) => {
        console.log(`${index + 1}: ${device.productName || device.serialNumber}`);
    });
});

const usb = new USB({
    devicesFound
});

(async () => {
    try {
        const device = await usb.requestDevice({
            filters: [{vendorId: 0x0d28}, {vendorId: 0x0483}]
        });

        console.log(JSON.stringify(device, (key, value) => {
            if (key === "interfaces") return `[${value.length}...]`;
            return value;
        }, "\t"));
    } catch (error) {
        console.log(error.message);
    }
})();

