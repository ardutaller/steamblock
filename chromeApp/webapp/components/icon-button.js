class IconButton extends HTMLElement {
	static get observedAttributes() { return ['size']; }

	constructor() {
		super();

		// create a shadow root that contains all subelements
		const shadow = this.attachShadow({ mode: 'open' });
		// create a wrapper subelement, just for positioning
		const wrapper = document.createElement('span');
		wrapper.setAttribute('class', 'wrapper');

		// create an icon subelement
		const icon = document.createElement('span');
		icon.setAttribute('class', 'icon');
		icon.setAttribute('tabindex', 0);

		const style = document.createElement('style');
		shadow.appendChild(style);
		shadow.appendChild(wrapper);
		wrapper.appendChild(icon);
	}

	connectedCallback() {
		const img = document.createElement('img');
		// take the contents of the src attribute and use it to source the image
		if (this.hasAttribute('src')) {
			img.src = 'icons/' + this.getAttribute('src');
		} else {
			img.src = 'icons/no-icon.svg';
		}
		this.shadowRoot.querySelector('.icon').appendChild(img);
		updateStyle(this);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		updateStyle(this);
	}
}

customElements.define('icon-button', IconButton);

function updateStyle(elem) {
	elem.shadowRoot.querySelector('style').textContent = `
		.wrapper {
			position: relative;
			display: inline-block;
			width: ${elem.getAttribute('size')}px;
			height: ${elem.getAttribute('size')}px;
		}
		img {
			width: 100%;
			height: 100%;
		}
	`;
};

