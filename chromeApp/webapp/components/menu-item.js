// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// menu-item.js - A menu item component. It is populated with a descriptor of
// the form:

// {
//   "label": "The Item Label",
//   "icon": "an-icon-name",
//   "onclick": "aJsFunction()",
//   "checked": "aJsFunction()"
// }

// A string containing a single hyphen represents a separator.

// Bernat Romagosa, 2025

// TODO:
// [x] localization
// [ ] read and use icons
// [ ] checked state
// [ ] disabled state
// [ ] hide/show item dynamically
// [x] cursor
// [ ] hover states

class MenuItem extends HTMLElement {
	static get observedAttributes() { return ['']; }

	constructor() {
		super();

		// create a shadow root that contains all subelements
		const shadow = this.attachShadow({ mode: 'open' });
		// create a li subelement to hold the menu item
		const li = document.createElement('li');

		const style = document.createElement('style');
		style.textContent = `
		li {
			list-style: none;
			cursor: pointer;
		}
	`;

		shadow.appendChild(style);
		shadow.appendChild(li);
	}

	applyDescriptor(descriptor) {
		const li = this.shadowRoot.querySelector('li');
		if (descriptor == '-') {
			li.appendChild(document.createElement('hr'));
		} else {
			let l = document.createElement('l-'); // localizable
			l.innerText = descriptor.label;
			li.setAttribute('onclick', descriptor.onclick);
			li.appendChild(l);
		}
	}

	connectedCallback() { }
}

customElements.define('menu-item', MenuItem);
