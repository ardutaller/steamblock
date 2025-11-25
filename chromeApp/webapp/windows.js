class FloatingWindow extends HTMLElement {
	constructor(title, contents) {
		super();
		this.x = 0;
		this.y = 0;
		if (typeof title == 'string') {
			let h1 = document.createElement('h1');
			h1.innerText = title;
			this.append(h1);
		}
		if (contents) {
			let div = document.createElement('div');
			if (typeof contents == 'string') {
				div.innerText = contents;
			} else if (typeof contents == 'object') { // assume DOM element
				div.append(contents);
			}
			this.append(div);
		}
	}

	connectedCallback() {
		this.addEventListener('mousedown', this.startDragging);
		this.addEventListener('mouseup', this.stopDragging);
		this.addEventListener('mousemove', this.drag);
		makeDraggable(this);

		this.classList.add('window');

		let title = this.querySelector('h1');
		title.classList.add('win-title');
		let cross = document.createElement('button');
		cross.classList.add('win-close');
		cross.innerText = 'X';
		cross.onclick = () => { this.remove(); };
		title.appendChild(cross);
		let body = this.querySelector('div');
		body.classList.add('win-body');
		body.setAttribute('data-undraggable', true);

		this.x = window.innerWidth / 2 - this.clientWidth / 2;
		this.y = window.innerHeight / 2 - this.clientHeight / 2;

		this.style.left = this.x + "px";
		this.style.top = this.y + "px";
	}
}

customElements.define('win-', FloatingWindow);

// Create a basic window with:
// document.body.append(new FloatingWindow('My Window', 'The contents of the window'));
