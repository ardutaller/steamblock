// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// menus.js - Create all sorts of menus.

// Bernat Romagosa, 2025

var Menus = {};
Menus.language = { icon: 'globe', items: [] };

// fill language menu out of available locales
fetch('translations/locales.json')
	.then(response => response.json())
	.then(descriptors => {
		descriptors.forEach(descriptor => {
			Menus.language.items.push({
				label: descriptor[0],
				action: () => { GetText.setLocale(descriptor[1]); },
				checked: () => { return GetText.currentLocale == descriptor[1] }
			});
		})
	})
	.then(() => {
		Menus.language.items.push('-');
		Menus.language.items.push({
			label: 'Missing language?',
			action: () => {
				window.open('https://wiki.microblocks.fun/en/translating', '_blank');
			}
		});
		Menus.language.items.push('-');
		Menus.language.items.push({
			label: 'Custom...',
			action: () => { window.alert('TODO'); }
		});
	});

Menus.settings = {
	icon: 'gear',
	items: [
		{
			label: 'about...',
			action: () => { GP.apiCall('ide.showAboutBox'); }
		},
		'-'
		,
		{
			label: 'update firmware on board',
			action: () => { GP.apiCall('board.installVM', [false, false]); }
		},
		'-',
		{
			label: 'inform of new versions',
			checked: () => { IDE.userPreference('versionCheckOnStartup'); }
		},
		{
			label: 'dark mode',
			checked: () => { return IDE.userPreference('darkMode'); }
		},
		{
			label: 'advanced mode',
			checked: () => { return IDE.userPreference('devMove'); }
		}
	]
};

Menus.project = {
	icon: 'file',
	items: [
		{
			label: 'Save',
			action: () => { GP.apiCall('project.save'); }
		},
		'-',
		{
			label: 'New',
			action: () => { GP.apiCall('project.new'); }
		},
		{
			label: 'Open',
			action: () => { GP.apiCall('project.open'); }
		},
		{
			label: 'Open from board',
			action: () => { GP.apiCall('board.retrieveProject'); }
		},
		'-',
		{
			label: 'Copy project URL to clipboard',
			action: () => { GP.apiCall('project.copyURL'); }
		},
		'-',
		{
			label: 'put file on board',
			action: () => { GP.apiCall('board.uploadFile'); },
			disabled: !IDE.board.canDoBLE
		},
		{
			label: 'get file from board',
			action: () => { GP.apiCall('board.downloadFile'); },
			disabled: !IDE.board.canDoBLE
		}
	]
};

Menus.elementFor = function (selector) {
	// return an HTML tree containing the icon and menu for a menu selector

	let descriptor = this[selector];

	let icon = document.createElement('div');
	let img = document.createElement('img');

	icon.classList.add('icon');

	img.setAttribute('src', 'img/icon-' + descriptor.icon + '.svg');
	icon.appendChild(img);

	icon.onclick = () => {
		// dynamically generate the menu each time, since it can change depending on
		// the state of the board, preferences, etc
		if (IDE.currentMenu) {
			IDE.currentMenu.remove();
			IDE.currentMenu = null;
		} else {
			IDE.currentMenu = document.createElement('nav');
			IDE.currentMenu.classList.add('menu');
			IDE.currentMenu.icon = icon;
			icon.appendChild(IDE.currentMenu);

			descriptor.items.forEach(item => {
				let li = document.createElement('li');
				if (item == '-') {
					li.appendChild(document.createElement('hr'));
				} else {
					let a = document.createElement('a');
					let text = document.createElement('l-'); // localizable

					li.classList.add('menu-item');

					// set the menu item action
					a.onclick = item.action;

					// set the menu item label
					if (typeof item.label == 'string') {
						text.innerText = item.label;
					} else if (typeof item.label == 'function') {
						text.innerText = item.label();
					}

					// states: disabled and checked
					if (item.disabled) { a.classList.add('disabled'); }
					if (item.checked) {
						// can be checked, so it needs a tick icon
						let tick = document.createElement('img');
						tick.setAttribute('src', 'img/checkmark.svg');
						// we now run the checked callback to see if the item is checked or not
						tick.classList.add('tick');
						tick.classList.add(item.checked() ? 'checked' : 'unchecked');
						a.appendChild(tick);
					}

					a.appendChild(text);
					li.appendChild(a);
				}
				IDE.currentMenu.appendChild(li);
			});
		}
	};

	return icon;
};

document.addEventListener('click', (event) => {
	// close any open menu when clicking outside its influence area
	if (IDE.currentMenu) {
		if (
			!IDE.currentMenu.contains(event.target) &&
			!IDE.currentMenu.icon?.contains(event.target)
		) {
			IDE.currentMenu.remove();
			IDE.currentMenu = null;
		}
	}
})
