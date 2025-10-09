// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// ide.js - A bunch of IDE utilities. Eventually, probably the whole IDE?

// Bernat Romagosa, 2025

IDE = {};

IDE.userPreference = function (pref) {
	let value = localStorage['user-prefs'][pref];
	if (value == undefined) { value = false; }
	return value;
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
};

// TODO placeholder. GP needs to set this on connection
IDE.board = { canDoBLE: false };

// Build the IDE
IDE.build = function () {
	IDE.populateTopBar(document.querySelector('.top-bar'));
};
