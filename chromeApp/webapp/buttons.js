// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// buttons.js - Create all sorts of buttons and icons.

// Bernat Romagosa, 2025

const Buttons = {
	language: {
		icon: 'globe',
		label: 'Language',
		description: 'Set the language of the IDE, including all the blocks.',
		menu: 'language'
	},
	settings: {
		icon: 'gear',
		label: 'Settings',
		description: 'User preferences and different IDE settings and tweaks.',
		menu: 'settings'
	},
	project: {
		icon: 'file',
		label: 'Project',
		description: 'Actions relating to MicroBlocks projects.',
		menu: 'project'
	},
	graph: {
		icon: 'graph',
		label: 'Graph',
		description: 'Open a graph window. Use the graph block in the Output category to add data points to it.',
		action: () => { GP.apiCall('ide.showGraph'); }
	},
	connect: {
		icon : 'usb',
		label: 'Connection',
		description: 'Connect to a microcontroller via USB or BLE, or open Boardie.',
		action: () => { Menus.popUp('connect'); }
	},
	run: {
		icon: 'start',
		label: 'Start',
		description: 'Trigger all scripts under a "when started" hat block or a generic "when" block.',
		action: () => { GP.apiCall('ide.startAll'); }
	},
	stop: {
		icon: 'stop',
		label: 'Stop',
		description: 'Stop all running scripts and make sure all scripts have been compiled and uploaded to the microcontroller.',
		action: () => { GP.apiCall('ide.stopAll'); }
	},
	undo: {
		icon: 'img/undo.svg',
		label: 'Undo',
		description: 'Undo the last action',
		action: () => { GP.apiCall('edit.undo'); }
	},
	redo: {
		icon: 'img/redo.svg',
		label: 'Redo',
		description: 'Redo the last undone action',
		action: () => { GP.apiCall('edit.redo'); }
	},
	zoomOut: {
		icon: 'img/zoomOut.svg',
		label: 'Zoom out',
		description: 'Decrease block size',
		action: () => { GP.apiCall('scripts.zoomOut'); }
	},
	restoreZoom: {
		icon: 'img/restoreZoom.svg',
		label: 'Restore zoom',
		description: 'Restore block size to 100%',
		action: () => { GP.apiCall('scripts.restoreZoom'); }
	},
	zoomIn: {
		icon: 'img/zoomIn.svg',
		label: 'Zoom in',
		description: 'Increase block size',
		action: () => { GP.apiCall('scripts.zoomIn'); }
	}
};

Buttons.elementFor = function (selector) {
	if (selector == '|') {
		// vertical separator
		let separator = document.createElement('div');
		separator.classList.add('vl');
		return separator;
	} else if (selector == 'connect') {
		return this.connectWidget();
	}
	let descriptor = this[selector];
	let icon =
		descriptor.icon.startsWith('img') ?
			Icon.forUrl(descriptor.icon) :
			Icon.forSelector(descriptor.icon);
	icon.classList.add(selector);
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
	icon.ariaLabel = descriptor.label;
	icon.ariaDescription = descriptor.description; // excuse the alliteration :)
	return icon;
};

Buttons.connectWidget = function () {
	// special case, as this is a slightly more complex element
	let container = document.createElement('div'),
		descriptor = this['connect'],
		icon = Icon.forSelector(descriptor.icon);
	container.classList.add('connect');

	container.ariaLabel = descriptor.ariaLabel;
	container.ariaDescription = descriptor.ariaDescription;

	document.addEventListener(
		'board.connected',
		(e) => {
			if (e.detail.value) {
				container.classList.add('connected');
			} else {
				container.classList.remove('connected');
			}
		}
	);

	let label = document.createElement('span');
	label.classList.add('label');
	label.innerText = GetText.localize('Connect');
	document.addEventListener(
		'board.type',
		(e) => { label.innerText = GetText.localize(e.detail.value); }
	);

	let arrow = Icon.forUrl('img/dropdown-arrow.svg');
	arrow.classList.add('dropdown');

	container.appendChild(icon);
	container.appendChild(label);
	container.appendChild(arrow);

	// clicking anywhere in the widget triggers the menu
	container.onclick = () => { Menus.popUp('connection', container); };

	return container;
};


// Icons
const Icon = {};

Icon.forSelector = function (selector) {
	return this.forUrl('img/icon-' + selector + '.svg');
};

Icon.forUrl = function (url) {
	let icon = document.createElement('div');
	icon.setAttribute('role', 'button');
	icon.classList.add('icon');
	fetch(url).then(res => res.text()).then(text => icon.innerHTML = text);
	return icon;
};
