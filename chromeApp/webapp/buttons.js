// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// buttons.js - Create all sorts of buttons.

// Bernat Romagosa, 2025

const Buttons = {};
Buttons.graph = { icon: 'graph', action: () => { GP.apiCall('ide.showGraph'); } }
Buttons.run = { icon: 'start', action: () => { GP.apiCall('ide.startAll'); } }
Buttons.stop = { icon: 'stop', action: () => { GP.apiCall('ide.stopAll'); } }

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
	let icon = Icon.forSelector(descriptor.icon);
	icon.onclick = descriptor.action;
	return icon;
};

Buttons.connectWidget = function () {
	// special case, as this is a slightly more complex element
	let container = document.createElement('div');
	container.classList.add('connect');

	let icon = Icon.forSelector('usb');
	document.addEventListener(
		'board.connected',
		(e) => {
			if (e.detail.value) {
				icon.classList.add('connected');
			} else {
				icon.classList.remove('connected');
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
	container.onclick = () => { GP.apiCall('ide.showConnectMenu'); }
	return container;
};
