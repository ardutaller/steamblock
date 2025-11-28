// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// MicroBlocksAPI.gp - API for the JS/HTML world to interact with MicroBlocks
// Bernat Romagosa, 2025


defineClass MicroBlocksAPI

method processLastCall MicroBlocksAPI {
	request = (browserLastAPIRequest)
	if (notNil request) { dispatchCall this request }
}

method dispatchCall MicroBlocksAPI callObject {
	editor = (findMicroBlocksEditor)
	if (isNil editor) { return }
	scripter = (scripter editor)
	runtime = (smallRuntime)

	// retrieve call properties
	id = (at callObject 1)
	endPoint = (at callObject 2)
	params = (jsonParse (at callObject 3))

	// dispatch API call
	// IDE
	if (endPoint == 'ide.showAboutBox') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		showAboutBox runtime
	} (endPoint == 'ide.showGraph') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		showGraph editor
	} (endPoint == 'ide.applyUserPreferences') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		applyUserPreferences editor
	} (endPoint == 'ide.startAll') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		startAll runtime
	} (endPoint == 'ide.stopAll') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		stopAndSyncScripts runtime
	} (endPoint == 'ide.showConnectMenu') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		selectPort runtime
	} (endPoint == 'ide.updateConnection') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		updateConnection runtime
	} (endPoint == 'ide.zoomIn') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		zoomIn editor
	} (endPoint == 'ide.zoomOut') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		zoomOut editor
	} (endPoint == 'ide.restoreZoom') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		restoreZoom editor
	} (endPoint == 'ide.selectCategory') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		selectCategory scripter (at params 1)
	} (endPoint == 'ide.selectLibrary') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		selectLibrary scripter (at params 1)
	} (endPoint == 'ide.showLibraryDialog') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		importLibrary scripter
	} (endPoint == 'ide.resize') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		browserResize editor (at params 1) (at params 2)

	// Project
	} (endPoint == 'project.save') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		saveProjectToFile editor
	} (endPoint == 'project.new') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		newProject editor
	} (endPoint == 'project.open') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		openProjectMenu editor
	} (endPoint == 'project.copyURL') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		copyProjectURLToClipboard editor
	} (endPoint == 'project.exportBlocksLibrary') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		exportAsLibrary scripter

	// Board
	} (endPoint == 'board.installVM') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		// params: wipeFlash (bool), downloadFromServer (bool)
		installVM runtime (at params 1) (at params 2)
	} (endPoint == 'board.installVMfromURL') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		installESPFirmwareFromURL runtime
	} (endPoint == 'board.installVMfromRepo') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		installESPFirmwareFromRepo runtime
	} (endPoint == 'board.compactStorage') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		sendMsg runtime 'systemResetMsg' 2 nil
	} (endPoint == 'board.toggleBLE') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		sendMsg runtime 'setBLEFlag'
	} (endPoint == 'board.uploadFile') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		putFileOnBoard runtime
	} (endPoint == 'board.downloadFile') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		getFileFromBoard runtime
	} (endPoint == 'board.retrieveProject') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		openFromBoard editor
	} (endPoint == 'board.canDoBLE') {
		respondAPIRequest this id (boardIsBLECapable runtime)
	} (endPoint == 'board.hasFS') {
		respondAPIRequest this id (boardHasFileSystem runtime)
	} (endPoint == 'board.connect') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		webSerialConnect runtime (at params 1)
	} (endPoint == 'board.disconnect') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		closePort runtime

	// Localization
	} (endPoint == 'locale.setLanguage') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		setLanguage editor (at params 1)
	} (endPoint == 'locale.loadCustomFile') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		readCustomTranslationFile editor

	} (endPoint == 'edit.undo') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		undo scripter
	} (endPoint == 'edit.redo') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		redo scripter

	// API endpoint not found
	} else {
		respondAPIRequest this id 'Unknown API endpoint'
		print 'unknown API endpoint' endPoint
	}
}

method respondAPIRequest MicroBlocksAPI id params {
	// just stringify params before responding to the request
	browserRespondAPIRequest id (jsonStringify params)
}

method setProperty MicroBlocksAPI path value {
	// just cast value into a string before storing it in the browser IDE object
	if (isClass value 'String') {
		value = (join '"' value '"')
	} else {
		value = (jsonStringify value)
	}
	browserStoreIDEProperty path (toString value)
}

method electronOS MicroBlocksAPI {
	return (at (array 'windows' 'mac' 'linux' 'web') (browserElectronOS))
}
