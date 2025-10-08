// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// localizable-text.js - A localizable HTML text element
// Bernat Romagosa, 2025


class LocalizableText extends HTMLElement {
	constructor() {
		super();
		this.key = '';
	}

	connectedCallback() {
		this.key = this.textContent;
		GetText.addLocalizable(this);
		this.localize();
	}

	localize () { this.innerText = GetText.localize(this.key); }
}

customElements.define('l-', LocalizableText);
