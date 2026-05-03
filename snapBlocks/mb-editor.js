// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//
// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

/*
	MB_GUI - MicroBlocks user interface.
*/

/* global MB_Parser, MB_Specs, Color, Point, BlockMorph, ScriptsMorph, ScrollFrameMorph, StringMorph, world */

MB_GUI = {}

MB_GUI.addMicroBlocksGUI = function (world) {
	const scriptingHeight = 500;
	const paletteWidth = 200;

	let palette = new ScrollFrameMorph();
	palette.color = new Color(180, 180, 180);
	palette.setExtent(new Point(paletteWidth, scriptingHeight));
	this.addBlocksToPalette(palette);
	palette.contents.adjustBounds();
	palette.contents.acceptsDrops = true;
	palette.contents.reactToDropOf = (droppedMorph) => {
		if (droppedMorph instanceof BlockMorph) {
			droppedMorph.destroy();
		}
	};
	world.add(palette);

	let scripts = new ScriptsMorph();
	scripts.color = new Color(150, 150, 150);
	scripts.setLeft(paletteWidth);
	scripts.setExtent(new Point(1000, scriptingHeight));
	world.add(scripts);
}

MB_GUI.scriptsPane = function () {
	// Return the scripts pane.
	// Hack: Assume the scripts pane is the second child of the world.
	// This allows dynmically reloading of mb-blocks.js which breaks
	// "childThatIsA(ScriptsMorph)" by redefining the ScriptsMorph prototype.

	return world.children[1];
}

MB_GUI.removeAllScripts = function () {
	let allScripts = this.scriptsPane().children.slice();
	allScripts.forEach((m) => { m.destroy(); });
}

MB_GUI.addBlockToScripts = function (b) {
	// For testing. Add the given block to the scripts pane at a random position.

	let scriptsPane = this.scriptsPane();
	b.setPosition(new Point(this.randomBetween(200, 800), this.randomBetween(10, 300)));
	scriptsPane.add(b);
	scriptsPane.changed();
}

MB_GUI.addBlockToScriptsAt = function (b, x, y) {
	// For testing. Add the given block to the scripts pane at the given position.

	let scriptsPane = this.scriptsPane();
	b.setPosition(new Point(300 + x, y));
	scriptsPane.add(b);
	scriptsPane.changed();
}


MB_GUI.randomBetween = function (min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

MB_GUI.handlePaste = function (event) {
	let s = event.data;
	if (!s.startsWith('GP Script')) return; // ignore non-script paste

	let i = s.indexOf('script'); // find first script
	if (i < 0) return; // no scripts

	let p = new MB_Parser(s.slice(i));
	while (true) {
		let script = p.readCmd(false);
		if (script === null) break;
		if (script.length == 4) {
			this.addBlockToScripts(MB_Parser.blockFor(script[3]));
		}
	}
}

// ***** Populate the blocks palette *****

MB_GUI.addBlocksToPalette = function (palette) {
	const specs = MB_Specs.mbBlockSpecs();
	let y = 10;
	let currentCategory = 'Output';
	for (let i = 0; i < 169; i++) {
		let item = specs[i];
		if (Array.isArray(item)) { // block spec
			let b = MB_Specs.blockForSpec(item, currentCategory);
			b.setPosition(new Point(15, y));
			b.isTemplate = true;
			palette.contents.add(b);
			y += b.height() + 10;
		} else if ('-' == item) { // separator
			y += 15;
		} else {
			if (item.indexOf('cat;') == 0) {
				item = item.substring(4);
			}
			let fullCategoryName = item;
			if (item.indexOf('-Advanced') > 0) {
				item = item.substring(0, item.indexOf('-Advanced'));
			}
			currentCategory = item;
			if (y > 10) y += 15;
			let label = new StringMorph(fullCategoryName, 14);
			label.toggleWeight();
			label.setPosition(new Point(5, y));
			palette.contents.add(label);
			y += label.height() + 15;
		}
	}
}

MB_GUI.importLocalFile = function (callback) {
	async function processFile(file) {
		let txt = await file.text();
		if (callback) callback(file.name, txt);
	}

	var inp = document.createElement('input');
	inp.type = 'file';
	inp.multiple = true;
	inp.addEventListener(
		'change',
		(evt) => {
			document.body.removeChild(inp);
			for (const file of inp.files) {
				processFile(file);
			}
		},
		false
	);
	document.body.appendChild(inp);
	inp.click(); // show the input dialog
};

// Placeholder functions for eventual MB_Editor

MB_GUI.inform = function (msg) {
	// XXX TO DO
	console.log(msg);
}

MB_GUI.showError = function (blockMorph, errorString) {
	// XXX TO DO
	console.log(errorString);
}

MB_GUI.showDownloadProgress = function (phase, percent) {
	// XXX TO DO
}

MB_GUI.showDownloadProgress = function (phase, percent) {
	// XXX TO DO
}

MB_GUI.clearRunningHighlights = function () {
	// XXX TO DO
}

MB_GUI.justConnected = function () {
	// XXX TO DO
}

MB_GUI.sortedScripts = function () {
	// XXX TO DO
	return [];
}

// Debugging Utility Function

function reload(scriptPath) {
	// Run in console to reload a Javascript file without reloading the page.
	// Example: reloadScript('mb-gui.js')
	const newScript = document.createElement('script');
	newScript.src = scriptPath + '?' + new Date().getTime(); // cache busting
	document.body.appendChild(newScript);
}

// --- Global Helper Functions ---

function quoteIfNeeded(s) {
	// Return a quoted version of the given string if necessary for parsing.
	// Otherwise, return the original string.
	// To be unquoted, the string must start with a letter or underscore and must
	// contain only alfanumeric characters (including underscore).

	let mustQuote = false;
	if ((s.length == 0) || !/[a-zA-Z_]/.test(s[0])) { // does not start with a letter or underscore
		mustQuote = true;
	}
	for (const ch of s) {
		if (!/[a-zA-Z0-9_]/.test(ch)) {
			mustQuote = true; // contains a non-alphanumeric character
			break;
		}
	}
	return mustQuote ? ('\'' + fixEmbeddedQuotes(s) + '\'') : s;
}

function fixEmbeddedQuotes(s) {
	// If the given string includes any single quote characters, double them so that the
	// the MicroBlocks parser will treat them as embedded quotes.

	if (!s.includes('\'')) return s;
	return s.replaceAll('\'', '\'\''); // double embedded single quotes
}

async function waitMSecs(msecs) {
	const sleep = function (msecs) {
		return (new Promise( resolve => setTimeout(resolve, msecs) ));
	}
	await sleep(msecs);
}

function localized(s) {
	// XXX TODO: Use actual localization system
	return s;
}

function isMobile() {
	return false;
}

function varMustBeQuoted(varName) {
	// Return true if varName must be enclosed in quotes when serialized.
	// A name must be quoted if it is empty, contains a space, or starts with a digit or '-'.
	if (varName === '') return true;
	if (varName.includes(' ')) return true;
	const ch = varName[0];
	return /\d/.test(ch) || ch === '-';
}

// MB_GUI is a placeholder for the eventual MB_Editor
const MB_editor = MB_GUI;
