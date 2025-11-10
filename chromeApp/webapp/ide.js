// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// ide.js - A bunch of IDE utilities. Eventually, the whole IDE.

// Bernat Romagosa, 2025

// GP sets the IDE object properties via `setProperty MicroBlocksAPI path value`
// When a property is set, an event with that path is fired in the document.
// The document can listen for that event and act accordingly. The `details`
// object in the event contains the value of the property.

// There is a reason for IDE not to be a const. Try it and see the console
// WASM error to know why.
IDE = {
	currentMenu: null, // remember open menu so it can be closed on outside click
	currentCategory: 'cat;Control',
	libraryList: []
};

// Initialization
IDE.init = function () {
	this.project = this.emptyProject();
	this.board = this.emptyBoard();
	this.applyUserPreferences();
	this.build();
	GetText.setLocale(this.userPreference('locale'));
};

IDE.resize = function () {
		let winHeight = window.innerHeight,
			topBarHeight = document.querySelector('.top-bar').clientHeight,
			tipBarHeight = document.querySelector('.tip-bar').clientHeight,
			winWidth = window.innerWidth,
			leftBarWidth = document.querySelector('.left-bar').clientWidth,
			newHeight = winHeight - (topBarHeight + tipBarHeight);

		document.querySelector('.workspace').style.height = newHeight + 'px';

		GP.apiCall('ide.resize', [ winWidth - leftBarWidth, newHeight ]);

};

window.addEventListener('resize', () => { IDE.resize(); });

IDE.emptyProject = function () {
	return { title: null, hasCustomBlocks: false };
};

IDE.emptyBoard = function () {
	return { hasFS: false, canDoBLE: false, connected: false, type: null };
};


// Event firing, for easy communication between modules
IDE.fireEvent = function (name, value) {
	document.dispatchEvent(new CustomEvent(name, { detail: { value: value } }));
};


// User preferences, settable via the gear menu
IDE.userPreference = function (pref) {
	let value = JSON.parse(localStorage['user-prefs'])[pref];
	if (value == undefined) { value = false; }
	return value;
};

IDE.setUserPreference = function (pref, value) {
	let prefs = JSON.parse(localStorage['user-prefs']);
	prefs[pref] = value;
	localStorage['user-prefs'] = JSON.stringify(prefs);
	this.applyUserPreferences();
};

IDE.toggleUserPreference = function (pref) {
	this.setUserPreference(pref, !this.userPreference(pref));
	this.applyUserPreferences();
};

IDE.applyUserPreferences = function () {
	GP.apiCall('ide.applyUserPreferences');
	let prefs = JSON.parse(localStorage['user-prefs']);
	Object.keys(prefs).forEach(
		pref => this.fireEvent('preference.' + pref, prefs[pref])
	);
};

IDE.toggleAdvancedMode = function () {
	this.toggleUserPreference('devMode')
	// rebuild categories
	this.populateCategories(document.querySelector('.categories'));
};


// Top Bar
IDE.populateTopBar = function (container) {
	// add logo
	let logo = document.createElement('img');
	logo.setAttribute('src', 'img/logo.svg');
	logo.classList.add('logo');
	logo.ariaLabel = 'MicroBlocks';
	logo.ariaDescription = 'Rosa, the MicroBlocks bunny, is named after Rózsa Péter, a great mathematician.';
	container.appendChild(logo);

	// add top menus
	['language', 'settings', 'project'].forEach(selector => {
		container.appendChild(Menus.elementFor(selector));
	});

	// add project title
	let title = document.createElement('span');
	title.classList.add('title');
	container.appendChild(title);
	document.addEventListener(
		'project.title',
		(e) => { title.innerText = e.detail.value; }
	);

	// add right buttons
	let buttons = document.createElement('div');
	buttons.classList.add('buttons');

	// progress indicator
	let progress = document.createElement('div');
	progress.classList.add('progress');
	buttons.appendChild(progress);
	document.addEventListener(
		'ide.downloadProgress',
		(e) => {
			let colors = [
				['lightgreen', 'lightgray'],
				['green', 'gray'],
				['darkgreen', 'darkgray']
			];
			if (typeof e.detail.value != 'object') { return; }
			let phase = e.detail.value[0];
			let percentage = e.detail.value[1] * 100;
			if (percentage < 100) {
				progress.style.background =
					'conic-gradient(' +
						colors[phase - 1][0] + ' ' + percentage + '%, ' +
						colors[phase - 1][1] + ' 0)';
			} else {
				progress.style.background = null;
			}
		}
	);

	container.appendChild(buttons);
	['graph', '|', 'connect', '|', 'run', 'stop' ].forEach(selector => {
		buttons.appendChild(Buttons.elementFor(selector));
	});
};


// Tip Bar
IDE.tipBar = { icons: {} };
IDE.tipBar.init = function () {
	this.icons['[l]'] = 'mouse-left-button';
	this.icons['[r]'] = 'mouse-right-button';
	this.icons['(-o)'] = 'bool_true';
	this.icons['(o-)'] = 'bool_false';

	this.titleElement = document.querySelector('.tip-title');
	this.contentElement = document.querySelector('.tip-content');

	document.addEventListener(
		'ide.tip',
		e => {
			if (typeof e.detail.value != 'object') { return; }
			IDE.tipBar.setTip(e.detail.value[0], e.detail.value[1]);
		}
	);

	document.querySelectorAll('*').forEach(element => {
		element.onmouseenter = () => {
			if (element.ariaLabel && element.ariaDescription) {
				this.setTip(element.ariaLabel, element.ariaDescription);
			}
		}
	});
};

IDE.tipBar.setTip = function (title, content) {
	this.titleElement.textContent = GetText.localize(title);
	let tipHTML = GetText.localize(content);
	if (content !== null) {
		Object.keys(this.icons).forEach(key => {
			tipHTML =
				tipHTML.replaceAll(
					key,
					'<img src="img/' + this.icons[key] + '.svg" class="tip-icon"></img>'
				);
		});
	}
	this.contentElement.innerHTML = tipHTML;
};


// Zoom Buttons. Eventually also undo/redo
IDE.populateScriptControls = function (element) {
	['zoomOut', 'restoreZoom', 'zoomIn'].forEach(selector => {
		element.appendChild(Buttons.elementFor(selector));
	});
};

document.addEventListener('preference.darkMode', (e) =>
	{
		if (e.detail.value) {
			document.querySelector('.script-controls').classList.add('dark-mode');
		} else {
			document.querySelector('.script-controls').classList.remove('dark-mode');
		}
	}
);

document.addEventListener('dragstart', () => {
	document.querySelectorAll('.can-drag-through').forEach(
		e => e.classList.add('dragging')
	);
});

document.addEventListener('dragend', () => {
	document.querySelectorAll('.can-drag-through').forEach(
		e => e.classList.remove('dragging')
	);
});

// Category and library lists
IDE.populateCategories = function (element) {
	element.replaceWith(Categories.buildStandard());
};

IDE.populateLibraries = function (element) {
	element.replaceWith(Categories.buildLibraries(this.libraryList));
};

// Build the IDE
IDE.build = function () {
	this.populateTopBar(document.querySelector('.top-bar'));
	this.populateCategories(document.querySelector('.categories'));
	this.populateScriptControls(document.querySelector('.script-controls'));
	this.tipBar.init();
	// FIXME first resize is not setting the right dimensions! Check the rounded
	// corner to see what we mean.
	this.resize();
	// check connection every 500ms
	setInterval(()=>{ GP.apiCall('ide.updateConnection'); },500);
};
