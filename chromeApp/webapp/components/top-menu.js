// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// top-menu.js - An element with an icon button that unfolds a menu.

// Bernat Romagosa, 2025

class TopMenu extends HTMLElement {
	static get observedAttributes() { return ['selector', 'icon']; }

	constructor() {
		super();

		// create a shadow root that contains all subelements
		const shadow = this.attachShadow({ mode: 'open' });
		// create a wrapper subelement, just for positioning
		const wrapper = document.createElement('span');
		wrapper.setAttribute('class', 'wrapper');

		// create the menu
		const menu = document.createElement('foldable-menu');
		menu.setAttribute('class', 'menu');
		menu.setAttribute('hidden', true);

		// create an icon button subelement
		const button = document.createElement('icon-button');
		button.setAttribute('class', 'button');
		button.setAttribute('tabindex', 0);
		button.setAttribute('size', 26);

		button.onclick = () => { menu.collapsed = !menu.collapsed; }

		const style = document.createElement('style');
		style.textContent = `
		.wrapper {
			position: relative;
			display: inline-block;
		}
	`;
		shadow.appendChild(style);
		shadow.appendChild(wrapper);
		wrapper.appendChild(button);
		wrapper.appendChild(menu);
	}

	connectedCallback() {
		// set the icon for the button
		const button = this.shadowRoot.querySelector('.button');
		if (this.hasAttribute('icon')) {
			button.setAttribute('src', 'icon-' + this.getAttribute('icon') + '.svg');
		} else {
			button.setAttribute('src', 'no-icon.svg');
		}

		// create the menu
		const menu = this.shadowRoot.querySelector('.menu');
		if (this.hasAttribute('json')) {
			menu.setAttribute('json', this.getAttribute('json'));
		}
	}

	attributeChangedCallback(name, oldValue, newValue) { }
}

customElements.define('top-menu', TopMenu);

