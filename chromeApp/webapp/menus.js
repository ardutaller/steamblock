// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// menus.js - Create all sorts of menus.

// Bernat Romagosa, 2025

const Menus = {};

// TOP BAR MENUS

Menus.language = { selector: 'language', type: 'top', items: [] };

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
	selector: 'settings',
	type: 'top',
	items: [
		{
			label: 'about...',
			action: () => { FloatingWindow.about(); }
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
	selector: 'project',
	type: 'top',
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
	selector: 'connection',
	type: 'top',
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

// CONTEXT MENUS

Menus.library = {
	selector: 'library',
	type: 'context',
	items: [
		{
			label: 'library information',
			action: (libName) => { GP.apiCall('library.showInfoDialog', [libName]); },
		},
		{
			label: 'show all block definitions',
			action: (libName) => { GP.apiCall('library.showDefs', [libName]); },
		},
		{
			label: 'hide all block definitions',
			action: (libName) => { GP.apiCall('library.hideDefs', [libName]); },
		},
		{
			label: 'export this library',
			action: (libName) => { GP.apiCall('library.export', [libName]); },
		},
		{ label: '-' },
		{
			label: 'delete library',
			action: (libName) => { GP.apiCall('library.delete', [libName]); },
		},
	]
};

Menus.scriptingArea = {
	selector: 'scriptingArea',
	type: 'context',
	items: [
		{
			label: 'set block size...',
			action: (target, event) => {
				Menus.popUp('blockZoomLevels', null, target, event);
			},
			keepOpenAfterClick: true
		},
		{ label: '-' },
		{
			label: 'clean up',
			action: () => { GP.apiCall('scripts.cleanUp'); }
		},
		{ label: '-' },
		{
			label: 'copy all scripts to clibboard',
			action: () => { GP.apiCall('scripts.copyToClipboard'); }
		},
		{
			label: 'copy all scripts to clibboard as URL',
			action: () => { GP.apiCall('scripts.copyToClipboardAsURL'); }
		},
		{ label: '-' },
		{
			label: 'paste all scripts from clipboard',
			action: () => { GP.apiCall('scripts.paste'); },
			hidden: () => {
				return GP.clipboardBytes.length == 0 ||
					!clipboardText().startsWith('GP Scripts');
			}
		},
		{
			label: 'paste script from clipboard',
			action: () => { GP.apiCall('scripts.paste'); },
			hidden: () => {
				return GP.clipboardBytes.length == 0 ||
					!clipboardText().startsWith('GP Script\n');
			}
		},
		{
			label: '-',
			hidden: () => { return GP.clipboardBytes.length == 0; }
		},
		{
			label: 'save a picture of all visible scripts',
			action: () => { GP.apiCall('scripts.saveImage'); }
		},
		{
			label: 'set exported script scale',
			action: (target, event) => {
				Menus.popUp('exportedScriptScale', null, target, event);
			},
			keepOpenAfterClick: true,
			hidden: () => { return !IDE.userPreference('devMode'); }
		}
	]
};

Menus.blockZoomLevels = {
	selector: 'blockZoomLevels',
	type: 'context',
	items: [50,75,100,125,150,200,250].map(level => {
		return {
			label: level + '%',
			action: (target) => { GP.apiCall('scripts.setZoom', [level]); }
		}
	})
};

Menus.exportedScriptScale = {
	selector: 'exportedScriptScale',
	type: 'context',
	items: [50,65,100,200].map((level, index) => {
		return {
			label: `${['small', 'normal', 'large', 'printable'][index]} (${level}%)`,
			action: (target) => {
				GP.apiCall('scripts.setExportedScriptScale', [level]);
			}
		}
	})
};

// MENU HTML GENERATION

Menus.elementFor = function (descriptor, target) {
	// return an HTML tree containing the menu for a menu selector or menu
	// descriptor, and dynamically generate the menu each time, since it can
	// change depending on the state of the board, preferences, etc
	let menu = document.createElement('nav');

	menu.classList.add(`${descriptor.type}-menu`);

	descriptor.items.forEach((item, index) => {
		if (!(item.hidden?.())) {
			let li = document.createElement('li');
			if (item.label == '-') {
				// vertical separator, unless this is the last item
				li.appendChild(document.createElement('hr'));
			} else {
				let a = document.createElement('a');
				let text = document.createElement('l-'); // localizable

				menu.id = `menu-${descriptor.selector}`;
				li.classList.add('menu-item');

				// set the menu item action
				a.onclick = (event) => {
					event.ignoreGlobalListener = true;
					item.action(target, event);
					if (!item.keepOpenAfterClick) { this.close(); }
				};

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
					let tick = document.createElement('span');
					fetch('img/checkmark.svg')
						.then(res => res.text())
						.then(text => tick.innerHTML = text);
					// we now run the checked callback to see whether the item is checked
					tick.classList.add('tick');
					tick.classList.add(item.checked() ? 'checked' : 'unchecked');
					a.appendChild(tick);
				}

				a.appendChild(text);
				li.appendChild(a);
			}
			menu.appendChild(li);
		}
	});

	return menu;
};

Menus.popUp = function (selector, triggerElement, target, event) {
	this.popUpFromDescriptor(this[selector], triggerElement, target, event);
};

Menus.popUpFromDescriptor = function (
	descriptor, triggerElement, target, event
) {
	this.close();
	let container = document.querySelector('.top-bar .menu'),
		nav = this.elementFor(descriptor, target),
		type = descriptor.type,
		pos = type == 'context'
			? { x: event.clientX, y: event.clientY }
			: triggerElement.getClientRects()[0];
	nav.trigger = triggerElement;
	container.appendChild(nav);
	container.style.left = `${pos.x}px`;
	container.style.top =
		`${pos.y + (triggerElement ? triggerElement.clientHeight : 0)}px`;
	nav.style.maxHeight = `${window.innerHeight - 80}px`;
}

Menus.current = function () {
	return document.querySelector('.top-bar .menu nav');
}

Menus.close = function () {
	this.current()?.remove();
};

// MENU EVENTS

document.addEventListener('click', (event) => {
	// close any open menu when clicking outside its influence area
	let currentMenu = Menus.current();
	if (currentMenu) {
		if (
			!currentMenu.contains(event.target) &&
			!currentMenu.trigger?.contains(event.target) &&
			!event.ignoreGlobalListener
		) {
			currentMenu.remove();
		}
	}
});

document.addEventListener('context', (e) => {
	let descriptor = e.detail.value;
	if (descriptor.x) { // this comes from GP
		// we have to offset it by the GP canvas position
		let canvas = document.querySelector('#canvas.emscripten');
		e.clientX = descriptor.x + canvas.offsetLeft;
		e.clientY = descriptor.y + canvas.offsetTop;
	}
	Menus.popUp(descriptor.selector, null, null, e);
	e.preventDefault();
});

document.addEventListener('choices', (e) => {
	let descriptor = e.detail.value;
	if (descriptor.x) { // this comes from GP
		// we have to offset it by the GP canvas position
		let canvas = document.querySelector('#canvas.emscripten');
		e.clientX = descriptor.x + canvas.offsetLeft;
		e.clientY = descriptor.y + canvas.offsetTop;
	}
	Menus.popUpFromDescriptor(
		{
			type: 'context',
			items: descriptor.items.map(item => {
				return {
					label: item,
					action: () => {
						GP.apiResponses[descriptor.id] = JSON.stringify(item);
					}
				}
			})
		},
		null,
		null,
		e
	);
	e.preventDefault();
});
