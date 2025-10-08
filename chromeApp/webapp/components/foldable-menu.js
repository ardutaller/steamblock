// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// foldable-menu.js - A menu component that can be folded and unfolded. Its
// items are read from a JSON file and have the form:

// {
//   "label": "The Item Label",
//   "icon": "an-icon-name",
//   "onclick": "aJsFunction()"
// }

// A string containing a single hyphen represents a separator.

// Bernat Romagosa, 2025

// TODO:
// [x] localization
// [ ] read and use icons
// [ ] hide/show items from menu dynamically
// [ ] close menu when clicking item
// [ ] close menu when clicking somewhere outside


class FoldableMenu extends HTMLElement {
	static get observedAttributes() { return ['json']; }

	constructor() {
		super();
		this.items = [];

		// create a shadow root that contains all subelements
		const shadow = this.attachShadow({ mode: 'open' });
		// create a container subelement to hold the menu items
		const container = document.createElement('nav');
		container.setAttribute('class', 'container');

		const style = document.createElement('style');
		style.textContent = `
		.container {
			position: absolute;
			display: block;
			left: 0;
			background: white;
			border: 1px solid red;
		}
	`;

		shadow.appendChild(style);
		shadow.appendChild(container);
	}
	// add a "collapsed" state
	get collapsed() {
		return this.hasAttribute('hidden');
	}

	set collapsed(flag) {
		if (flag) {
			this.setAttribute('hidden', true);
		} else {
			this.removeAttribute('hidden');
		}
	}

	connectedCallback() {
		// call the selector and generate the menu items accordingly
		const container = this.shadowRoot.querySelector('.container');
		fetch('json/' + this.getAttribute('json') + '.json')
			.then(result => result.json())
			.then(descriptors => {
				descriptors.forEach((descriptor) => {
					let item = document.createElement('menu-item');
					item.applyDescriptor(descriptor);
					container.appendChild(item);
					this.items.push(item);
				});
			});
	}
}

customElements.define('foldable-menu', FoldableMenu);
