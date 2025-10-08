// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// icon-button.js - A clickable icon that does something.

// Bernat Romagosa, 2025

// TODO:
// [ ] action
// [ ] disabled state
// [x] cursor
// [ ] hover states

class IconButton extends HTMLElement {
	static get observedAttributes() { return ['src', 'size']; }

	constructor() {
		super();

		// create a shadow root that contains all subelements
		const shadow = this.attachShadow({ mode: 'open' });
		// create a wrapper subelement, just for positioning
		const wrapper = document.createElement('span');
		wrapper.setAttribute('class', 'wrapper');

		// create an icon subelement
		const icon = document.createElement('span');
		icon.setAttribute('class', 'icon');
		icon.setAttribute('tabindex', 0);
		const img = document.createElement('img');
		icon.appendChild(img);

		const style = document.createElement('style');
		shadow.appendChild(style);
		shadow.appendChild(wrapper);
		wrapper.appendChild(icon);
	}

	connectedCallback() {
		// take the contents of the src attribute and use it to source the image
		updateImage(this);
		updateStyle(this);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name == 'src') { updateImage(this); }
		if (name == 'size') { updateStyle(this); }
	}
};

function updateImage(elem) {
	const img = elem.shadowRoot.querySelector('img');
	if (elem.hasAttribute('src')) {
		img.src = 'icons/' + elem.getAttribute('src');
	} else {
		img.src = 'icons/no-icon.svg';
	}
};

function updateStyle(elem) {
	elem.shadowRoot.querySelector('style').textContent = `
		.wrapper {
			position: relative;
			display: inline-block;
			width: ${elem.getAttribute('size')}px;
			height: ${elem.getAttribute('size')}px;
			cursor: pointer;
		}
		img {
			width: 100%;
			height: 100%;
		}
	`;
}

customElements.define('icon-button', IconButton);
