// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// icons.js - Create all sorts of icons.

// Bernat Romagosa, 2025

const Icon = {};

Icon.forSelector = function (selector) {
	return this.forUrl('img/icon-' + selector + '.svg');
};

Icon.forUrl = function (url) {
	let icon = document.createElement('div');
	let img = document.createElement('img');
	icon.classList.add('icon');
	img.setAttribute('src', url);
	icon.appendChild(img);
	return icon;
};
