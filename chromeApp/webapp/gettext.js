// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// gettext.js - A GetText subset parser. Not by any means a complete GetText
// engine. Just the very few parts that we need for MicroBlocks.
// Bernat Romagosa, 2025

var GetText = {};
GetText.locales = [];
GetText.currentLocale = 'en';

GetText.readLocale = function (langcode, callback) {
	this.locales[langcode] = {};
	fetch('translations/' + langcode + '.po')
		.then(response => response.text())
		.then(text => {
			this.parseLocale(text, langcode);
			if (callback) { callback.call(); }
		});
};

GetText.parseLocale = function (text, langcode) {
	var lines = text.split('\n');
	// populate the locale dictionary with all key and values
	// skip the first line, as it's always an empty key
	for (var i = 1; i < lines.length; i++) {
		if (lines[i].indexOf('msgid') > -1) {
			// key is always in a single line
			var key = lines[i].substring(7, lines[i].length - 1);
			var value = '';
			i++;
			while (
					(lines[i] !== undefined) &&
					(lines[i].indexOf('msgid') == -1) &&
					(lines[i] !== '')
			) {
				if (lines[i].indexOf('msgstr') > -1) {
					// remove msgstr and quotes
					value += lines[i].substring(8, lines[i].length - 1);
				} else {
					// remove quotes
					value += lines[i].substring(1, lines[i].length - 1);
				}
				i++;
			}
			this.locales[langcode][key] = value;
		}
	}
};

GetText.setLocale = function (langcode) {
	if (this.locales[langcode] == undefined) {
		this.readLocale(langcode, () => { this.setLocale(langcode);} )
	} else {
		this.currentLocale = langcode;
		this.localizePage();
	}
};

GetText.localize = function (key) {
	var value = this.locales[this.currentLocale][key];
	// default to EN if GetText locale doesn't have a translation for GetText key
	if ((value == undefined) || (value == '')) {
		value = this.locales['en'][key];
	}
	// default to the key itself if there's no EN translation either
	if ((value == undefined) || (value == '')) { value = key; }
	return value;
};

GetText.localizePage = function () {
	document.querySelectorAll('l').forEach(element => {
		element.innerText = this.localize(element.innerText);
	});
};
