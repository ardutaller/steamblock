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
	// TODO Rename vars to match CSS classes (new naming)
	let winHeight = window.innerHeight,
		topBarHeight = document.querySelector('.top-bar').clientHeight,
		tipBarHeight = document.querySelector('.bottom-bar').clientHeight,
		winWidth = window.innerWidth,
		leftBarWidth = document.querySelector('.workspace__left').clientWidth,
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

	// Add main menu buttons
	const mainMenuButtons = container.querySelector('[data-ide="main-menu"]');
	['language', 'settings', 'project'].forEach(selector => {
		mainMenuButtons.appendChild(Buttons.elementFor(selector));
	});

	// Add listener to title
	let title = container.querySelector('[data-ide="title"]');
	document.addEventListener(
		'project.title',
		(e) => {
			title.innerText = e.detail.value;
			title.classList.add('--has-title');
		}
	);

	// Progress indicator
	// To test, execute in console: IDE.fireEvent('ide.downloadProgress',[1, 0.33])
	// - First number is the phase number out of three (compile, send, sync)
	// - Second number is the percentage of the phase
	let progress =  container.querySelector('[data-ide="progress"]');
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

	// Add controls buttons
	let controlsButtons = container.querySelector('[data-ide="controls"]');
	['graph', '|', 'connect', '|', 'run', 'stop' ].forEach(selector => {
		controlsButtons.appendChild(Buttons.elementFor(selector));
	});

	// Add listener to graph button
	document.addEventListener(
		'windows.DataGraph.active',
		(e) => {
			let element = controlsButtons.querySelector('.--graph');
			if (e.detail.value) {
				element.classList.add('--active');
			} else {
				element.classList.remove('--active');
			}
		}
	)
};


// Tip Bar
IDE.tipBar = { icons: {} };
IDE.tipBar.init = function () {
	this.icons['[l]'] = 'mouse-left-button';
	this.icons['[r]'] = 'mouse-right-button';
	this.icons['(-o)'] = 'bool_true';
	this.icons['(o-)'] = 'bool_false';

	this.titleElement = document.querySelector('.tips__title');
	this.contentElement = document.querySelector('.tips__content');

	document.addEventListener(
		'ide.tip',
		e => {
			if (typeof e.detail.value != 'object') { return; }
			IDE.tipBar.setTip(e.detail.value[0], e.detail.value[1]);
		}
	);

	document.querySelectorAll('*').forEach(element => {
		// preserve previous onmouseenter behavior
		let onmouseenter = element.onmouseenter;
		element.onmouseenter = () => {
			if (onmouseenter) { onmouseenter.call(element); }
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
					'<img src="img/' + this.icons[key] + '.svg" class="tips__icon"></img>'
				);
		});
	}
	this.contentElement.innerHTML = tipHTML;
};


// Zoom Buttons. Eventually also undo/redo
IDE.populateScriptControls = function (element) {
	['undo', 'redo', '|', 'zoomOut', 'restoreZoom', 'zoomIn'].forEach(selector => {
		element.appendChild(Buttons.elementFor(selector));
	});
};


// Dark Mode
document.addEventListener('preference.darkMode', e =>
	{
		if (e.detail.value) {
			document.querySelector('[data-ide="ide"]').classList.add('--dark-mode');
		} else {
			document.querySelector('[data-ide="ide"]').classList.remove('--dark-mode');
		}
	}
);


// Dragging
document.addEventListener('dragstart', () => {
	document.querySelector('body').classList.add('--is-dragging');
});

document.addEventListener('dragend', () => {
	document.querySelector('body').classList.remove('--is-dragging');
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
	this.populateScriptControls(document.querySelector('.scripts-pane-controls'));
	this.tipBar.init();
	// check connection every 500ms
	setInterval(() => { GP.apiCall('ide.updateConnection'); }, 500);
	this.resize();
	setTimeout(() =>
		{ document.querySelector('.app-preloader').classList.add('--is-loaded'); },
		500 // it takes a bit for all elements to position and show themselves
	);
};
