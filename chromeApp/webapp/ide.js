// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// ide.js - A bunch of IDE utilities. Eventually, probably the whole IDE?

// Bernat Romagosa, 2025

IDE = {};

// TODO placeholders. GP needs to set these when appropriate.
IDE.hasCustomBlocks = false;

IDE.userPreference = function (pref) {
	let value = JSON.parse(localStorage['user-prefs'])[pref];
	if (value == undefined) { value = false; }
	return value;
};

IDE.setUserPreference = function (pref, value) {
	let prefs = JSON.parse(localStorage['user-prefs']);
	prefs[pref] = value;
	localStorage['user-prefs'] = JSON.stringify(prefs);
	GP.apiCall('ide.applyUserPreferences');
};

IDE.toggleUserPreference = function (pref) {
	this.setUserPreference(pref, !this.userPreference(pref));
	GP.apiCall('ide.applyUserPreferences');
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
IDE.setTip = function(title, content) {
	document.querySelector('.tip-title').textContent = title;
	let icons = {};
	icons['[l]'] = 'mouse-left-button';
	icons['[r]'] = 'mouse-right-button';
	icons['(-o)'] = 'bool_true';
	icons['(o-)'] = 'bool_false';
	let tipHTML = content;
	Object.keys(icons).forEach(key => {
		tipHTML =
			tipHTML.replace(
				key,
				'<img src="img/' + icons[key] + '.svg" class="tip-icon"></img>'
			);
	});
	document.querySelector('.tip-content').innerHTML = tipHTML;
};

document.addEventListener(
	'ide.tip', (e) => { IDE.setTip(e.detail.value[0], e.detail.value[1]); }
);

// GP sets these via `setProperty MicroBlocksAPI path value`
// When a property is set, an event with that path is fired in the document.
// The document can listen for that event and act accordingly. The `details`
// object in the event contains the value of the property.
IDE.board = { hasFS: false, canDoBLE: false, connected: false, type: null };
IDE.project = { title: null };

// Build the IDE
IDE.build = function () {
	IDE.populateTopBar(document.querySelector('.top-bar'));
	// check connection every 500ms
	setInterval(()=>{ GP.apiCall('ide.updateConnection'); },500);
};
