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

var USB = require("../").USB;

function handleDevicesFound(devices, selectFn) {
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdin.on("readable", () => {
        var input = process.stdin.read();
        if (input === "\u0003") {
            process.exit();
        } else {
            var index = parseInt(input);
            if (index && index <= devices.length) {
                process.stdin.setRawMode(false);
                selectFn(devices[index - 1]);
            }
        }
    });

    console.log("select a device to see it's active configuration:");
    devices.forEach((device, index) => {
        console.log(`${index + 1}: ${device.productName || device.serialNumber}`);
    });
}

var usb = new USB({
    devicesFound: handleDevicesFound
});

usb.requestDevice({
    filters: [{vendorId: 0x0d28}]
})
.then(device => {
    console.log(JSON.stringify(device, (key, value) => {
        if (key === "interfaces") return `[${value.length}...]`;
        return value;
    }, "\t"));
    process.exit();
})
.catch(error => {
    console.log(error.message);
    process.exit();
});
