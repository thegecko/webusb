# Node WebUSB
Node.js implementation of the WebUSB Specification

## Prerequisites

[Node.js > v6.15.0](https://nodejs.org), which includes `npm`.

## Installation

```bash
$ npm install webusb
```

## Usage

The module exports a default `navigator.usb` instance and the `USB` class to allow you to instantiate your own usb instances:

- [usb](globals.html#usb)
- [USB()](classes/usb.html)

### Using the default usb instance

To use existing WebUSB scripts, you can simply use the default `usb` instance in place of the `navigator.usb` object:

```JavaScript
var usb = require("webusb").usb;

usb.requestDevice({
    filters: [{vendorId: 0x0d28}]
})
.then(device => {
    ...
})
```

The first device matching the filters will be returned.

### Creating your own usb instances

You may want to create your own instance of the `USB` class. For example, to inject a device chooser function:

```JavaScript
var USB = require("webusb").USB;

function handleDevicesFound(devices, selectFn) {
    // If one of the devices can be automatically selected, you can return it
    for (var i = 0; i < devices.length; i++) {
        if (devices[i].productName === "myName") return devices[i];
    }

    // Otherwise store the selectFn somewhere and execute it later with a device to select it
}

var usb = new USB({
    devicesFound: handleDevicesFound
});

usb.requestDevice({
    filters: [{vendorId: 0x0d28}]
})
.then(device => {
    ...
})
```

## Specification

The WebUSB specification can be found here:

https://wicg.github.io/webusb/
