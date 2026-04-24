// Serial Ports (supported in Chromium-based browsers only)
// Only one serial port can be open at a time.

// Serial port entry points for WebSerial, WebBluetooth, and Boardie

function MB_openSerialPort(which) {
	if (GP.boardie.isOpen) { return; }
	if ((which == 'webBLE') && hasWebBluetooth()) {
		bleSerial.connect();
	} else if ((which == 'webserial') && hasWebSerial()) {
		webSerialConnect();
	}
}

function MB_isOpenSerialPort() {
	if (GP.boardie.isOpen) { return true; }
	if (webBluetoothConnected()) { return true; }
	if (hasWebSerial()) return webSerialIsConnected();
	return false;
}

function MB_closeSerialPort() {
	if (GP.boardie.isOpen) {
		MB_closeBoardie();
	} else if (webBluetoothConnected()) {
		bleSerial.disconnect();
	} else if (hasWebSerial()) {
		webSerialDisconnect();
	}
	MB_serialInputBuffers = [];
}

function MB_readSerialPort() {
	if (MB_serialInputBuffers.length == 0) {
		return new Uint8Array(new ArrayBuffer(0)); // no data available
	}
	var count = 0;
	for (let i = 0; i < MB_serialInputBuffers.length; i++) {
		count += MB_serialInputBuffers[i].byteLength;
	}
	var result = new Uint8Array(new ArrayBuffer(count));
	var dst = 0;
	for (let i = 0; i < MB_serialInputBuffers.length; i++) {
		var buf = MB_serialInputBuffers[i];
		result.set(MB_serialInputBuffers[i], dst);
		dst += MB_serialInputBuffers[i].byteLength;
	}
	MB_serialInputBuffers = [];
	return result;
}

function MB_writeSerialPort(data) {
	if (GP.boardie.isOpen) {
		GP.boardie.iframe.contentWindow.postMessage(data, '*');
		return data.buffer.byteLength;
	} else if (webBluetoothConnected()) {
		return bleSerial.write_data(data);
	} else if (hasWebSerial()) {
		return webSerialWrite(data);
	}
	return 0;
}

async function MB_setSerialPortDTR(flag) {
	if (GP.boardie_IsOpen) {
		return; // do nothing
	} else if (hasWebSerial()) {
		if (!MB_webSerialPort) return; // port not open
		await MB_webSerialPort.setSignals({ dtr: flag, dataTerminalReady: flag }).catch(() => {});
	}
}

async function MB_setSerialPortRTS(flag) {
	if (GP.boardie_IsOpen) {
		return; // do nothing
	} else if (hasWebSerial()) {
		if (!MB_webSerialPort) return; // port not open
		await MB_webSerialPort.setSignals({ rts: flag, requestToSend: flag }).catch(() => {});
	}
}

async function MB_setSerialPortDTRandRTS(dtrFlag, rtsFlag) {
	if (hasWebSerial()) {
		if (!MB_webSerialPort) return; // port not open
		await MB_webSerialPort.setSignals(
			{ dtr: dtrFlag, dataTerminalReady: dtrFlag, rts: rtsFlag, requestToSend: rtsFlag }
		).catch(() => {});
	}
}

// WebSerial support for Chrome browser (navigator.serial API)
// Variables used by WebSerial and WebBluetooth

MB_webSerialPort = null;
MB_webSerialReader = null;
MB_serialInputBuffers = [];  // a list of Uint8 arrays
MB_serialPortListenersAdded = false;

function hasWebSerial() {
	return (typeof navigator.serial != 'undefined');
}

function webSerialIsConnected() {
	return !(!MB_webSerialPort || !MB_webSerialReader);
}

async function webSerialConnect() {
	// Prompt user to choose a serial port and open the one selected.

	var vendorIDs = [
		{ usbVendorId: 0x0403},		// FTDI
		{ usbVendorId: 0x0d28},		// micro:bit, Calliope
		{ usbVendorId: 0x10c4},		// Silicon Laboratories, Inc. (CP210x)
		{ usbVendorId: 0x1a86},		// CH340
		{ usbVendorId: 0x239a},		// AdaFruit
		{ usbVendorId: 0x2a03},		// Arduino
		{ usbVendorId: 0x2341},		// Arduino MKR Zero
		{ usbVendorId: 0x03eb},		// Atmel Corporation
		{ usbVendorId: 0x1366},		// SEGGER Calliope mini
		{ usbVendorId: 0x16c0},		// Teensy
		{ usbVendorId: 0x2E8A},		// Raspberry Pi Pico RP2040
		{ usbVendorId: 0x303a},		// Espressif USB JTAG/serial debug unit
		{ usbVendorId: 0x0483},		// STMicroelectronics
		{ usbVendorId: 0x1B9F, usbProductId: 0xF301},	// GHI/DUELink, MicroBlocks PID
		{ usbVendorId: 0x1B4F},		// XRP
		{ usbVendorId: 0x2886},		// Seeed
		{ usbVendorId: 0x0005},		// HC-05
	];
	webSerialDisconnect();
	MB_webSerialPort = await navigator.serial.requestPort({filters: vendorIDs}).catch((e) => { console.log(e); });
	if (!MB_webSerialPort) return; // no serial port selected
	await MB_webSerialPort.open({ baudRate: 115200 }).catch((e) => { window.alert(e); return; });
	MB_webSerialReader = await MB_webSerialPort.readable.getReader();
	webSerialReadLoop();
}

async function webSerialDisconnect() {
	if (MB_webSerialReader) await MB_webSerialReader.cancel().catch(() => {});
	if (MB_webSerialPort) await MB_webSerialPort.close().catch(() => {});
	MB_webSerialReader = null;
	MB_webSerialPort = null;
}

async function webSerialReadLoop() {
	try {
		while (true) {
			var { value, done } = await MB_webSerialReader.read();
			if (value) {
				MB_serialInputBuffers.push(value);
			}
			if (done) { // happens when MB_webSerialReader.cancel() is called by disconnect
				MB_webSerialReader.releaseLock();
				return;
			}
		}
	} catch (e) { // happens when board is unplugged
		console.log(e);
		await MB_webSerialPort.close().catch(() => {});
		MB_webSerialPort = null;
		MB_webSerialReader = null;
		console.log('Connection closed.');
	}
}

function webSerialWrite(data) {
	if (!MB_webSerialPort || !MB_webSerialPort.writable) return 0;  // port not open
	const w = MB_webSerialPort.writable.getWriter();
	w.write(data.buffer);
	w.releaseLock();
	return data.buffer.byteLength;
}

// Support for Web Bluetooth

function hasWebBluetooth() {
	return (typeof navigator.bluetooth != 'undefined');
}

function webBluetoothConnected() {
	return hasWebBluetooth() && bleSerial.isConnected();
}

// MicroBlocks UUIDs:
const MICROBLOCKS_SERVICE_UUID = 'bb37a001-b922-4018-8e74-e14824b3a638'
const MICROBLOCKS_RX_CHAR_UUID = 'bb37a002-b922-4018-8e74-e14824b3a638' // board receive characteristic
const MICROBLOCKS_TX_CHAR_UUID = 'bb37a003-b922-4018-8e74-e14824b3a638' // board transmit characteristic

const BLE_PACKET_LEN = 240; // Max BLE attribute length is 512 but 240 gives best performance

class NimBLESerial {
	// Device to communicate over BLE using the Nordic Semiconductor UART service

	constructor() {
		this.device = undefined;
		this.service = undefined;
		this.rx_char = undefined;
		this.connected = false;
		this.sendInProgress = false;
	}

	handle_disconnected(event) {
		console.log("BLE disconnected");
		this.rx_char = undefined;
		this.connected = false;
		this.sendInProgress = false;
	}

	handle_read(event) {
		let data = new Uint8Array(event.target.value.buffer);
		MB_serialInputBuffers.push(data);
	}

	async connect() {
		// Connect to a microcontroller
		this.device = await navigator.bluetooth.requestDevice({
			filters: [{ services: [MICROBLOCKS_SERVICE_UUID] }]
		})
		this.device.addEventListener('gattserverdisconnected', this.handle_disconnected.bind(this));
		const server = await this.device.gatt.connect();
		this.service = await server.getPrimaryService(MICROBLOCKS_SERVICE_UUID);
		const tx_char = await this.service.getCharacteristic(MICROBLOCKS_TX_CHAR_UUID);
		this.rx_char = await this.service.getCharacteristic(MICROBLOCKS_RX_CHAR_UUID);
		await tx_char.startNotifications();
		// bind overrides the default this=tx_char to this=the NimBLESerial
		tx_char.addEventListener("characteristicvaluechanged", this.handle_read.bind(this));
		this.connected = true;
		this.sendInProgress = false;
		console.log("BLE connected");
	}

	disconnect() {
		if (this.device != undefined) {
			this.device.gatt.disconnect();
		}
	}

	isConnected() {
		return this.connected;
	}

	write_data(data) {
		// Write the given data (a Uint8Array) and return the number of bytes written.

		if ((this.rx_char == undefined) || !this.connected) {
			console.log("Not connected");
			return 0;
		}
		if (this.sendInProgress) {
			console.log("Send in progress in gpSupport.js write_data()");
			return 0;
		}
		let byteCount = (data.length > BLE_PACKET_LEN) ? BLE_PACKET_LEN : data.length;
		this.async_write_data(data.subarray(0, byteCount));
		return byteCount;
 	}

	async async_write_data(data) {
		if (this.rx_char == undefined) return;
		this.sendInProgress = true;
		try {
			await this.rx_char.writeValueWithoutResponse(data);
		} catch (error) {
			// print the error; give up if BLE has been disconnected
			console.log("BLE write failed:\n ", error);
		}
		this.sendInProgress = false;
	}
}

const bleSerial = new NimBLESerial();
