/* globals waitMSecs, isMobile, localized,
	MB_openSerialPort, MB_closeSerialPort, MB_isOpenSerialPort, MB_readSerialPort, MB_writeSerialPort */

class MB_Connection {
	constructor(mbEditor) {
		this.editor = mbEditor;
		this.msgDict = null;
		this.portName = null;
		this.isConnected = false;
		this.connectionStartTime = null;
		this.lastScanMSecs = null;
		this.pingSentMSecs = null;
		this.lastPingRecvMSecs = null;
		this.recvBuf = null;
		this.vmVersion = null;
		this.boardType = null;
		this.readFromBoard = null;
		this.decompiler = null;
	}

	// --- Helpers ---

	joinBytes(a, b) {
		const result = new Uint8Array(a.length + b.length);
		result.set(a);
		result.set(b, a.length);
		return result;
	}

	bytesToString(bytes) {
		return new TextDecoder().decode(bytes);
	}

	async waitMSecs(msecs) {
		const sleep = function (msecs) {
			return (new Promise( resolve => setTimeout(resolve, msecs) ));
		}
		await sleep(msecs);
	}

	// --- Connection Handling ---

	connect(useBLE = false) {
		if (!hasWebSerial()) {
			// running in a browser w/o WebSerial (or it is not enabled)
			alert(localized('Only recent Chrome and Edge browsers support WebSerial and WebBluetooth.'));
			return;
		}
		if (useBLE) {
			MB_openSerialPort('webBLE');
			this.portName = 'webBLE';
		} else {
			MB_openSerialPort('webserial');
			this.portName = 'webserial';
		}
		this.connectionStartTime = Date.now();
		this.isConnected = true;
		this.lastPingRecvMSecs = 0;
		this.sendMsg('pingMsg');
	}

	connectBoardie() {
		this.browserOpenBoardie();
		waitMSecs(100); // make sure Boardie is ready to receive messages
		this.connectionStartTime = Date.now();
		this.portName = 'boardie';
		this.isConnected = true;
		this.lastPingRecvMSecs = 0;
		this.sendMsg('pingMsg');
	}

	disconnect() {
		if (this.portName !== 'boardie') {
			this.stopAndSyncScripts();
			this.sendStartAll();
		} else {
			this.browserCloseBoardie();
		}
		MB_closeSerialPort();
		this.portName = null;
		this.isConnected = false;
		this.vmVersion = null;
		this.boardType = null;

		// remove running highlights and result bubbles when disconnected
		editor.clearRunningHighlights();
	}

	connectedToBoard() {
		const pingTimeout = 8000;
		if (!this.isConnected || !MB_isOpenSerialPort()) return false;
		if (this.lastPingRecvMSecs == null || this.lastPingRecvMSecs === 0) return false;
		return (Date.now() - this.lastPingRecvMSecs) < pingTimeout;
	}

	connectedViaBLE() {
		return this.portName === 'webBLE';
	}

	updateConnection() {
		const pingSendInterval = 2000; // msecs between pings
		const pingTimeout = 8000;
		if (this.pingSentMSecs == null) this.pingSentMSecs = 0;
		if (this.lastPingRecvMSecs == null) this.lastPingRecvMSecs = 0;

		if (this.decompiler != null) return 'connected';
		if (this.portName == null) return 'not connected';

		// handle connection attempt in progress
		if (this.connectionStartTime != null) return this.tryToConnect();

		// if port is not open, try to reconnect or find a different board
		if (!this.isConnected || !MB_isOpenSerialPort()) {
			editor.clearRunningHighlights();
			this.disconnect();
			this.portName = null; // clear 'boardie' when boardie is closed with power button
			return 'not connected'; // user must initiate connection attempt
		}

		// if the port is open and it is time, send a ping
		const now = Date.now();
		if ((now - this.pingSentMSecs) > pingSendInterval) {
			if ((now - this.pingSentMSecs) > 5000) {
				// it's been a long time since we sent a ping; laptop may have been asleep
				// set lastPingRecvMSecs to now to suppress warnings
				this.lastPingRecvMSecs = now;
			}
			this.sendMsg('pingMsg');
			this.pingSentMSecs = now;
			return 'connected';
		}

		const msecsSinceLastPing = now - this.lastPingRecvMSecs;
		if (msecsSinceLastPing < pingTimeout) {
			// got a ping recently: we're connected
			return 'connected';
		} else {
			// ping timeout: close port to force reconnection
			console.log('Lost communication to the board');
			editor.clearRunningHighlights();
			this.disconnect();
			return 'not connected';
		}
	}

	justConnected() {
		// Called when a board has just connected (browser or stand-alone).
		console.log('Connected to', this.portName);
		this.connectionStartTime = null;
		this.vmVersion = null;
		this.sendMsgSync('getVersionMsg');
		this.sendStopAll();
		editor.clearRunningHighlights();
		this.setDefaultSerialDelay();
		this.abortFileTransfer();
		this.processMessages(); // process incoming version message
		if (this.readFromBoard) {
			this.readFromBoard = false;
			this.readCodeFromBoard();
		} else {
			const reuseCodeIfPossible = true; // set this to true to attempt to reuse code on board
			if (!reuseCodeIfPossible || !this.boardHasSameProject()) {
				if (reuseCodeIfPossible) console.log('Full download');
				this.clearBoardIfConnected();
			} else {
				console.log('Incremental download', this.vmVersion, this.boardType);
			}
			editor.showDownloadProgress(2, 0);
			this.stopAndSyncScripts(true);
			this.softReset();
		}
	}

	tryToConnect() {
		// Called when connectionStartTime is not null, indicating that we are trying
		// to establish a connection to a board.

		if (this.portName !== 'boardie') {
			if (MB_isOpenSerialPort()) {
				this.isConnected = true;
				if (this.lastPingRecvMSecs !== 0) { // got a ping; we're connected!
					this.justConnected();
					return 'connected';
				}
				this.sendMsg('pingMsg'); // send another ping
				return 'not connected'; // don't make circle green until successful ping
			} else {
				this.isConnected = false;
				return 'not connected';
			}
		}

		const connectionAttemptTimeout = 5000; // milliseconds

		// check connection status only N times/sec
		const now = Date.now();
		if (this.lastScanMSecs == null) this.lastScanMSecs = 0;
		const msecsSinceLastScan = now - this.lastScanMSecs;
		if (msecsSinceLastScan > 0 && msecsSinceLastScan < 20) return 'not connected';
		this.lastScanMSecs = now;

		if (this.connectionStartTime != null) {
			if (this.lastPingRecvMSecs !== 0) { // got a ping; we're connected!
				this.justConnected();
				return 'connected';
			}
			this.sendMsg('pingMsg'); // send another ping
			if (now < this.connectionStartTime) this.connectionStartTime = now; // clock wrap
			if ((now - this.connectionStartTime) < connectionAttemptTimeout) return 'not connected'; // keep trying
		}

		this.disconnect();
		this.connectionStartTime = null;
		return 'not connected';
	}

	// --- Boardie Support ---

	browserOpenBoardie() {
		// XXX TO DO
	}

	browserCloseBoardie() {
		// XXX TO DO
	}

	// --- Message handling ---

	msgNameToID(msgName) {
		if (Number.isInteger(msgName)) return msgName;
		if (this.msgDict == null) {
			this.msgDict = {
				'chunkCodeMsg': 1,
				'deleteChunkMsg': 2,
				'startChunkMsg': 3,
				'stopChunkMsg': 4,
				'startAllMsg': 5,
				'stopAllMsg': 6,
				'getVarMsg': 7,
				'setVarMsg': 8,
				'getVarNamesMsg': 9,
				'clearVarsMsg': 10,
				'getChunkCRCMsg': 11,
				'getVersionMsg': 12,
				'getAllCodeMsg': 13,
				'deleteAllCodeMsg': 14,
				'systemResetMsg': 15,
				'taskStartedMsg': 16,
				'taskDoneMsg': 17,
				'taskReturnedValueMsg': 18,
				'taskErrorMsg': 19,
				'outputValueMsg': 20,
				'varValueMsg': 21,
				'versionMsg': 22,
				'chunkCRCMsg': 23,
				'clearGraphMsg': 24,
				'codeStoreFullMsg': 25,
				'pingMsg': 26,
				'broadcastMsg': 27,
				'chunkAttributeMsg': 28,
				'varNameMsg': 29,
				'extendedMsg': 30,
				'enableBLEMsg': 31,
				'chunkCode16Msg': 32,
				'codeStoreUsedMsg': 33,
				'snapshotCodeToFileMsg': 34,
				'getAllCRCsMsg': 38,
				'allCRCsMsg': 39,
				'deleteFile': 200,
				'listFiles': 201,
				'fileInfo': 202,
				'startReadingFile': 203,
				'startWritingFile': 204,
				'fileChunk': 205,
			};
		}
		const msgType = this.msgDict[msgName];
		if (msgType == null) throw new Error('Unknown message: ' + msgName);
		return msgType;
	}

	errorString(errID) {
		// Return an error string for the given errID from error definitions copied and pasted from interp.h
		const defsFromHeaderFile = `
#define noError					0	// No error
#define unspecifiedError		1	// Unknown error
#define badChunkIndexError		2	// Unknown chunk index

#define insufficientMemoryError 10	// Insufficient memory to allocate object
#define needsListError			11	// Needs a list
#define needsBooleanError		12	// Needs a boolean
#define needsIntegerError		13	// Needs an integer
#define needsStringError		14	// Needs a string
#define nonComparableError		15	// Those objects cannot be compared for equality
#define arraySizeError			16	// List size must be a non-negative integer
#define needsIntegerIndexError	17	// List or string index must be an integer
#define indexOutOfRangeError	18	// List or string index out of range
#define byteArrayStoreError		19	// A ByteArray can only store integer values between 0 and 255
#define hexRangeError			20	// Hexadecimal input must between between -40000000 and 3FFFFFFF
#define i2cDeviceIDOutOfRange	21	// I2C device ID must be between 0 and 127
#define i2cRegisterIDOutOfRange 22	// I2C register must be between 0 and 255
#define i2cValueOutOfRange		23	// I2C value must be between 0 and 255
#define notInFunction			24	// Attempt to access an argument outside of a function
#define badForLoopArg			25	// for-loop argument must be a positive integer or list
#define stackOverflow			26	// Insufficient stack space
#define primitiveNotImplemented 27	// Primitive not implemented in this virtual machine
#define notEnoughArguments		28	// Not enough arguments passed to primitive
#define waitTooLong				29	// The maximum wait time is 3600000 milliseconds (one hour)
#define noWiFi					30	// This board does not support WiFi
#define zeroDivide				31	// Division (or modulo) by zero is not defined
#define argIndexOutOfRange		32	// Argument index out of range
#define needsIndexable			33	// Needs an indexable type such as a string or list
#define joinArgsNotSameType		34	// All arguments to join must be the same type (e.g. lists)
#define i2cTransferFailed		35	// I2C transfer failed
#define needsByteArray			36	// Needs a byte array
#define serialPortNotOpen		37	// Serial port not open
#define serialWriteTooBig		38	// Serial port write is limited to 128 bytes
#define needsListOfIntegers		39	// Needs a list of integers
#define byteOutOfRange			40	// Needs a value between 0 and 255
#define needsPositiveIncrement	41	// Range increment must be a positive integer
#define needsIntOrListOfInts	42	// Needs an integer or a list of integers
#define wifiNotConnected		43	// Not connected to a WiFi network
#define cannotConvertToInteger	44	// Cannot convert that to an integer
#define cannotConvertToBoolean	45	// Cannot convert that to a boolean
#define cannotConvertToList		46	// Cannot convert that to a list
#define cannotConvertToByteArray 47 // Cannot convert that to a byte array
#define unknownDatatype			48	// Unknown datatype
#define invalidUnicodeValue		49	// Unicode values must be between 0 and 1114111 (0x10FFFF)
#define cannotUseWithBLE		50	// Cannot use this feature when board is connected to IDE via Bluetooth
#define bad8BitBitmap			51	// Needs an 8-bit bitmap: a list containing the bitmap width and contents (a byte array)
#define badColorPalette			52	// Needs a color palette: a list of positive 24-bit integers representing RGB values
#define encoderNotStarted		53	// Encoder not started; pin may not support interrupts
#define scriptTooLarge			54	// Script too large
#define udpPortNotOpen			55	// UDP port not open
#define cannotUseWhileIDEConnected 56 // This primitive cannot be used while connected to the IDE
`;
		for (const line of defsFromHeaderFile.split('\n')) {
			const words = line.trim().split(/\s+/);
			if (words.length > 2 && words[0] === '#define') {
				if (errID === parseInt(words[2])) {
					return 'Error: ' + words.slice(4).join(' ');
				}
			}
		}
		return 'Unknown error: ' + errID;
	}

	readAvailableSerialData() {
		// Read any available data into recvBuf so that waitForResponse will await fresh data.
		if (!this.isConnected) return;
		waitMSecs(20); // leave some time for queued data to arrive
		if (this.recvBuf == null) this.recvBuf = new Uint8Array(0);
		const s = MB_readSerialPort();
		if (s != null) this.recvBuf = this.joinBytes(this.recvBuf, s);
	}

	waitForResponse() {
		// Wait for some data to arrive from the board. This is taken to mean that the
		// previous operation has completed. Return true if a response was received.
		this.sendMsg('pingMsg');
		const timeout = 10000; // must be less than ping timeout
		let iter = 1;
		const start = Date.now();
		while ((Date.now() - start) < timeout) {
			if (!this.isConnected) return false;
			const s = MB_readSerialPort();
			if (s != null) {
				this.recvBuf = this.joinBytes(this.recvBuf, s);
				return true;
			}
			if ((iter % 50) === 0) this.sendMsg('pingMsg');
			iter += 1;
			waitMSecs(5);
		}
		return false;
	}

	processMessages() {
		if (this.recvBuf == null) this.recvBuf = new Uint8Array(0);
		for (let i = 0; i < 100; i++) { // process up to N messages
			if (!this.processNextMessage()) return; // done!
		}
	}

	processNextMessage() {
		// Process the next message, if any. Return false when there are no more messages.
		if (!this.isConnected || !MB_isOpenSerialPort()) return false;

		// Read any available bytes and append to recvBuf
		const s = MB_readSerialPort();
		if (s != null) this.recvBuf = this.joinBytes(this.recvBuf, s);
		if (this.recvBuf.length < 3) return false; // not enough bytes for even a short message

		// Parse and dispatch messages
		const firstByte = this.recvBuf[0];
		const byteTwo = this.recvBuf[1];
		if (byteTwo < 1 || (40 <= byteTwo && byteTwo < 200) || byteTwo > 205) {
			console.log('Serial error, opcode:', this.recvBuf[1]);
			this.discardMessage();
			return true;
		}
		if (firstByte === 250) { // short message
			const msg = this.recvBuf.slice(0, 3);
			this.recvBuf = this.recvBuf.slice(3); // remove message
			this.handleMessage(msg);
		} else if (firstByte === 251) { // long message
			if (this.recvBuf.length < 5) return false; // incomplete length field
			const bodyBytes = (this.recvBuf[4] << 8) | this.recvBuf[3];
			if (bodyBytes >= 1024) {
				console.log('Serial error, length:', bodyBytes);
				this.discardMessage();
				return true;
			}
			if (this.recvBuf.length < (5 + bodyBytes)) return false; // incomplete body
			const msg = this.recvBuf.slice(0, bodyBytes + 5);
			this.recvBuf = this.recvBuf.slice(bodyBytes + 5); // remove message
			this.handleMessage(msg);
		} else {
			console.log('Serial error, start byte:', firstByte);
			console.log(this.bytesToString(this.recvBuf)); // show the string (could be an ESP error message)
			this.discardMessage();
		}
		return true;
	}

	discardMessage() { this.skipMessage(true); }

	skipMessage(discard) {
		// Discard bytes in recvBuf until the start of the next message, if any.
		const end = this.recvBuf.length;
		for (let i = 1; i < end; i++) { // start at index 1 to skip the current (bad) start byte
			const byte = this.recvBuf[i];
			if (byte === 250 || byte === 251) {
				if (discard === true) console.log('	   ', this.bytesToString(this.recvBuf.slice(0, i)));
				this.recvBuf = this.recvBuf.slice(i);
				return;
			}
		}
		if (discard === true) console.log('	   ', this.bytesToString(this.recvBuf));
		this.recvBuf = new Uint8Array(0); // no message start found; discard entire buffer
	}

	// --- Message handling ---

	handleMessage(msg) {
		this.lastPingRecvMSecs = Date.now(); // reset ping timer when any valid message is received
		const op = msg[1];
		if (op === this.msgNameToID('taskStartedMsg')) {
			this.updateRunning(msg[2], true);
		} else if (op === this.msgNameToID('taskDoneMsg')) {
			this.updateRunning(msg[2], false);
		} else if (op === this.msgNameToID('taskReturnedValueMsg')) {
			const chunkID = msg[2];
			this.showResult(chunkID, this.returnedValue(msg), false, true);
			this.updateRunning(chunkID, false);
		} else if (op === this.msgNameToID('taskErrorMsg')) {
			const chunkID = msg[2];
			this.showError(chunkID, this.errorString(msg[5]));
			this.updateRunning(chunkID, false);
		} else if (op === this.msgNameToID('outputValueMsg')) {
			const chunkID = msg[2];
			if (chunkID === 255) {
				console.log(this.returnedValue(msg));
			} else if (chunkID === 254) {
				this.addLoggedData(String(this.returnedValue(msg)));
			} else {
				this.showResult(chunkID, this.returnedValue(msg), false, true);
			}
		} else if (op === this.msgNameToID('varValueMsg')) {
			// not currently used
			// const varID = msg[2];
			// const varValue = this.returnedValue(msg);
		} else if (op === this.msgNameToID('versionMsg')) {
			this.versionReceived(this.returnedValue(msg));
		} else if (op === this.msgNameToID('chunkCRCMsg')) {
			this.crcReceived(msg[2], Array.from(msg).slice(5));
		} else if (op === this.msgNameToID('allCRCsMsg')) {
			this.allCRCsReceived(Array.from(msg).slice(5));
		} else if (op === this.msgNameToID('pingMsg')) {
			this.lastPingRecvMSecs = Date.now();
		} else if (op === this.msgNameToID('codeStoreFullMsg')) {
			// inform code store manager that code store is full
			// codeStoreFull = true
		} else if (op === this.msgNameToID('broadcastMsg')) {
			// not currently used
			// const broadcastMsg = this.bytesToString(msg.slice(5));
		} else if (op === this.msgNameToID('chunkCode16Msg')) {
			this.receivedChunk(msg[2], msg[5], Array.from(msg.slice(6)));
		} else if (op === this.msgNameToID('codeStoreUsedMsg')) {
			this.receivedCodeStoreUsed(Array.from(msg.slice(5)));
		} else if (op === this.msgNameToID('varNameMsg')) {
			this.receivedVarName(msg[2], this.bytesToString(msg.slice(5)), msg.length - 5);
		} else if (op === this.msgNameToID('fileInfo')) {
			this.recordFileTransferMsg(msg.slice(5));
		} else if (op === this.msgNameToID('fileChunk')) {
			this.recordFileTransferMsg(msg.slice(5));
		} else if (op === this.msgNameToID('clearGraphMsg')) {
			this.clearLoggedData();
		} else {
			console.log('msg:', Array.from(msg));
		}
	}

	// --- Message sending ---

	sendMsg(msgName, chunkID, byteList) {
		if (!this.isConnected) return;

		if (chunkID == null) chunkID = 0;
		const msgID = this.msgNameToID(msgName);
		let msgArr;
		if (byteList == null) { // short message
			msgArr = [250, msgID, chunkID];
		} else { // long message
			const bodyByteCount = byteList.length + 1;
			msgArr = [251, msgID, chunkID, bodyByteCount & 255, (bodyByteCount >> 8) & 255,
				...byteList, 254]; // 254 is terminator byte (helps board detect dropped bytes)
		}
		let dataToSend = new Uint8Array(msgArr);

		if (this.portName === 'boardie') { // send all data at once to boardie
			MB_writeSerialPort(dataToSend);
			return;
		}

		while (dataToSend.length > 0) {
			let chunkSize = dataToSend.length;
			if (this.portName !== 'webBLE' || isMobile()) {
				// Note: Serial receive buffer is only 63 bytes on many boards so limit chunkSize.
				// In addition, some mobile devices (e.g. iPhones 11-13 and some Android devices)
				// fail if over 63 bytes are written to BLE at a time due to a hardware/driver issue.
				chunkSize = Math.min(63, chunkSize);
			}
			const chunk = dataToSend.slice(0, chunkSize);
			const bytesSent = MB_writeSerialPort(chunk);
			if (!MB_isOpenSerialPort()) {
				this.disconnect();
				return;
			}
			waitMSecs(3); // limit throughput to avoid overrunning buffer when board is busy
			if (bytesSent < chunkSize) waitMSecs(25); // output queue full; wait a bit
			dataToSend = dataToSend.slice(bytesSent);
		}
	}

	sendMsgSync(msgName, chunkID, byteList) {
		// Send a message followed by a 'pingMsg', then wait for a ping response from VM.
		this.readAvailableSerialData();
		this.sendMsg(msgName, chunkID, byteList);
		if (this.portName === 'boardie') return true; // don't wait for a response

		if (!this.connectedToBoard()) return false;

		const ok = this.waitForResponse();
		if (!ok) {
			console.log('Lost communication to the board in sendMsgSync');
			this.disconnect();
			return false;
		}
		return true;
	}

}
