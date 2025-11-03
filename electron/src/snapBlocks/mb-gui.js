MB_GUI = {}

MB_GUI.addMicroBlocksGUI = function (world) {
	const scriptingHeight = 500;
	const paletteWidth = 200;

	let palette = new ScrollFrameMorph();
	newMorph = new ScrollFrameMorph();
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
		let b = p.readCmd(false);
		if (b === null) break;
		if (b.inputs().length == 3) {
			this.addBlockToScripts(b.inputs()[2]);
		}
	}
}

// ***** Populate the blocks palette *****

MB_GUI.addBlocksToPalette = function (palette) {
	const specs = MB_Specs.mbBlockSpecs();
	let	y = 10;
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
			for (let i = 0; i < inp.files.length; i++) {
				processFile(inp.files[i]);
			}
		},
		false
	);
	document.body.appendChild(inp);
	inp.click(); // show the input dialog
};

// Debugging Utility Function

function reload(scriptPath) {
	// Run in console to reload a Javascript file without reloading the page.
	// Example: reloadScript('mb-gui.js')
    const newScript = document.createElement('script');
    newScript.src = scriptPath + '?' + new Date().getTime(); // cache busting
    document.body.appendChild(newScript);
}
