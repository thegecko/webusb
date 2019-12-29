# Node WebUSB
Node.js implementation of the WebUSB Specification

## Prerequisites

[Node.js > v8.14.0](https://nodejs.org), which includes `npm`.

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
const usb = require("webusb").usb;

const device = usb.requestDevice({
    filters: [{vendorId: 0x0d28}]
});
...
```

The first device matching the filters will be returned.

### Creating your own usb instances

You may want to create your own instance of the `USB` class. For example, to inject a device chooser function:

```JavaScript
const USB = require("webusb").USB;

const devicesFound = async devices => {
    // If one of the devices can be automatically selected, you can return it
    for (const device of devices) {
        if (device.productName === "myName") return device;
    }

    // Otherwise return a deferred Promise and resolve it later with a device
}

const usb = new USB({
    devicesFound
});

const device = usb.requestDevice({
    filters: [{vendorId: 0x0d28}]
});
...
```

## Specification

The WebUSB specification can be found here:

https://wicg.github.io/webusb/
