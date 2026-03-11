class FloatingWindow extends HTMLElement {
	constructor(descriptor) {
		super();
		this.x = 0;
		this.y = 0;

		let lastX = 0, lastY = 0; // for resize purposes

		// Min and max size
		this.minWidth = descriptor.minWidth ?? 240;
		this.minHeight = descriptor.minHeight ?? 120;
		this.style.minWidth = this.minWidth + 'px';
		this.style.minHeight = this.minHeight + 'px';

		this.width = this.minWidth;
		this.height = this.minHeight;

		this.onResize = descriptor.onResize;
		this.target = descriptor.target;

		if (descriptor.id) { this.id = descriptor.id; }

		// Window Top
		if (typeof descriptor.title == 'string') {
			let windowTop = document.createElement('div');
			let windowTitle = document.createElement('h2');
			let windowClose = document.createElement('button');

			windowTop.classList.add('window__top');
			windowTitle.classList.add('window__title');
			windowClose.classList.add('window__close');

			windowTitle.innerHTML = `<l->${descriptor.title}</l->`;
			fetch('img/icon-close--16x16.svg')
				.then(res => res.text())
				.then(text => windowClose.innerHTML = text);

			windowTop.appendChild(windowTitle);
			windowTop.appendChild(windowClose);
			this.append(windowTop);
		}


		// Window Body
		let windowBody = document.createElement('div');
		windowBody.classList.add('window__body');
		windowBody.setAttribute('data-undraggable', true);

		if (descriptor.body) {
			if (typeof descriptor.body == 'string') {
				windowBody.innerText = descriptor.body;
			} else if (typeof descriptor.body == 'object') { // assume DOM element
				windowBody.append(descriptor.body);
			}
		}

		if (descriptor.input) {
			let input = descriptor.input.multiline ?
				document.createElement('textarea') :
				document.createElement('input');
			input.classList.add('window__input');
			input.type = descriptor.input.type ?? 'text';
			input.default = descriptor.input.defaultValue ?? '';
			input.placeholder = descriptor.input.placeholder ?? '';
			input.onfocus = () => { GP.delegateKeyboardEvents = true; };
			input.onblur = () => { GP.delegateKeyboardEvents = false; };
			windowBody.append(input);
		}
		this.append(windowBody);


		// Buttons
		if (descriptor.buttons) {
			let windowButtons = document.createElement('div');
			windowButtons.classList.add('window__buttons');
			windowButtons.setAttribute('data-undraggable', true);

			descriptor.buttons.forEach(buttonDescriptor => {
				let button = document.createElement('button');
				button.innerHTML = `<l->${buttonDescriptor.label}</l->`;
				button.classList.add('button-rounded');
				windowButtons.append(button);

				button.onclick = () => {
					let value;
					if (descriptor.input) {
						value = windowBody.querySelector('.window__input').value;
					}
					buttonDescriptor.action.call(this, value);
					if (buttonDescriptor.closesWindow) { this.remove(); }
					GP.delegateKeyboardEvents = false;
				};
			});

			windowButtons.children[0].classList.add('--default');
			this.append(windowButtons);
		}


		// Resize
		if (descriptor.resizable) {
			let handle = document.createElement('button');
			handle.classList.add('window__resize');
			handle.setAttribute('data-undraggable', true);
			handle.onpointerdown = resizeMouseDown;

			let myself = this;

			function resizeMouseDown(e) {
				e = e || window.event;
				e.preventDefault();
				lastX = e.clientX;
				lastY = e.clientY;
				document.onpointerup = endResize;
				document.onpointermove = resize;
			}

			function resize(e) {
				e = e || window.event;
				e.preventDefault();

				let newX = e.clientX,
					newY = e.clientY,
					newWidth = Math.max(
						myself.minWidth,
						myself.width + (newX - lastX)
					),
					newHeight = Math.max(
						myself.minHeight,
						myself.height + (newY - lastY)
					);

				myself.style.width = newWidth + 'px';
				myself.style.height = newHeight + 'px';
				if (myself.onResize) {
					myself.onResize.call(myself.target, newWidth, newHeight);
				}
			}

			function endResize(e) {
				myself.width = parseInt(myself.style.width);
				myself.height = parseInt(myself.style.height);
				document.onpointerup = null;
				document.onpointermove = null;
			}

			this.append(handle);
		}
	}


	popUp() {
		document.body.append(this);

		this.onkeydown = (e) => {
			if (e.key == 'Enter') {
				this.querySelector('.window__buttons button').click(); // first button is OK
			} else if (e.key == 'Escape') {
				this.remove();
			}
		}

		if (this.querySelector('.window__input')) {
			this.querySelector('.window__input').focus();
		} else if (this.querySelector('.window__buttons button')) {
			this.querySelector('.window__buttons button').focus();
		}
	}


	connectedCallback() {
		this.classList.add('window', '--can-drag-through');

		// Events
		this.addEventListener('mousedown', this.startDragging);
		this.addEventListener('mouseup', this.stopDragging);
		this.addEventListener('mousemove', this.drag);
		makeDraggable(this);
		this.querySelector('.window__close').onclick = () => { this.remove(); };

		// Position
		this.x = window.innerWidth / 2 - this.clientWidth / 2;
		this.y = window.innerHeight / 2 - this.clientHeight / 2;
		this.style.left = this.x + "px";
		this.style.top = this.y + "px";
	}
}

customElements.define('win-', FloatingWindow);


// Generic Window Definitions

FloatingWindow.inform = function (title, text) {
	let win = new FloatingWindow({
		title: title ?? 'Information',
		body: GetText.localize(text),
		buttons: [{ label: 'Ok', action: ()=>{}, closesWindow: true }],
		resizable: true
	});
	win.popUp();
	return win;
};

FloatingWindow.confirm =
	function (title, text, onAccept, onCancel, yesLabel, noLabel)
{
	let win = new FloatingWindow({
		title: title ?? 'Confirm',
		body: text ? GetText.localize(text) : '',
		buttons: [
			{ label: yesLabel ?? 'Yes', action: onAccept, closesWindow: true },
			{ label: noLabel ?? 'No', action: onCancel, closesWindow: true }
		],
		resizable: true
	});
	win.popUp();
	return win;
};

FloatingWindow.prompt =
	function (title, text, onAccept, onCancel, input, defaultValue, editRule)
{
	let inputDescriptor =
		input ?? {
			type: 'text',
			placeholder: null,
			defaultValue: defaultValue,
			multiline: editRule == 'editable'
		};
	let win = new FloatingWindow({
		title: title ?? 'Input',
		body: text ? GetText.localize(text) : '',
		buttons: [
			{ label: 'Ok', action: onAccept, closesWindow: true },
			{ label: 'Cancel', action: onCancel, closesWindow: true }
		],
		input: inputDescriptor,
		resizable: true
	});
	win.popUp();
	return win;
};


// Specific Window Definitions
FloatingWindow.about = function() {
	GP.apiCall('ide.version', [], ideVersion => {
		GP.apiCall('board.vmVersion',[], vmVersion => {
			let vmVersionReport = '\n';
			if (vmVersion) { vmVersionReport = ` (Firmware v${vmVersion})\n`; }
			let text = `MicroBlocks v${ideVersion} ${vmVersionReport}\n`;
			text += GetText.localize(
				'about;by %1, %2 & %3.',
				'John Maloney',
				'Bernat Romagosa',
				'Jens Mönig'
			);
			text += '\n';
			text += GetText.localize('More info at http://microblocks.fun');
			FloatingWindow.inform('About MicroBlocks', text);
		});
	});
}


// Events

document.addEventListener(
	'window.inform',
	(e) => {
		let descriptor = e.detail.value;
		FloatingWindow.inform(
			descriptor .title,
			descriptor .text
		);
	}
);

document.addEventListener(
	'window.confirm',
	(e) => {
		let descriptor = e.detail.value,
			win = FloatingWindow.confirm(
			descriptor.title,
			descriptor.text,
			() => { GP.apiResponses[descriptor.id] = JSON.stringify(true); },
			() => { GP.apiResponses[descriptor.id] = JSON.stringify(false); },
			descriptor.yesLabel,
			descriptor.noLabel,
		);
	}
);

document.addEventListener(
	'window.prompt',
	(e) => {
		let descriptor = e.detail.value,
			win = FloatingWindow.prompt(
			descriptor.title,
			descriptor.text,
			(value) => { GP.apiResponses[descriptor.id] = JSON.stringify(value); },
			() => { GP.apiResponses[descriptor.id] = JSON.stringify(null); },
			null, // default input
			descriptor.default,
			descriptor.editRule
		);
	}
);
