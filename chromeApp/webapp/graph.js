FloatingWindow.graph = function () {
	let win = new FloatingWindow({
		title: 'Data Graph',
		body: Graph.build(),
		resizable: true,
		onResize: Graph.resize,
		target: Graph
	});
	win.popUp();
	return win;
};

const Graph = {
	origin: 'center',
	step: 25,
	spacing: 25,
	width: 400,
	height: 250,
	dataTracks: [[],[],[],[],[],[]],
	trackColors: [
		'rgb(200,0,0)',
		'rgb(0,110,0)',
		'rgb(0,0,200)',
		'rgb(30,30,30)',
		'rgb(0,170,170)',
		'rgb(180,0,180)'
	]
};

Graph.build = function () {
	this.canvas = document.createElement('canvas');
	this.canvas.style.display = 'block';
	this.canvas.classList.add('graph');

	this.ctx = this.canvas.getContext('2d');
	this.resize(this.width, this.height);

	this.canvas.oncontextmenu = (e) => {
		Menus.popUp('graph', this.canvas, this, e);
		e.preventDefault();
	};

	return this.canvas;
};

Graph.resize = function (newWidth, newHeight) {
	this.width = newWidth - 50;
	this.height = newHeight - 95;
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.redraw();
};

Graph.redraw = function () {
	this.drawGrid();
	this.drawData();
};

Graph.drawGrid = function () {
	let range = this.height / this.spacing;
	this.ctx.fillStyle = 'white';
	this.ctx.fillRect(0, 0, this.width, this.height);
	this.ctx.font = 'lighter 12px Arial';
	this.ctx.lineWidth = 1;
	this.ctx.textAlign = 'end';
	if (this.origin == 'center') {
		for (let i = Math.floor(range/-2); i <= Math.floor(range/2); i ++) {
			this.drawRow(i, this.height - ((i + range/2) * this.spacing))
		}
	} else {
		for (let i = 0; i <= range; i ++) {
			this.drawRow(i, this.height - (i * this.spacing))
		}
	}
};

Graph.drawRow = function (index, y) {
	this.setColor(index);
	this.ctx.fillText(index * this.step, 40, y + 4);
	this.ctx.beginPath();
	this.ctx.moveTo(45, y);
	this.ctx.lineTo(this.width - 5, y);
	this.ctx.stroke();
};

Graph.setColor = function (index) {
	if (index % 5 == 0) {
		this.ctx.fillStyle = 'rgb(10,10,10)';
		this.ctx.strokeStyle = 'rgb(180,180,180)';
	} else {
		this.ctx.fillStyle = 'rgb(150,150,150)';
		this.ctx.strokeStyle = 'rgb(210,210,210)';
	}
};

Graph.drawData = function () {
	this.dataTracks.forEach((dataPoints, track) => {
		let x = 45,
			hRange = this.width - 50,
			end = dataPoints.length,
			start = Math.max(0, end - hRange);

		this.ctx.beginPath();
		this.ctx.strokeStyle = this.trackColors[track];
		this.ctx.moveTo(x, this.scaleValue(dataPoints[start]));
		for (let i = start; i < end; i++) {
			if (dataPoints[i] !== null) {
				x++;
				this.ctx.lineTo(x, this.scaleValue(dataPoints[i]));
			}
		}
		this.ctx.stroke();
	});
};

Graph.addDataPoints = function (values) {
	for (let i = 0; i < this.dataTracks.length; i++) {
		if (values[i]) {
			this.dataTracks[i].push(values[i]);
		} else {
			// did I actually find a use case for NaN? I did!
			this.dataTracks[i].push(NaN);
		}
	}
	this.redraw();
};

Graph.scaleValue = function (value) {
	if (this.origin == 'center') {
		return this.height - value * this.spacing / this.step - (this.height / 2);
	} else {
		return this.height - value * this.spacing / this.step;
	}
};

Graph.clear = function () {
	this.dataTracks = [[],[],[],[],[],[]];
	this.redraw();
};

Graph.increaseRange = function () {
	if (this.step < 5000) { this.step *= 2; }
	this.redraw();
};

Graph.decreaseRange = function () {
	if (this.step > 5) { this.step /= 2; }
	this.redraw();
};

Graph.setOrigin = function(which) {
	this.origin = which;
	this.redraw();
};

// Graph context menu

Menus.graph = {
	selector: 'graph',
	type: 'context',
	items: [
		{
			label: 'clear graph',
			action: (target, event) => { Graph.clear(); }
		},
		{ label: '-' },
		{
			label: 'increase range',
			action: (target, event) => { Graph.increaseRange(); }
		},
		{
			label: 'decrease range',
			action: (target, event) => { Graph.decreaseRange(); }
		},
		{
			label: () => {
				return Graph.origin == 'center' ? 'zero at bottom' : 'zero in middle'
			},
			action: (target, event) => {
				Graph.setOrigin(Graph.origin == 'center' ? 'bottom' : 'center');
			}
		},
		{ label: '-' },
		{
			label: 'export data to CSV file',
			action: (target, event) => { Graph.exportData(); }
		},
		{
			label: 'import data from CSV file',
			action: (target, event) => { Graph.importData(); }
		},
		{
			label: 'copy graph data to clipboard',
			action: (target, event) => { Graph.copyDataToClipboard(); },
			advanced: true
		},
		{
			label: '-',
			advanced: true
		},
		{
			label: 'set serial delay',
			action: (target, event) => {
				Menus.popUp('serialDelay', null, target, event);
			},
			advanced: true
		}
	]
};

Menus.serialDelay = {
	selector: 'serialDelay',
	type: 'context',
	items: [1,2,3,4,5,6,8,10,12,14,16,18,20].map(value => {
		return {
			label: value,
			action: (target) => {
				Graph.setSerialDelay(value);
			}
		}
	})
};

Menus.serialDelay.items.push('-');
Menus.serialDelay.items.push({
	label: 'reset to default (10)',
	action: (target, event) => { Graph.setSerialDelay(10); }
});
