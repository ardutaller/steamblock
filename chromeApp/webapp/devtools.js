// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// devtools.js - Developer tools for building and debugging the MicroBlocks IDE

// Bernat Romagosa, 2025

const LiveReload = {
	watchedFiles: [ 'style.css', 'microblocks.html', 'img/logo.svg' ],
	lastVersions: {},
	interval: null,
	watchInterval: 1000,
	reloadGP: false // try to reload the whole page except for the GP canvas
};

LiveReload.enable = function() {
	this.disable();
	console.log('LiveReload enabled');
	console.log('Currently watching', this.watchedFiles.join(', '));
	this.interval = setInterval(() => {
		this.watchedFiles.forEach(file => {
			fetch(file)
				.then(res => res.text())
				.then(text => {
					if (this.lastVersions[file] == text) { return; }
					if (this.lastVersions[file] == undefined) {
						this.lastVersions[file] = text;
						return;
					}
					console.log('live-reloading', file);
					this.lastVersions[file] = text;
					// apply cache buster to URLs so they get reloaded
					let newUrl = file + '?' + Math.floor(Math.random() * 100000);
					if (file.endsWith('.css')) {
						document.querySelector('link[href^="' + file + '"]').href = newUrl;
					} else if (['.svg', '.png', '.jpg'].some(ext=>file.endsWith(ext))) {
						document.querySelector('*[src^="' + file + '"]').src = newUrl;
					} else if (file.endsWith('.html')) {
						// redo the whole page
						this.reloadPage(text);
						return;
					} else {
						console.log('file extension not recognized:', file);
					}
				});
		});
	}, this.watchInterval);
};

LiveReload.disable = function() {
	if (this.interval) { clearInterval(this.interval); }
};

LiveReload.reloadPage = function (contents) {
	if (this.reloadGP) {
		location.replace(location.pathname + '?refresh=' + new Date().getTime());
	} else {
		// Load the whole HTML, but take care of not reloading the GP div.
		// This can have some issues but it seems to work right now :)
		let newPage = document.createElement('html');
		newPage.innerHTML = contents;
		let canvas = document.querySelector('#canvas');
		newPage.querySelector('#canvas').remove();
		newPage.querySelector('.workspace .emscripten').appendChild(canvas);
		document.documentElement.innerHTML = newPage.innerHTML;
		document.dispatchEvent(new CustomEvent('ready'));
		initGPEventHandlers();
	}
};

LiveReload.enable();
