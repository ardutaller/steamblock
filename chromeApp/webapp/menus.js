// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// menus.js - Create all sorts of menus.

// Bernat Romagosa, 2025

const Menus = {};
Menus.language = {
	icon: 'globe',
	label: 'Language',
	description: 'Set the language of the IDE, including all the blocks.',
	items: []
};

Menus.language.init = function () {
	// fill language menu out of available locales
	fetch('translations/locales.json')
		.then(response => response.json())
		.then(descriptors => {
			descriptors.forEach(descriptor => {
				this.items.push({
					label: descriptor[0],
					action: () => { GetText.setLocale(descriptor[1]); },
					checked: () => { return GetText.currentLocale == descriptor[1] }
				});
			})
		})
		.then(() => {
			this.items.push({ label: '-' });
			this.items.push({
				label: 'Missing language?',
				action: () => {
					window.open('https://wiki.microblocks.fun/en/translating', '_blank');
				}
			});
			this.items.push({ label: '-' });
			this.items.push({
				label: 'Custom...',
				action: () => { GP.apiCall('locale.loadCustomFile'); }
			});
		});
};
Menus.language.init();

Menus.settings = {
	icon: 'gear',
	label: 'Settings',
	description: 'User preferences and different IDE settings and tweaks.',
	items: [
		{
			label: 'about...',
			action: () => { GP.apiCall('ide.showAboutBox'); }
		},
		{ label: '-' },
		{
			label: 'update firmware on board',
			action: () => { GP.apiCall('board.installVM', [false, false]); }
		},
		{ label: '-' },
		{
			label: 'inform of new versions',
			checked: () => { return IDE.userPreference('versionCheckOnStartup'); },
			action: () => { IDE.toggleUserPreference('versionCheckOnStartup'); }
		},
		{
			label: 'dark mode',
			checked: () => { return IDE.userPreference('darkMode'); },
			action: () => { IDE.toggleUserPreference('darkMode'); }
		},
		{
			label: 'advanced mode',
			checked: () => { return IDE.userPreference('devMode'); },
			action: () => { IDE.toggleAdvancedMode(); }
		},
		{ label: '-', hidden: () => { return !IDE.userPreference('devMode'); } },
		{
			label: 'show implementation blocks',
			checked: () => { return IDE.userPreference('showImplementationBlocks'); },
			action: () => { IDE.toggleUserPreference('showImplementationBlocks'); },
			hidden: () => { return !IDE.userPreference('devMode'); }
		},
		{
			label: 'autoload board libraries',
			checked: () => { return !IDE.userPreference('boardLibAutoLoadDisabled'); },
			action: () => { IDE.toggleUserPreference('boardLibAutoLoadDisabled'); },
			hidden: () => { return !IDE.userPreference('devMode'); }
		},
		{ label: '-', hidden: () => { return !IDE.userPreference('devMode'); } },
		{
			label: 'install ESP firmware from URL',
			action: () => { GP.apiCall('board.installVMfromURL'); },
			hidden: () => { return !IDE.userPreference('devMode'); },
			disabled: () => { return !IDE.board.connected; }
		},
		{
			label: 'install ESP firmware from microblocks.fun',
			action: () => { GP.apiCall('board.installVMfromRepo'); },
			hidden: () => { return !IDE.userPreference('devMode'); },
			disabled: () => { return !IDE.board.connected; }
		},
		{
			label: 'erase flash and update firmware on ESP board',
			action: () => { GP.apiCall('board.installVM', [true, false]); },
			hidden: () => { return !IDE.userPreference('devMode'); },
			disabled: () => { return !IDE.board.connected; }
		},
		{ label: '-', hidden: () => { return !IDE.userPreference('devMode'); } },
		{
			label: 'compact code store',
			action: () => { GP.apiCall('board.compactStorage'); },
			hidden: () => { return !IDE.userPreference('devMode'); },
			disabled: () => { return !IDE.board.connected; }
		},
		{
			label: '-',
			hidden: () => {
				return !IDE.userPreference('devMode') || !IDE.board.canDoBLE;
			}
		},
		{
			label: 'enable or disable BLE',
			action: () => { GP.apiCall('board.toggleBLE'); },
			hidden: () => {
				return !IDE.userPreference('devMode') || !IDE.board.canDoBLE;
			}
		}
	]
};

Menus.project = {
	icon: 'file',
	label: 'Project',
	description: 'Actions relating to MicroBlocks projects.',
	items: [
		{
			label: 'Save',
			action: () => { GP.apiCall('project.save'); }
		},
		{ label: '-' },
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
		{ label: '-' },
		{
			label: 'Copy project URL to clipboard',
			action: () => { GP.apiCall('project.copyURL'); }
		},
		{ label: '-', hidden: () => { return !IDE.userPreference('devMode'); } },
		{
			label: 'export functions as library',
			action: () => { GP.apiCall('project.exportBlocksLibrary'); },
			hidden: () => {
				return !IDE.userPreference('devMode') && !IDE.project.hasCustomBlocks;
			},
			disabled: () => { return !IDE.project.hasCustomBlocks; }
		},
		{
			label: 'put file on board',
			action: () => { GP.apiCall('board.uploadFile'); },
			hidden: () => { return !IDE.userPreference('devMode'); },
			disabled: () => { return !IDE.board.hasFS }
		},
		{
			label: 'get file from board',
			action: () => { GP.apiCall('board.downloadFile'); },
			hidden: () => { return !IDE.userPreference('devMode'); },
			disabled: () => { return !IDE.board.hasFS }
		}
	]
};

Menus.connection = {
	icon : 'usb',
	label: 'Connection',
	description: 'Connect to a microcontroller via USB or BLE, or open Boardie.',
	items: [
		{
			label: 'connect (USB)',
			action: () => { GP.apiCall('board.connect', ['USB']); },
			hidden: () => { return IDE.board.connected }
		},
		{
			label: 'connect (BLE)',
			action: () => { GP.apiCall('board.connect', ['BLE']); },
			hidden: () => { return IDE.board.connected }
		},
		{
			label: '-',
			hidden: () => { return IDE.board.connected }
		},
		{
			label: 'open Boardie',
			action: () => { GP.apiCall('board.connect', ['Boardie']); },
			hidden: () => { return IDE.board.connected }
		},
		{
			label: 'disconnect',
			action: () => { GP.apiCall('board.disconnect'); },
			hidden: () => { return !IDE.board.connected }
		}
	]
};

Menus.elementFor = function (selector) {
	// return an HTML tree containing the icon and menu for a menu selector
	let descriptor = this[selector];
	let icon = Icon.forSelector(descriptor.icon);

	icon.ariaLabel = descriptor.label;
	icon.ariaDescription = descriptor.description;

	icon.openMenu = () => {
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

			descriptor.items.forEach((item, index) => {
				if (!(item.hidden?.())) {
					let li = document.createElement('li');
					if (item.label == '-') {
						// vertical separator, unless this is the last item
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
						if (item.disabled?.()) {
							a.classList.add('disabled');
						}
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
				}
			});
		}
	};
	icon.clickable = icon;
	icon.onclick = icon.openMenu;

	return icon;
};

document.addEventListener('click', (event) => {
	// close any open menu when clicking outside its influence area
	if (IDE.currentMenu) {
		if (
			!IDE.currentMenu.contains(event.target) &&
			!IDE.currentMenu.icon?.clickable.contains(event.target)
		) {
			IDE.currentMenu.remove();
			IDE.currentMenu = null;
		}
	}
})
