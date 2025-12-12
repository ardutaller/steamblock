const Categories = {
	descriptors: [
		{
			label: 'cat;Output',
			color: '#4852bf'
		},
		{
			label: 'cat;Input',
			color: '#9f42a5'
		},
		{
			label: 'cat;Pins',
			color: '#548799'
		},
		{
			label: 'cat;Comm',
			color: '#1e997a',
			advanced: true
		},
		{
			label: 'cat;Control',
			color: '#d18c25'
		},
		{
			label: 'cat;Operators',
			color: '#479d1d'
		},
		{
			label: 'cat;Variables',
			color: '#d3732a'
		},
		{
			label: 'cat;Data',
			color: '#c44e6b'
		},
		{
			label: 'cat;My Blocks',
			color: '#1a8cdd'
		}
	]
};

Categories.colorFor = function (categoryName) {
	let descriptor = this.descriptors.find(descriptor => {
		return descriptor.label == 'cat;' + categoryName
	});
	// default "Generic" category color is #1e997a
	return descriptor ? descriptor.color : '#1e997a';
};

Categories.build = function (descriptors, className) {
	let container = document.createElement('div');
	container.classList.add(className);
	descriptors.forEach(descriptor => {
		container.appendChild(this.elementFor(descriptor));
	});
	return container;
};

Categories.buildStandard = function () {
	return this.build(this.descriptors, 'categories');
};

Categories.buildLibraries = function (descriptors) {
	return this.build(
		descriptors.map(descriptor => {
			return {
				label: descriptor.label,
				color: this.colorFor(descriptor.category),
				isLibrary: true
			};
		}),
		'libraries'
	);
};

Categories.elementFor = function (descriptor) {
	let button = document.createElement('a');
	let loc = document.createElement('l-');
	loc.innerText = descriptor.label;
	button.ariaLabel = 'Block Category';
	button.ariaDescription = '[l] to show the blocks in this category';
	button.appendChild(loc);
	if (descriptor.isLibrary) {
		button.onclick = () => {
			GP.apiCall('ide.selectLibrary', [descriptor.label]);
		};
		button.oncontextmenu = (e) => {
			Menus.popUp('library', button, descriptor.label, e);
			e.preventDefault();
		};

	} else {
		button.onclick = () => {
			GP.apiCall('ide.selectCategory', [descriptor.label]);
		};
	}
	button.classList.add('category-button');
	if (IDE.currentCategory == descriptor.label) {
		button.classList.add('selected');
	}
	if (descriptor.advanced && !IDE.userPreference('devMode')) {
		button.classList.add('hidden');
	}
	button.style.backgroundColor = descriptor.color;
	return button;
};

document.addEventListener(
	'currentCategory',
	(e) => {
		document.querySelectorAll('.category-button').forEach(element => {
				if (element.innerText == GetText.localize(e.detail.value)) {
					element.classList.add('selected');
				} else {
					element.classList.remove('selected');
				}
			}
		);
	}
);

document.addEventListener(
	'libraryList',
	(e) => {
		if (IDE.libraryList?.length > 0) {
			IDE.populateLibraries(document.querySelector('.libraries'));
		} else {
			document.querySelector('.libraries').innerHTML = '';
		}
	}
);
