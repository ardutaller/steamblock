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
	scripter = (scripter editor)
	runtime = (smallRuntime)

	// retrieve call properties
	id = (at callObject 1)
	endPoint = (at callObject 2)
	params = (jsonParse (at callObject 3))

	// dispatch API call
	// TESTS
	if (endPoint == 'random') {
		respondAPIRequest this id (rand (at params 1) (at params 2))
	} (endPoint == 'echo') {
		// for testing purposes, just respond with the exact same params I received
		respondAPIRequest this id params

	// IDE
	} (endPoint == 'ide.showAboutBox') {
		respondAPIRequest this id 0 // respond first so the request is deleted
		showAboutBox runtime
	} (endPoint == 'ide.isAdvancedMode') {
		respondAPIRequest this id (devMode)
	} (endPoint == 'ide.isDarkMode') {
		respondAPIRequest this id (darkModeEnabled editor)

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

	// Localization
	} (endPoint == 'locale.getLanguageList') {
		respondAPIRequest this id (languageCodeList (authoringSpecs))
	}
}

method respondAPIRequest MicroBlocksAPI id params {
	// just stringify params before responding to the request
	browserRespondAPIRequest id (jsonStringify params)
}
