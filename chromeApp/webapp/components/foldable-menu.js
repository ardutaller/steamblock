class FoldableMenu extends HTMLElement {
	static get observedAttributes() { return ['json']; }

	constructor() {
		super();

		// create a shadow root that contains all subelements
		const shadow = this.attachShadow({ mode: 'open' });
		// create a container subelement to hold the menu items
		const container = document.createElement('nav');
		container.setAttribute('class', 'container');

		const style = document.createElement('style');
		style.textContent = `
		.container {
			position: absolute;
			display: block;
		}
	`;

		shadow.appendChild(style);
		shadow.appendChild(container);
	}
	// add a "collapsed" state
	get collapsed() {
		return this.hasAttribute('hidden');
	}

	set collapsed(flag) {
		if (flag) {
			this.setAttribute('hidden', true);
		} else {
			this.removeAttribute('hidden');
		}
	}

	connectedCallback() {
		// call the selector and generate the menu items accordingly
		const container = this.shadowRoot.querySelector('.container');
		fetch('json/' + this.getAttribute('json') + '.json')
			.then(result => result.json())
			.then(items => {
				items.forEach((item) => {
					if (item == '-') {
						container.appendChild(document.createElement('hr'));
					} else {
						// TODO: add icons. Their filename selector is at item.icon
						let li = document.createElement('li');
						let l = document.createElement('l-'); // localizable
						l.innerText = item.label;
						li.setAttribute('onclick', item.onclick);
						li.appendChild(l);
						container.appendChild(li);
					}
				});
			});
	}
}

customElements.define('foldable-menu', FoldableMenu);
