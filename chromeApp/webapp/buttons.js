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
	// TODO placeholder right now
	let icon = Icon.forSelector('usb');
	icon.onclick = () => { GP.apiCall('ide.showConnectMenu'); }
	return icon;
}
