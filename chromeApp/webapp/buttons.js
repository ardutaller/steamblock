// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// buttons.js - Create all sorts of buttons and icons.

// Bernat Romagosa, 2025

const Buttons = {
	graph: {
		icon: 'graph',
		label: 'Graph',
		description: 'Open a graph window. Use the graph block in the Output category to add data points to it.',
		action: () => { GP.apiCall('ide.showGraph'); }
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
	zoomOut: {
		icon: 'img/zoomOut.svg',
		label: 'Zoom out',
		description: 'Decrease block size',
		action: () => { GP.apiCall('ide.zoomOut'); }
	},
	restoreZoom: {
		icon: 'img/restoreZoom.svg',
		label: 'Restore zoom',
		description: 'Restore block size to 100%',
		action: () => { GP.apiCall('ide.restoreZoom'); }
	},
	zoomIn: {
		icon: 'img/zoomIn.svg',
		label: 'Zoom in',
		description: 'Increase block size',
		action: () => { GP.apiCall('ide.zoomIn'); }
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
	icon.onclick = descriptor.action;
	icon.ariaLabel = descriptor.label;
	icon.ariaDescription = descriptor.description; // excuse the alliteration :)
	return icon;
};

Buttons.connectWidget = function () {
	// special case, as this is a slightly more complex element
	let container = document.createElement('div');
	container.classList.add('connect');

	let menu = Menus.elementFor('connection');

	container.ariaLabel = menu.ariaLabel;
	container.ariaDescription = menu.ariaDescription;

	document.addEventListener(
		'board.connected',
		(e) => {
			if (e.detail.value) {
				menu.classList.add('connected');
			} else {
				menu.classList.remove('connected');
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

	container.appendChild(menu);
	container.appendChild(label);
	container.appendChild(arrow);

	// clicking anywhere in the widget triggers the menu
	menu.onclick = null;
	menu.clickable = container;
	container.onclick = menu.openMenu;

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
