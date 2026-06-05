// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2026 John Maloney, Bernat Romagosa, and Jens Mönig

// MicroBlocksFirmwareInstaller.gp - Support for installing MicroBlocks firmware
// John Maloney, June, 2026

defineClass MicroBlocksFirmwareInstaller boardType boardMenu espBoards duelinkBoards

// Helper Functions

method initialize MicroBlocksFirmwareInstaller {
	boardType = (checkBoardType (smallRuntime))
	boardMenu = (array
		'micro:bit'
		'Calliope mini'
		'-'
		'Citilab ED1'
		'CoCube'
		'Databot'
		'Springbot'
		'micro:STEAMakers'
		'-'
		'RP2040 (Pico or Pico W)'
		'MakerPort'
		'-'
		'ESP32')
	espBoards = (array
		'Citilab ED1' 'CoCube' 'ESP32' 'Databot' 'micro:STEAMakers'
		'Springbot' 'Springbot Green' 'Springbot Gold')
	duelinkBoards = (array
		'DUELink' 'CincoBit' 'PixoBit' 'Clipit' 'DueSTEM' 'Ghizzy' 'Holiday Tree')
}

method isESPBoard MicroBlocksFirmwareInstaller {
	return (and (notNil boardType) (contains espBoards boardType))
}

method closePort MicroBlocksFirmwareInstaller {
	setPort (smallRuntime) 'disconnect'
}

// Browser Virtual Machine Intaller

method installVM MicroBlocksFirmwareInstaller eraseFlashFlag downloadLatestFlag {
	initialize this
	closeAllDialogs (findMicroBlocksEditor)
	if (contains duelinkBoards boardType) {
		closePort this
		openURL 'https://loader.duelink.com/microblocks'
		return
	}
	if (isOneOf boardType 'micro:bit' 'micro:bit v2') {
		installHexOrUF2File this 'micro:bit' false
	} (isOneOf boardType 'Calliope' 'Calliope mini' 'Calliope v3') {
		installHexOrUF2File this 'Calliope mini' false
	} ('MakerPort' == boardType) {
		adaFruitResetMessage this
	} (isOneOf boardType 'RP2040' 'Pico W') {
		rp2040ResetMessage this
	} (and
		(contains espBoards boardType)
		(confirm (global 'page') nil (join (localized 'Use board type ') boardType '?'))) {
			flashVM this boardType eraseFlashFlag downloadLatestFlag
	} else {
		menu = (menu 'Select board type:' (action 'installBoardFromMenu' this eraseFlashFlag downloadLatestFlag) true)
		for item boardMenu {
			if ('-' == item) {
				addLine menu
			} (or (not eraseFlashFlag) (contains espBoards item)) {
				addItem menu item
			}
		}
		popUpAtHand menu (global 'page')
	}
}

method installBoardFromMenu MicroBlocksFirmwareInstaller eraseFlashFlag downloadLatestFlag boardName {
	if (beginsWith 'Springbot' boardName) {
		flashVM this 'Springbot' eraseFlashFlag downloadLatestFlag
	} (isOneOf boardName 'Citilab ED1' 'CoCube' 'micro:STEAMakers' 'ESP32' 'Databot') {
		flashVM this boardName eraseFlashFlag downloadLatestFlag
	} else {
		installHexOrUF2File this boardName true
	}
}

method installHexOrUF2File MicroBlocksFirmwareInstaller boardName fromMenu {
	if (not fromMenu) {
		if (not (confirm (global 'page') nil (join (localized 'Use board type ') boardType '?'))) {
			return
		}
	}
	if (or ('micro:bit' == boardName) ('micro:bit v2' == boardName)) {
		vmFileName = 'vm_microbit-universal.hex'
		driveName = 'MICROBIT'
	} (or ('Calliope mini' == boardName) ('Calliope v3' == boardName)) {
		vmFileName = 'vm_calliope-universal.hex'
		driveName = 'MINI'
	} ('Circuit Playground Express' == boardName) {
		vmFileName = 'vm_circuitplay.uf2'
		driveName = 'CPLAYBOOT'
	} ('Circuit Playground Bluefruit' == boardName) {
		vmFileName = 'vm_cplay52.uf2'
		driveName = 'CPLAYBTBOOT'
	} ('Clue' == boardName) {
		vmFileName = 'vm_clue.uf2'
		driveName = 'CLUEBOOT'
	} ('MakerPort' == boardName) {
		vmFileName = 'vm_makerport.uf2'
		driveName = 'MAKERBOOT'
	} ('RP2040 (Pico or Pico W)' == boardName) {
		vmFileName = 'vm_pico_w.uf2'
		driveName = 'RPI-RP2'
	} else {
		return // unknown board
	}

	prefix = ''
	if (endsWith vmFileName '.uf2') {
		if ('RPI-RP2' == driveName) {
			// Extra instruction for RP2040 Pico
			prefix = (join
				prefix
				(localized 'Connect USB cable while holding down the white BOOTSEL button before proceeding.')
				(newline) (newline))
		} ('MAKERBOOT' == driveName) {
			// Extra instruction for MakerPort
			prefix = (join
				prefix
				(localized 'Press the reset button on the board twice before proceeding.')
				(newline) (newline))
		} else {
			// Extra instruction for Adafruit boards
			prefix = (join
				prefix
				(localized 'Press the reset button on the board twice before proceeding. The NeoPixels should turn green.')
				(newline) (newline))
		}
	}

	if ('Browser' == (platform)) {
		vmData = (readFile (join 'precompiled/' vmFileName) true)
	} else {
		vmData = (readEmbeddedFile (join 'precompiled/' vmFileName) true)
	}
	if (isNil vmData) { return } // could not read file

	// disconnect before updating VM; avoids micro:bit autoconnect issue on Chromebooks
	closePort this
	updateIndicator (findMicroBlocksEditor)

	if (endsWith vmFileName '.hex') {
		// for micro:bit & calliope, filename must be less than 9 letter before the extension
		filePart = (filePart vmFileName)
		vmFileName = (join (substring filePart 1 (min 9 (count filePart))) '.hex')
	}

	if ('Browser' == (platform)) {
		msg = (join prefix (localized 'Save the firmware file when prompted.'))
		response = (inform msg (localized 'Firmware Install'))
		if (isNil response) { return }
		browserWriteFile vmData vmFileName 'vmInstall'
		waitMSecs 5000 // leave time for file to download before showing next prompt
	} else {
// xxx
// print (microBlocksFileToWrite vmFileName (list))
// return
		msg = (join prefix (localized 'Save firmware file to download folder: %1' vmFileName))
		response = (inform msg (localized 'Firmware Install'))
		if (isNil response) { return }
		writeFile (join (userHomePath) '/Downloads/' vmFileName) vmData
	}

	inform (localized 'Drag the firmware file you just saved to the %1 drive.' driveName)
	waitMSecs 1000 // leave time for file dialog box to appear before showing next prompt

	if (endsWith vmFileName '.uf2') {
		if (or ('MAKERBOOT' == driveName) ('RPI-RP2' == driveName)) {
			otherReconnectMessage this
		} else {
			adaFruitReconnectMessage this
		}
	} else {
		otherReconnectMessage this
	}
}

method adaFruitResetMessage MicroBlocksFirmwareInstaller {
	inform (localized 'For Adafruit boards and MakerPort, double-click reset button and try again.')
}

method adaFruitReconnectMessage MicroBlocksFirmwareInstaller {
	msg = (join
		(localized 'When the NeoPixels turn off') ', '
		(localized 'reconnect to the board by clicking the "Connect" button.'))
	inform msg
}

method rp2040ResetMessage MicroBlocksFirmwareInstaller {
	inform (localized 'Connect USB cable while holding down the white BOOTSEL button and try again.')
}

method otherReconnectMessage MicroBlocksFirmwareInstaller {
	title = (localized 'Firmware Installed')
	msg = (localized 'Reconnect to the board by clicking the "Connect" button.')
	inform (global 'page') msg title nil true
}

// Espressif board flashing

method flasher MicroBlocksFirmwareInstaller { return flasher }

method confirmRemoveFlasher MicroBlocksFirmwareInstaller { // xxx needed?
	ok = (confirm
		(global 'page')
		nil
		(localized 'Are you sure you want to cancel the upload process?'))
	if ok { removeFlasher this }
}

method removeFlasher MicroBlocksFirmwareInstaller {
	destroy flasher
	flasher = nil
}

method flashVM MicroBlocksFirmwareInstaller boardName eraseFlashFlag downloadLatestFlag {
	portName = (getField (smallRuntime) 'portName')
	closePort this // close serial port to avoid interaction with install process
print 'flashVM' portName

	flasher = (newFlasher boardName portName eraseFlashFlag downloadLatestFlag)
	addPart (global 'page') (spinner flasher)
	startFlasher flasher nil
}

// Install ESP firmware from file

method installESPFirmwareFromFile MicroBlocksFirmwareInstaller fileName data {
	portName = (getField (smallRuntime) 'portName')
	closePort this // close serial port to avoid interaction with install process
print 'installESPFirmwareFromFile' portName
	flasher = (newFlasher fileName portName false false)
	installFromData flasher nil fileName data
}

// Install ESP firmware from URL

method installESPFirmwareFromURL MicroBlocksFirmwareInstaller {
	defaultURL = ''
	if ('Databot' == boardType) {
		defaultURL = 'http://microblocks.fun/downloads/databot/databot2.0_V2.18.bin'
		if ('Browser' == (platform)) { closeSerialPort 1 }
	}
	url = (trim (freshPrompt (global 'page') 'ESP32 firmware URL?' defaultURL))
	if ('' == url) { return }
	flashESPFirmwareFromURL this boardName url
}

method installESPFirmwareFromRepo MicroBlocksFirmwareInstaller {
	setCursor 'wait'
	if (isPilot (findMicroBlocksEditor)) {
		version = 'pilot'
	} else {
		version = (join 'v' ideVersion)
	}
	if (endsWith version '-pilot') {
		version = (substring version 1 ((count version) - 6))
	}
	menu = (menu 'Select firmware:' this)
	html = (basicHTTPGet 'microblocks.fun' (join '/downloads/' version '/vm/'))
	for line (lines html) {
		if (beginsWith line '<a href="vm_') {
			binIndex = (findSubstring '.bin' line)
			if (binIndex > 0) { // it is an ESP firmware
				boardName = (substring line 13 (binIndex - 1))
				url = (join 'http://microblocks.fun/downloads/' version '/vm/vm_' boardName '.bin')
				addItem menu boardName (action 'flashESPFirmwareFromURL' this boardName url)
			}
		}
	}
	setCursor 'normal'
	popUpAtHand menu (global 'page')
}

method flashESPFirmwareFromURL MicroBlocksFirmwareInstaller boardName url {
	portName = (getField (smallRuntime) 'portName')
	closePort this // close serial port to avoid interaction with install process
	flasher = (newFlasher boardName portName false false)
	installFromURL flasher nil url
}
