# Node WebUSB
Node.js implementation of the WebUSB Specification

[![Circle CI](https://circleci.com/gh/thegecko/webusb.svg?style=shield)](https://circleci.com/gh/thegecko/webusb/)
[![npm](https://img.shields.io/npm/dm/webusb.svg)](https://www.npmjs.com/package/webusb)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](http://opensource.org/licenses/MIT)

## Prerequisites

[Node.js > v8.14.0](https://nodejs.org), which includes `npm`.

## Installation

```bash
$ npm install webusb
```

## Getting Started

See the examples in [examples](https://github.com/thegecko/webusb/tree/master/examples/) or view the API documentation at:

https://thegecko.github.io/webusb/

## Specification

The WebUSB specification can be found here:

https://wicg.github.io/webusb/

## Implementation Status

### USB

- [x] getDevices()
- [x] requestDevice()

### USBDevice

- [x] usbVersionMajor
- [x] usbVersionMinor
- [x] usbVersionSubminor
- [x] deviceClass
- [x] deviceSubclass
- [x] deviceProtocol
- [x] vendorId
- [x] productId
- [x] deviceVersionMajor
- [x] deviceVersionMinor
- [x] deviceVersionSubminor
- [x] manufacturerName
- [x] productName
- [x] serialNumber
- [x] configuration
- [x] configurations
- [x] opened
- [x] open()
- [x] close()
- [x] selectConfiguration()
- [x] claimInterface()
- [x] releaseInterface()
- [x] selectAlternateInterface()
- [x] controlTransferIn()
- [x] controlTransferOut() - `bytesWritten` always equals the initial buffer length
- [x] transferIn()
- [x] transferOut() - `bytesWritten` always equals the initial buffer length
- [x] clearHalt()
- [x] reset()
- [ ] isochronousTransferIn() - currently unsupported in node-usb
- [ ] isochronousTransferOut() - currently unsupported in node-usb

### Events

- [x] connect
- [x] disconnect

### Other

- [x] USBDevice.url
- [x] Device selector hook
- [x] API Documentation
- [x] Examples
