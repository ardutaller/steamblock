function addMicroBlocksGUI(world) {
	var paletteWidth = 150;

	var palette = new ScrollFrameMorph();
	newMorph = new ScrollFrameMorph();
	palette.color = new Color(180, 180, 180);
	palette.setExtent(new Point(paletteWidth, 600));
	palette.contents.acceptsDrops = true;
	addTestBlocks(palette);
	palette.contents.adjustBounds();
	world.add(palette);

	var scripts = new ScriptsMorph();
	scripts.setLeft(paletteWidth);
	scripts.setExtent(new Point(800, 600));
	world.add(scripts);

	var x = paletteWidth + 10;
	scripts.add(newBlock(' ', 'motion', 'testing %s', x, 10));
	scripts.add(newBlock(' ', 'looks', 'something else %s', x, 40));
	scripts.add(newBlock(' ', 'operators', 'report this %s', x, 70));
}

function newBlock(type, category, spec, x, y) {
	var b = ('r' == type) ? new ReporterBlockMorph() : new CommandBlockMorph();
	b.setCategory(category);
	b.setSpec(spec);
	b.isDraggable = true;
	b.setPosition(new Point(x, y));
	return b;
}

function addTestBlocks(palette) {
	var y = 10;
	for (var i = 0; i < 20; i++) {
		b = new CommandBlockMorph();
		b.setCategory('motion');
		b.setSpec('testing %s');
		b.isTemplate = true;
		b.setPosition(new Point(10, y));
		palette.contents.add(b);
		y += b.height() + 10;
	}
}
