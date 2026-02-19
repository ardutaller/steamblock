// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// buttons.js - Create all sorts of buttons and icons.

// Bernat Romagosa, 2025

const Buttons = {

	// Main Menu
	language: {
		icon: 'globe--24x24',
		label: 'Language',
		description: 'Set the language of the IDE, including all the blocks.',
		menu: 'language',
		class: 'top-bar__main-menu-button'
	},
	settings: {
		icon: 'gear--24x24',
		label: 'Settings',
		description: 'User preferences and different IDE settings and tweaks.',
		menu: 'settings',
		class: 'top-bar__main-menu-button'
	},
	project: {
		icon: 'file--24x24',
		label: 'Project',
		description: 'Actions relating to MicroBlocks projects.',
		menu: 'project',
		class: 'top-bar__main-menu-button'
	},

	// Controls
	graph: {
		icon: 'graph--16x16',
		label: 'Graph',
		description: 'Open a graph window. Use the graph block in the Output category to add data points to it.',
		class: 'top-bar__rounded-button',
		action: () => { GP.apiCall('ide.showGraph'); }
	},
	connect: {
		icon : 'plug--16x16',
		label: 'Connection',
		description: 'Connect to a microcontroller via USB or BLE, or open Boardie.',
		class: 'top-bar__controls-connect',
		action: () => { Menus.popUp('connect'); }
	},
	run: {
		icon: 'start--24x24',
		label: 'Start',
		description: 'Trigger all scripts under a "when started" hat block or a generic "when" block.',
		class: 'top-bar__controls-run',
		action: () => { GP.apiCall('ide.startAll'); }
	},
	stop: {
		icon: 'stop--24x24',
		label: 'Stop',
		description: 'Stop all running scripts and make sure all scripts have been compiled and uploaded to the microcontroller.',
		class: 'top-bar__controls-stop',
		action: () => { GP.apiCall('ide.stopAll'); }
	},

	// Workspace tools
	undo: {
		icon: 'img/undo.svg',
		label: 'Undo',
		description: 'Undo the last action',
		class: 'workspace__tool',
		action: () => { GP.apiCall('edit.undo'); },
	},
	redo: {
		icon: 'img/redo.svg',
		label: 'Redo',
		description: 'Redo the last undone action',
		class: 'workspace__tool',
		action: () => { GP.apiCall('edit.redo'); },
	},
	zoomOut: {
		icon: 'img/zoomOut.svg',
		label: 'Zoom out',
		description: 'Decrease block size',
		class: 'workspace__tool',
		action: () => { GP.apiCall('scripts.zoomOut'); },
	},
	restoreZoom: {
		icon: 'img/restoreZoom.svg',
		label: 'Restore zoom',
		description: 'Restore block size to 100%',
		class: 'workspace__tool',
		action: () => { GP.apiCall('scripts.restoreZoom'); },
	},
	zoomIn: {
		icon: 'img/zoomIn.svg',
		label: 'Zoom in',
		description: 'Increase block size',
		class: 'workspace__tool',
		action: () => { GP.apiCall('scripts.zoomIn'); },
	}
};


Buttons.elementFor = function (selector) {

	// Separators and Connect
	if (selector == '|') {
		let separator = document.createElement('div');
		separator.classList.add('top-bar__separator');
		return separator;
	} else if (selector == 'connect') {
		return this.connectWidget();
	}

	// Other buttons
	let descriptor = this[selector];
	let icon = descriptor.icon.startsWith('img') ?
		Icon.forUrl(descriptor.icon) :
		Icon.forSelector(descriptor.icon);
	icon.classList.add(descriptor.class);
	icon.classList.add(`--${selector}`);
	icon.ariaLabel = descriptor.label;
	icon.ariaDescription = descriptor.description; // excuse the alliteration :)

	// Button action
	if (descriptor.menu) {
		icon.onclick = () => { Menus.popUp(selector, icon); };
		icon.setAttribute('aria-controls', `menu-${selector}`);
		icon.onmouseenter = () => {
			if (Menus.current()) {
				Menus.close();
				Menus.popUp(selector, icon);
			}
		}
	} else {
		icon.onclick = descriptor.action;
	}

	return icon;
};


// Connect
// Special case, as this is a slightly more complex element
Buttons.connectWidget = function () {

	let container = document.createElement('button'),
		descriptor = this['connect'],
		icon = Icon.forSelector(descriptor.icon, 'div'),
		label = document.createElement('span'),
		arrow = Icon.forUrl('img/icon-dropdown--12x6.svg', 'div');

	container.classList.add(descriptor.class);
	container.ariaLabel = descriptor.ariaLabel;
	container.ariaDescription = descriptor.ariaDescription;
	icon.classList.add('top-bar__rounded-button');
	label.innerText = GetText.localize('Connect');
	label.classList.add('top-bar__controls-connect-label');
	arrow.classList.add('top-bar__controls-connect-dropdown');

	container.appendChild(icon);
	container.appendChild(label);
	container.appendChild(arrow);

	// Localization
	document.addEventListener(
		'board.type',
		(e) => { label.innerText = GetText.localize(e.detail.value); }
	);

	// Clicking anywhere in the widget triggers the menu
	container.onclick = () => { Menus.popUp('connection', container); };

	document.addEventListener(
		'board.connected',
		(e) => {
			if (e.detail.value) {
				container.classList.add('--is-connected');
			} else {
				container.classList.remove('--is-connected');
			}
		}
	);

	return container;
};


// Icons
const Icon = {};

Icon.forSelector = function (selector, html = 'button') {
	// TODO: Rename files to avoid 'icon-'?
	return this.forUrl('img/icon-' + selector + '.svg', html);
};

Icon.forUrl = function (url, html = 'button') {
	let icon = document.createElement(html);
	fetch(url).then(res => res.text()).then(text => icon.innerHTML = text);

	return icon;
};
