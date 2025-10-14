// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// ide.js - A bunch of IDE utilities. Eventually, probably the whole IDE?

// Bernat Romagosa, 2025

IDE = {};

// TODO placeholders. GP needs to set these when appropriate.
IDE.hasCustomBlocks = false;

IDE.userPreference = function (pref) {
	let value = JSON.parse(localStorage['user-prefs'])[pref];
	if (value == undefined) { value = false; }
	return value;
};

IDE.setUserPreference = function (pref, value) {
	let prefs = JSON.parse(localStorage['user-prefs']);
	prefs[pref] = value;
	localStorage['user-prefs'] = JSON.stringify(prefs);
	GP.apiCall('ide.applyUserPreferences');
};

IDE.toggleUserPreference = function (pref) {
	this.setUserPreference(pref, !this.userPreference(pref));
	GP.apiCall('ide.applyUserPreferences');
};

IDE.populateTopBar = function (container) {
	// add logo
	let logo = document.createElement('img');
	logo.setAttribute('src', 'img/logo.svg');
	logo.classList.add('logo');
	container.appendChild(logo);

	// add top menus
	['language', 'settings', 'project'].forEach(selector => {
		container.appendChild(Menus.elementFor(selector));
	});

	// add right buttons
	let buttons = document.createElement('div');
	buttons.classList.add('buttons');
	container.appendChild(buttons);
	['graph', '|', 'connect', '|', 'run', 'stop' ].forEach(selector => {
		buttons.appendChild(Buttons.elementFor(selector));
	});
};

// TODO placeholders. GP needs to set these on connection.
IDE.board = { hasFS: false, canDoBLE: false, connected: false };

// Build the IDE
IDE.build = function () {
	IDE.populateTopBar(document.querySelector('.top-bar'));
};
