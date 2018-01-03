# Node WebUSB
Node.js implementation of the WebUSB Specification

[![Circle CI](https://circleci.com/gh/thegecko/webusb.svg?style=shield)](https://circleci.com/gh/thegecko/webusb/)

## Prerequisites

[Node.js > v4.8.0](https://nodejs.org), which includes `npm`.

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

- [x] getDevices
- [ ] requestDevice

### USBDevice

- [ ] USBDevice
- [ ] USBDevice.open()
- [ ] USBDevice.close()
- [ ] USBDevice.selectConfiguration()
- [ ] USBDevice.claimInterface()
- [ ] USBDevice.releaseInterface()
- [ ] USBDevice.selectAlternateInterface()
- [ ] USBDevice.controlTransferIn()
- [ ] USBDevice.controlTransferOut()
- [ ] USBDevice.clearHalt()
- [ ] USBDevice.transferIn()
- [ ] USBDevice.transferOut()
- [ ] USBDevice.isochronousTransferIn()
- [ ] USBDevice.isochronousTransferOut()
- [ ] USBDevice.reset()

### Events

- [ ] connect
- [ ] disconnect

### Other

- [ ] Device selector hook
- [ ] Examples
- [ ] API Documentation
