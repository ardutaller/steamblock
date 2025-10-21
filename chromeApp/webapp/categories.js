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
				color: this.colorFor(descriptor.category)
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
	button.onclick = () => {
		GP.apiCall('ide.selectCategory', [descriptor.label]);
	};
	button.classList.add('category-button');
	if (IDE.currentCategory == descriptor.label) {
		button.classList.add('selected');
	}
	if (descriptor.advanced && !IDE.userPreference('devMode')) {
		button.classList.add('hidden');
	}
	button.style.backgroundColor = descriptor.color;
	descriptor.element = button; // remember so we can select / unselect it later
	return button;
};

document.addEventListener(
	'ide.currentCategory',
	(e) => {
		Categories.descriptors.forEach(descriptor => {
			if (descriptor.element) {
				if (descriptor.label == e.detail.value) {
					descriptor.element.classList.add('selected');
				} else {
					descriptor.element.classList.remove('selected');
				}
			}
		});
	}
);

document.addEventListener(
	'libraryList',
	(e) => {
		if (IDE.libraryList?.length > 0) {
			IDE.populateLibraries(document.querySelector('.libraries')); }
	}
);
