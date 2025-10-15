MB_GUI = {}

MB_GUI.addMicroBlocksGUI = function (world) {
	const scriptingHeight = 500;
	const paletteWidth = 200;

	let palette = new ScrollFrameMorph();
	newMorph = new ScrollFrameMorph();
	palette.color = new Color(180, 180, 180);
	palette.setExtent(new Point(paletteWidth, scriptingHeight));
	this.addMicroBlocksSpecs(palette);
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

MB_GUI.addMicroBlocksSpecs = function (palette) {
	const specs = mbBuiltinBlockSpecs();
	let	y = 10;
	let currentCategory = 'Output';
	for (let i = 0; i < 166; i++) {
		let item = specs[i];
		if (Array.isArray(item)) { // block spec
			let b = this.blockForSpec(item, currentCategory);
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

MB_GUI.blockForSpec = function (spec, category) {
	if (Array.isArray(spec)) {
		let b;
		let type = spec[0];
		if (' ' == type) {
			b = new CommandBlockMorph();
		} else if ('r' == type) {
			b = new ReporterBlockMorph();
		} else if ('h' == type) {
			b = new HatBlockMorph();
		}
		b.selector = spec[1];
		b.setCategory(category);
		b.setSpec(this.snapSpecFrom(spec));
		// todo: set default values
		return b;
	}
	return undefined; // error; spec should be an array
}

MB_GUI.snapSpecFrom = function (spec) {
	if (spec[1] == 'if') { // special case for "if"
		return 'if %b %c %elseif';
	}
	let mbSpec = spec[2];
	let mbArgTypes = (spec.length > 3) ? spec[3].split(' ') : [];
	let i = mbSpec.indexOf(':');
	if (i > 0) {
		mbSpec = mbSpec.substring(0, i); // ignore optional args for now
	}
	let result = [];
	let argIndex = 0;
	while (true) {
		let i = mbSpec.indexOf('_');
		if (i >= 0) {
			let end = i;
			if ((end > 0) && (mbSpec[end - 1] == ' ')) {
				end--; // omit space before _
			}
			result.push(mbSpec.substring(0, end));
			result.push(this.mbToSnapArgType(mbArgTypes[argIndex]));
			if ((i < (mbSpec.length - 1)) && (mbSpec[i + 1] == ' ')) {
				i++; // omit space after _
			}
			mbSpec = mbSpec.substring(i + 1);
			argIndex++;
		} else {
			result.push(mbSpec);
			break;
		}
	}
	return result.join(' ').trim();
}

// MicroBlocks types: 'num' 'cmt' 'str' 'auto' 'bool' 'color' 'cmd' 'var' 'menu' 'microbitDisplay'
MB_GUI.mbToSnapArgType = function (mbArgType) {
	if (mbArgType.indexOf('.') < -1) return '%s'; // convert menu to string
	if ('num' == mbArgType) return '%n';
	if ('str' == mbArgType) return '%s';
	if ('auto' == mbArgType) return '%ns';
	if ('bool' == mbArgType) return '%b';
	if ('color' == mbArgType) return '%clr';
	if ('cmd' == mbArgType) return '%c';
	// 	if ('var' == mbArgType) return '%n';
	// 	if ('menu' == mbArgType) return '%n';
	return '%s'; // default
}

MB_GUI.handlePaste = function (event) {
	console.log('MB_GUI.handlePaste', event);
}
