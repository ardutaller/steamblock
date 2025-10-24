/*

		blocks.js

		a programming construction kit
		based on morphic.js
		inspired by Scratch

		written by Jens Mönig
		jens@moenig.org

		Copyright (C) 2025 by Jens Mönig

		This file is part of Snap!.

		Snap! is free software: you can redistribute it and/or modify
		it under the terms of the GNU Affero General Public License as
		published by the Free Software Foundation, either version 3 of
		the License, or (at your option) any later version.

		This program is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
		GNU Affero General Public License for more details.

		You should have received a copy of the GNU Affero General Public License
		along with this program. If not, see <http://www.gnu.org/licenses/>.


		prerequisites:
		--------------
		needs morphic.js, symbols.js and widgets.js


		hierarchy
		---------
		the following tree lists all constructors hierarchically,
		indentation indicating inheritance. Refer to this list to get a
		contextual overview:

				Morph*
						ArrowMorph
						BlockHighlightMorph
						ScriptsMorph
						SyntaxElementMorph
								ArgMorph
										ArgLabelMorph
										BooleanSlotMorph
										ColorSlotMorph
										CommandSlotMorph
												CSlotMorph
										InputSlotMorph
												TextSlotMorph
										MultiArgMorph
										TemplateSlotMorph
								BlockMorph
										CommandBlockMorph
												HatBlockMorph
										ReporterBlockMorph
				BoxMorph*
						ScriptFocusMorph
				StringMorph*
						BlockLabelMorph
						InputSlotStringMorph
						InputSlotTextMorph

 * from morphic.js


		toc
		---
		the following list shows the order in which all constructors are
		defined. Use this list to locate code in this document:

				SyntaxElementMorph
				BlockLabelMorph
				BlockMorph
				CommandBlockMorph
				HatBlockMorph
				ReporterBlockMorph
				ScriptsMorph
				ArgMorph
				CommandSlotMorph
				CSlotMorph
				InputSlotMorph
				InputSlotStringMorph
				InputSlotTextMorph
				BooleanSlotMorph
				ArrowMorph
				TextSlotMorph
				ColorSlotMorph
				TemplateSlotMorph
				BlockHighlightMorph
				MultiArgMorph
				ArgLabelMorph


		structure of syntax elements
		----------------------------
		the structure of syntax elements is identical with their morphic
		tree. There are, however, accessor methods to get (only) the
		parts which are relevant for evaluation wherever appropriate.

		In Scratch/BYOB every sprite and the stage has its own "blocks bin",
		an instance of ScriptsMorph (we're going to name it differently in
		Snap, probably just "scripts").

		At the top most level blocks are assembled into stacks in ScriptsMorph
		instances. A ScriptsMorph contains nothing but blocks, therefore
		every child of a ScriptsMorph is expected to be a block.

		Each block contains:

				selector	- indicating the name of the function it triggers,

		Its arguments are first evaluated and then passed along as the
		selector is called. Arguments can be either instances of ArgMorph
		or ReporterBlockMorph. The getter method for a block's arguments is

				inputs()	- gets an array of arg morphs and/or reporter blocks

		in addition to inputs, command blocks also know their

				nextBlock()	- gets the block attached to the receiver's bottom

		and the block they're attached to - if any: Their parent.

		please also refer to the high-level comment at the beginning of each
		constructor for further details.
		*/

/*global Array, BoxMorph,
Color, ColorPaletteMorph, FrameMorph, Function, HandleMorph, Math, MenuMorph,
Morph, MorphicPreferences, Object, ScrollFrameMorph, ShadowMorph, ZERO, Sound,
String, StringMorph, TextMorph, contains, degrees, detect, PianoMenuMorph, nop,
document, getDocumentPositionOf, isNaN, isString, newCanvas, parseFloat, isNil,
radians, useBlurredShadows, SpeechBubbleMorph, modules, StageMorph,
fontHeight, TableFrameMorph, SpriteMorph, Context, ListWatcherMorph, Rectangle,
DialogBoxMorph, BlockInputFragmentMorph, PrototypeHatBlockMorph, WHITE, display,
Costume, IDE_Morph, BlockDialogMorph, BlockEditorMorph, localize, CLEAR, Point,
isSnapObject, PushButtonMorph, SpriteIconMorph, Process, AlignmentMorph, List,
ToggleButtonMorph, DialMorph, SnapExtensions, CostumeIconMorph, SoundIconMorph,
SVG_Costume, embedMetadataPNG, ThreadManager, snapEquals, InputList, BLACK,
CustomHatBlockMorph*/

/*jshint esversion: 11*/

// Global stuff ////////////////////////////////////////////////////////

modules.blocks = '2025-Oct-12';

var SyntaxElementMorph;
var BlockMorph;
var BlockLabelMorph;
var CommandBlockMorph;
var ReporterBlockMorph;
var ScriptsMorph;
var ArgMorph;
var CommandSlotMorph;
var CSlotMorph;
var InputSlotMorph;
var InputSlotStringMorph;
var InputSlotTextMorph;
var BooleanSlotMorph;
var ArrowMorph;
var ColorSlotMorph;
var HatBlockMorph;
var BlockHighlightMorph;
var MultiArgMorph;
var TemplateSlotMorph;
var ArgLabelMorph;
var TextSlotMorph;
var ScriptFocusMorph;

// SyntaxElementMorph //////////////////////////////////////////////////

// I am the ancestor of all blocks and input slots

// SyntaxElementMorph inherits from Morph:

SyntaxElementMorph.prototype = new Morph();
SyntaxElementMorph.prototype.constructor = SyntaxElementMorph;
SyntaxElementMorph.uber = Morph.prototype;

// SyntaxElementMorph preferences settings:

/*
		the following settings govern the appearance of all syntax elements
		(blocks and slots) where applicable:

		outline:

				corner		- radius of command block rounding
				rounding	- radius of reporter block rounding
				edge		- width of 3D-ish shading box
				hatHeight	- additional top space for hat blocks
				hatWidth	- minimum width for hat blocks
				rfBorder	- pixel width of reification border (grey outline)
				minWidth	- minimum width for any syntax element's contents

		jigsaw shape:

				inset		- distance from indentation to left edge
				dent		- width of indentation bottom

		paddings:

				bottomPadding	- adds to the width of the bottom most c-slot
				cSlotPadding	- adds to the width of the open "C" in c-slots
				typeInPadding	- adds pixels between text and edge in input slots
				labelPadding	- adds left/right pixels to block labels

		label:

				labelFontName		- <string> specific font family name
				labelFontStyle		- <string> generic font family name, cascaded
				fontSize			- duh
				embossing			- <Point> offset for embossing effect
				labelWidth			- column width, used for word wrapping
				labelWordWrap		- <bool> if true labels can break after each word
				dynamicInputLabels	- <bool> if true inputs can have dynamic labels

		snapping:

				feedbackMinHeight	- height of white line for command block snaps
				minSnapDistance		- threshold when commands start snapping
				reporterDropFeedbackPadding	 - increases reporter drop feedback

		color gradients:

				contrast		- <percent int> 3D-ish shading gradient contrast
				labelContrast	- <percent int> 3D-ish label shading contrast
				activeHighlight - <Color> for stack highlighting when active
				errorHighlight	- <Color> for error highlighting
				activeBlur		- <pixels int> shadow for blurred activeHighlight
				activeBorder	- <pixels int> unblurred activeHighlight
				rfColor			- <Color> for reified outlines and slot backgrounds
				*/

SyntaxElementMorph.prototype.contrast = 20;

SyntaxElementMorph.prototype.setScale = function (num) {
	var scale = Math.min(Math.max(num, 1), 25);
	this.scale = scale;
	this.corner = 3 * scale;
	this.rounding = 9 * scale;
	this.edge = scale;
	this.flatEdge = scale * 0.5;
	this.jag = 5 * scale;
	this.inset = 6 * scale;
	this.hatHeight = 12 * scale;
	this.hatWidth = 70 * scale;
	this.rfBorder = 3 * scale;
	this.minWidth = 0;
	this.dent = 8 * scale;
	this.bottomPadding = 3 * scale;
	this.cSlotPadding = 4 * scale;
	this.typeInPadding = scale;
	this.labelPadding = 4 * scale;
	this.labelFontName = 'Verdana';
	this.labelFontStyle = 'sans-serif';
	this.fontSize = 10 * scale;
	this.embossing = new Point(
		-1 * Math.max(scale / 2, 1),
		-1 * Math.max(scale / 2, 1)
	);
	this.labelWidth = 450 * scale;
	this.labelWordWrap = true;
	this.dynamicInputLabels = true;
	this.feedbackMinHeight = 5;
	this.minSnapDistance = 20;
	this.reporterDropFeedbackPadding = 10 * scale;
	this.labelContrast = 25;
	this.activeHighlight = new Color(153, 255, 213);
	this.errorHighlight = new Color(173, 15, 0);
	this.activeBlur = 20;
	this.activeBorder = 4;
	this.rfColor = new Color(120, 120, 120);
};

SyntaxElementMorph.prototype.setScale(1.5);
SyntaxElementMorph.prototype.isCachingInputs = false;
SyntaxElementMorph.prototype.alpha = 1;

// SyntaxElementMorph label part specs:

SyntaxElementMorph.prototype.labelParts = {
	/*
				Input slots

				type: 'input'
				tags: 'numeric numstring alphanum read-only unevaluated landscape
							 static'
				menu: dictionary or selector
				react: selector
				value: string, number or Array for localized strings / constants
				*/
	'%s': {
		type: 'input'
	},
	'%n': {
		type: 'input',
		tags: 'numeric'
	},
	'%ns': {
		type: 'input',
		tags: 'numstring'
	},
	'%txt': {
		type: 'input',
		tags: 'landscape'
	},
	'%ida': {
		type: 'input',
		tags: 'alphanum',
		menu: {
			'1' : 1,
			last : ['last'],
			'~' : null,
			all : ['all'],
			parent : ['parent']
		}
	},
	'%idx': {
		type: 'input',
		tags: 'alphanum',
		menu: {
			'1' : 1,
			last : ['last'],
			random : ['random'],
			'~' : null,
			parent : ['parent']
		}
	},
	'%ix': {
		type: 'input',
		tags: 'numeric',
		menu: {
			'1' : 1,
			last : ['last'],
			random : ['random']
		}
	},
	'%var': {
		type: 'input',
		tags: 'read-only static', // if "static" is removed, enable auto-ringify
		menu: 'getVarNamesDict'
	},
	/*
				type: 'text entry'
				tags: 'monospace'
				*/
	'%mlt': {
		type: 'text entry',
	},
	'%b': {
		type: 'boolean'
	},
	'%c': {
		type: 'c',
		tags: 'static'
	},
	'%cs': {
		type: 'c',
		tags: 'lambda'
	},
	'%t': {
		type: 'template',
		label: '\xa0' // non-breaking space, appears blank
	},
	'%upvar': {
		type: 'template',
		label: '\xa0' // non-breaking space, appears blank
	},

	// other single types
	'%clr': {
		type: 'color'
	},
	'%br': {
		type: 'break'
	},
	'%inputName': {
		type: 'variable',
	},
	'%elseif': {
		type: 'multi',
		group: 'else if %b %cs',
		dflt: [true, null],
		tags: 'static widget'
	}
};

// SyntaxElementMorph instance creation:

function SyntaxElementMorph() {
	this.init();
}

SyntaxElementMorph.prototype.init = function () {
	this.cachedClr = null;
	this.cachedClrBright = null;
	this.cachedClrDark = null;
	this.cachedNormalColor = null; // for single-stepping
	this.isStatic = false; // if true, I cannot be exchanged

	SyntaxElementMorph.uber.init.call(this);

	this.defaults = [];
	this.cachedInputs = null;
	delete this.alpha;
};

// SyntaxElementMorph accessing:

SyntaxElementMorph.prototype.parts = function () {
	// answer my non-crontrol submorphs
	var nb = null;
	if (this.nextBlock) { // if I am a CommandBlock or a HatBlock
		nb = this.nextBlock();
	}
	return this.children.filter(child =>
		(child !== nb) &&
		!(child instanceof ShadowMorph) &&
		!(child instanceof BlockHighlightMorph)
	);
};

SyntaxElementMorph.prototype.inputs = function () {
	// answer my arguments and nested reporters
	if (isNil(this.cachedInputs) || !this.isCachingInputs) {
		this.cachedInputs = this.parts().filter(part =>
			part instanceof SyntaxElementMorph
		);
	}
	// this.debugCachedInputs();
	return this.cachedInputs;
};

SyntaxElementMorph.prototype.debugCachedInputs = function () {
	// private - only used for manually debugging inputs caching
	var realInputs, i;
	if (!isNil(this.cachedInputs)) {
		realInputs = this.parts().filter(part =>
			part instanceof SyntaxElementMorph
		);
	}
	if (this.cachedInputs.length !== realInputs.length) {
		throw new Error('cached inputs size do not match: ' +
			this.constructor.name);
	}
	for (i = 0; i < realInputs.length; i += 1) {
		if (this.cachedInputs[i] !== realInputs[i]) {
			throw new Error('cached input does not match: ' +
				this.constructor.name +
				' #' +
				i +
				' ' +
				this.cachedInputs[i].constructor.name +
				' != ' +
				realInputs[i].constructor.name);
		}
	}
};

SyntaxElementMorph.prototype.allInputs = function () {
	// answer arguments and nested reporters of all children
	return this.allChildren().slice(0).reverse().filter(child =>
		(child instanceof ArgMorph) ||
		(child instanceof ReporterBlockMorph &&
			child !== this)
	);
};

SyntaxElementMorph.prototype.allEmptySlots = function () {
	// answer empty input slots of all children excluding myself,
	// but omit those in nested rings (lambdas) and JS-Function primitives.
	// Used by the evaluator when binding implicit formal parameters
	// to empty input slots
	var empty = [];
	if (
		// disregard custom C-slots, because they should be treated as
		// rings. Commented out for now...
		// !(this instanceof CSlotMorph && !this.isStatic) &&
		(this.selector !== 'reportJSFunction')) {
		this.children.forEach(morph => {
			if (morph.isEmptySlot && morph.isEmptySlot()) {
				empty.push(morph);
			} else if (morph.allEmptySlots) {
				empty = empty.concat(morph.allEmptySlots());
			}
		});
	}
	return empty;
};

SyntaxElementMorph.prototype.tagExitBlocks = function (stopTag, isCommand) {
	// tag 'report' and 'stop this block' blocks of all children including
	// myself, with either a stopTag (for "stop" blocks) or an indicator of
	// being inside a command block definition, but omit those in nested
	// rings (lambdas. Used by the evaluator when entering a procedure
	if (this.selector === 'doReport') {
		this.partOfCustomCommand = isCommand;
	} else if (this.selector === 'doStopThis') {
		this.exitTag = stopTag;
	} else {
		this.children.forEach(morph => {
			if (morph.tagExitBlocks) {
				morph.tagExitBlocks(stopTag, isCommand);
			}
		});
	}
};

SyntaxElementMorph.prototype.replaceInput = function (oldArg, newArg) {
	var scripts = this.parentThatIsA(ScriptsMorph),
		replacement = newArg,
		idx = this.children.indexOf(oldArg),
		i = 0;

	// try to find the ArgLabel embedding the newArg,
	// used for the undrop() feature
	if (idx === -1 && newArg instanceof MultiArgMorph) {
		this.children.forEach(morph => {
			if (morph instanceof ArgLabelMorph &&
				morph.argMorph() === oldArg
			) {
				idx = i;
			}
			i += 1;
		});
	}

	if (oldArg.cachedSlotSpec) {oldArg.cachedSlotSpec = null; }
	if (newArg.cachedSlotSpec) {newArg.cachedSlotSpec = null; }

	this.changed();
	if (newArg.parent) {
		newArg.parent.removeChild(newArg);
	}
	if (oldArg instanceof MultiArgMorph) {
		oldArg.inputs().forEach(inp => // preserve nested reporters
			oldArg.replaceInput(inp, new InputSlotMorph())
		);
		if ((this.dynamicInputLabels || oldArg.collapse) &&
			newArg instanceof ReporterBlockMorph) {
			replacement = new ArgLabelMorph(newArg, oldArg.collapse);
		}
	}
	replacement.parent = this;
	this.children[idx] = replacement;
	if (replacement instanceof MultiArgMorph
		|| replacement instanceof ArgLabelMorph
		|| replacement.constructor === CommandSlotMorph) {
		replacement.fixLayout();
		if (this.fixLabelColor) { // special case for variadic continuations
			this.fixLabelColor();
		}
	} else {
		this.fixLayout();
	}
	this.cachedInputs = null;
};

SyntaxElementMorph.prototype.revertToDefaultInput = function (arg, noValues) {
	var deflt = this.revertToEmptyInput(arg),
		inp = this.inputs().indexOf(deflt),
		def;
	if (noValues || inp < 0) {
		return deflt;
	}
	if (this instanceof BlockMorph) {
		if (this.isCustomBlock) {
			def = this.isGlobal ? this.definition
				: this.scriptTarget().getMethod(this.blockSpec);
			if (!noValues &&
				(deflt instanceof InputSlotMorph ||
					deflt instanceof BooleanSlotMorph)
			) {
				deflt.setContents(
					def.defaultValueOfInputIdx(inp)
				);
			}
		}
	}
	if (deflt instanceof MultiArgMorph && !inp) {
		// first - and only - input is variadic
		deflt.setContents(this.defaults);
		deflt.defaults = this.defaults;
	} else if (!isNil(this.defaults[inp])) {
		deflt.setContents(this.defaults[inp]);
		if (deflt instanceof MultiArgMorph) {
			deflt.defaults = this.defaults[inp];
		}
	}
	return deflt;
};

SyntaxElementMorph.prototype.revertToEmptyInput = function (arg) {
	var idx = this.parts().indexOf(arg),
		inp = this.inputs().indexOf(arg),
		deflt = new InputSlotMorph(),
		rcvr, def;

	if (idx !== -1) {
		if (this instanceof BlockMorph) {
			deflt = this.labelPart(this.parseSpec(this.blockSpec)[idx]);
			if (this.isCustomBlock) {
				if (this.isGlobal) {
					def = this.definition;
				} else {
					rcvr = this.scriptTarget(true);
					if (rcvr) {
						def = rcvr.getMethod(this.blockSpec);
					}
				}
				if (def) {
					if (deflt instanceof ArgMorph &&
						!(deflt instanceof TemplateSlotMorph)) {
						deflt.isStatic = def.isIrreplaceableInputIdx(inp);
						deflt.canBeEmpty = !deflt.isStatic;
					}
					if (deflt instanceof InputSlotMorph) {
						deflt.setChoices.apply(
							deflt,
							def.inputOptionsOfIdx(inp)
						);
					} else if (deflt instanceof MultiArgMorph) {
						deflt.setInfix(def.separatorOfInputIdx(inp));
						deflt.setCollapse(def.collapseOfInputIdx(inp));
						deflt.setExpand(def.expandOfInputIdx(inp));
						deflt.setDefaultValue(def.defaultValueOfInputIdx(inp));
						deflt.setInitialSlots(def.initialSlotsOfInputIdx(inp));
						deflt.setMinSlots(def.minSlotsOfInputIdx(inp));
						deflt.setMaxSlots(def.maxSlotsOfInputIdx(inp));
					}
				}
			}
		} else if (this instanceof MultiArgMorph) {
			deflt = this.labelPart(this.slotSpecFor(inp));
		}
	}
	if (deflt.icon || deflt instanceof BooleanSlotMorph) {
		deflt.fixLayout();
	}
	this.replaceInput(arg, deflt);
	if (deflt instanceof MultiArgMorph) {
		if (deflt.initialSlots) {
			deflt.collapseAll();
			deflt.expandTo(deflt.initialSlots);
		}
		deflt.refresh();
	}
	this.cachedInputs = null;
	return deflt;
};

SyntaxElementMorph.prototype.isLocked = function () {
	// answer true if I can be exchanged by a dropped reporter
	return this.isStatic;
};

// SyntaxElementMorph enumerating:

SyntaxElementMorph.prototype.topBlock = function () {
	if (this.parent && this.parent.topBlock) {
		return this.parent.topBlock();
	}
	return this;
};

// SyntaxElementMorph reachable variables

SyntaxElementMorph.prototype.getVarNamesDict = function () {
	var block = this.parentThatIsA(BlockMorph),
		rcvr,
		tempVars = [],
		dict;

	if (!block) {
		return {};
	}
	rcvr = block.scriptTarget();
	block.allParents().forEach(morph => {
		var proto;
		if (morph instanceof BlockEditorMorph) {
			proto = morph.body.contents.children.find(child =>
				child instanceof PrototypeHatBlockMorph);
			if (proto) {
				morph = proto;
			}
		}
		if (morph instanceof PrototypeHatBlockMorph) {
			tempVars.push.apply(
				tempVars,
				morph.variableNames()
			);
			tempVars.push.apply(
				tempVars,
				morph.inputs()[0].inputFragmentNames()
			);
		} else if (morph instanceof BlockMorph) {
			morph.inputs().forEach(child => {
				if (child instanceof TemplateSlotMorph) {
					tempVars.push(child.contents());
				} else if (child instanceof MultiArgMorph) {
					child.children.forEach(m => {
						if (m instanceof TemplateSlotMorph) {
							tempVars.push(m.contents());
						}
					});
				}
			});
		}
	});
	if (rcvr) {
		dict = rcvr.variables.allNamesDict();
		tempVars.forEach(name =>
			dict[name] = name
		);
		if (block.selector === 'doSetVar') {
			// add settable object attributes
			dict['~'] = null;
			dict.my = [{// wrap the submenu into a 1-item array to translate it
				'anchor' : ['my anchor'],
				'parent' : ['my parent'],
				'name' : ['my name'],
				'temporary?' : ['my temporary?'],
				'dangling?' : ['my dangling?'],
				'draggable?' : ['my draggable?'],
				'rotation style' : ['my rotation style'],
				'rotation x' : ['my rotation x'],
				'rotation y' : ['my rotation y']
			}];
			if (this.world().currentKey === 16) { // shift
				dict.my[0]['~'] = null; // don't forget we're inside an array...
				dict.my[0]['microphone modifier'] = ['microphone modifier'];
			}
		}
		return dict;
	}
	return {};
};

// SyntaxElementMorph drag & drop:

SyntaxElementMorph.prototype.reactToGrabOf = function (grabbedMorph) {
	var topBlock = this.topBlock(),
		affected;
	if (grabbedMorph instanceof CommandBlockMorph) {
		affected = this.parentThatIsA(CommandSlotMorph);
		if (affected) {
			affected.fixLayout();
		}
	}
	if (topBlock) {
		topBlock.allComments().forEach(comment =>
			comment.align(topBlock)
		);
		if (topBlock.getHighlight()) {
			topBlock.addHighlight(topBlock.removeHighlight());
		}
	}
};

// SyntaxElementMorph 3D - border color rendering:

SyntaxElementMorph.prototype.bright = function () {
	return this.color.lighter(this.contrast).toString();
};

SyntaxElementMorph.prototype.dark = function () {
	return this.color.darker(this.contrast).toString();
};

// SyntaxElementMorph color changing:

SyntaxElementMorph.prototype.setColor = function (aColor) {
	var block;
	if (aColor) {
		if (!this.color.eq(aColor)) {
			block = this.parentThatIsA(BlockMorph);
			this.color = aColor;
			this.children.forEach(morph => {
				if (block && morph instanceof StringMorph) {
					morph.shadowColor = block.color.darker(
						block.labelContrast
					);
					morph.rerender();
				} else if (morph instanceof CommandSlotMorph) {
					morph.setColor(aColor);
				}
			});
			if (block) {block.fixLabelColor(); }
			this.rerender();
		}
	}
};

SyntaxElementMorph.prototype.setLabelColor = function (
	textColor,
	shadowColor,
	shadowOffset
) {
	this.children.forEach(morph => {
		if (morph instanceof StringMorph && !morph.isProtectedLabel) {
			morph.shadowOffset = shadowOffset || morph.shadowOffset;
			morph.shadowColor = shadowColor || morph.shadowColor;
			morph.setColor(textColor);
		} else if (morph instanceof MultiArgMorph
			|| morph instanceof ArgLabelMorph
			|| (morph instanceof InputSlotMorph
				&& morph.isReadOnly)) {
			morph.setLabelColor(textColor, shadowColor, shadowOffset);
		}
	});
};

SyntaxElementMorph.prototype.flash = function (aColor) {
	if (!this.cachedNormalColor) {
		this.cachedNormalColor = this.color;
		this.setColor(aColor || this.activeHighlight);
	}
};

SyntaxElementMorph.prototype.unflash = function () {
	if (this.cachedNormalColor) {
		var clr = this.cachedNormalColor;
		this.cachedNormalColor = null;
		this.setColor(clr);
	}
};

SyntaxElementMorph.prototype.doWithAlpha = function (alpha, callback) {
	var current = SyntaxElementMorph.prototype.alpha,
		result;
	SyntaxElementMorph.prototype.alpha = alpha;
	result = callback();
	SyntaxElementMorph.prototype.alpha = current;
	return result;
};

// SyntaxElementMorph zebra coloring

SyntaxElementMorph.prototype.fixBlockColor = function (
	nearestBlock,
	isForced
) {
	this.children.forEach(morph => {
		if (morph instanceof SyntaxElementMorph) {
			morph.fixBlockColor(nearestBlock, isForced);
		}
	});
};

// SyntaxElementMorph label parts:

SyntaxElementMorph.prototype.labelPart = function (spec) {
	var info = this.labelParts[spec],
		part, tokens, cnts, i;
	if (((info && Object.hasOwn(info, 'type')) ||
		(spec[0] === '%' && spec.length > 1)) &&
		(this.selector !== 'v' ||
			(['$turtleOutline', '$pipette'].includes(spec) &&
				this.isObjInputFragment()
			)
		)
	) {
		// check for variable multi-arg-slot:
		if ((spec.length > 5) && (spec.slice(0, 5) === '%mult')) {
			part = new MultiArgMorph(spec.slice(5));
			part.initialSlots = 1;
			part.addInput();
			return part;
		}
		// check for input group multi-arg-slot:
		if ((spec.length > 6) && (spec.slice(0, 6) === '%group')) {
			tokens = spec.slice(7).split('%').map(each => '%' + each);
			part = new MultiArgMorph(tokens);
			part.groupInputs = tokens.length;
			return part;
		}

		// single-arg and specialized multi-arg slots:

		// look up the spec
		if (!info || !Object.hasOwn(info, 'type')) {
			throw new Error('label part spec not found: "' + spec + '"');
		}

		// create the morph
		switch (info.type) {
			case 'input':
				part = new InputSlotMorph(null, null, info.menu);
				part.onSetContents = info.react || null;
				break;
			case 'text entry':
				part = new TextSlotMorph();
				break;
			case 'slot':
				part = new ArgMorph(info.kind);
				break;
			case 'boolean':
				part = new BooleanSlotMorph();
				break;
			case 'c':
				part = new CSlotMorph();
				break;
			case 'command slot':
				part = new CommandSlotMorph();
				break;
			case 'template':
				part = new TemplateSlotMorph(info.label);
				break;
			case 'color':
				part = new ColorSlotMorph();
				break;
			case 'break':
				part = new Morph();
				part.setExtent(ZERO);
				part.isBlockLabelBreak = true;
				part.getSpec = () => '%br';
				break;
			case 'variable':
				part = new TemplateSlotMorph(info.label);
				part = new ReporterBlockMorph();
				part.category = 'variables';
				part.color = SpriteMorph.prototype.blockColor.variables;
				part.setSpec(localize('Input name'));
				break;
			case 'multi':
				part = new MultiArgMorph(
					info.slots,
					info.label,
					info.min || 0,
					spec,
					null, null, null, null, null,
					info.infix,
					info.collapse,
					info.dflt,
					info.group
				);
				part.maxInputs = info.max;
				part.initialSlots = Math.max( // this needs some fixing
					part.initialSlots,
					isNil(info.min) ? 0 : +info.min,
					isNil(info.defaults) ? 0 : +info.defaults
				);
				for (i = 0; i < info.defaults || 0; i += 1) {
					part.addInput();
				}
				break;
			default:
				throw new Error('unknown label part type: "' + info.type + '"');
		}

		// apply the tags
		// ---------------
		// input: numeric, numstring, alphanum, read-only, unevaluated, landscape, static
		// text entry: monospace
		// boolean: unevaluated, static
		// symbol: static, fading, protected
		// c: loop, static, lambda
		// command slot: (none)
		// ring: static
		// ring slot: static
		// template: (none)
		// color: static
		// break: (none)
		// variable: (none)
		// multi: widget

		if (info.tags) {
			info.tags.split(' ').forEach(tag => {
				if (tag) {
					switch (tag) {
						case 'numeric':
							part.isNumeric = true;
							part.setContents(0);
							break;
						case 'alphanum':
							part.isNumeric = true;
							part.isAlphanumeric = true;
							break;
						case 'numstring':
							part.isNumeric = true;
							part.evaluateAsString = true;
							break;
						case 'read-only':
							part.isReadOnly = true;
							break;
						case 'unevaluated':
							part.isUnevaluated = true;
							break;
						case 'static':
							part.isStatic = true;
							break;
						case 'landscape':
							part.minWidth = part.height() * 1.7;
							break;
						case 'monospace':
							part.contents().fontName = 'monospace';
							part.contents().fontStyle = 'monospace';
							break;
						case 'fading':
							part.isFading = true;
							break;
						case 'protected':
							part.isProtectedLabel = true;
							break;
						case 'lambda':
							part.isLambda = true;
							break;
						case 'widget':
							part.canBeEmpty = false;
							break;
						default:
							throw new Error(
								'unknown label part tag: "' + tag + '"'
							);
					}
				}
			});
			part.fixLayout();
		}

		// apply the default value
		// -----------------------
		// only for input slots and Boolean inputs,
		// and only for rare exceptions where we cannot
		// specify the default values in the block specs,
		// e.g. for expandable "reeiver" slots in "broadcast"

		if (!isNil(info.value)) {
			part.setContents(info.value);
		}

	} else {
		part = new BlockLabelMorph(
			spec, // text
			this.fontSize, // fontSize
			this.labelFontStyle, // fontStyle
			true, // bold
			false, // italic
			false, // isNumeric
			ZERO, // shadowOffset
			this.color.darker(this.labelContrast), // shadowColor
			WHITE, // color
			this.labelFontName // fontName
		);

	}
	return part;
};

SyntaxElementMorph.prototype.isObjInputFragment = function () {
	// private - for displaying a symbol in a variable block template
	return (this.selector === 'v') &&
		(this.getSlotSpec() === '%t') &&
		(['%obj', '%clr'].includes(this.parent.fragment.type));
};

// SyntaxElementMorph layout:

SyntaxElementMorph.prototype.fixLayout = function () {
	var nb,
		parts = this.parts(),
		pos = this.position(),
		x = 0,
		y,
		lineHeight = 0,
		maxX = 0,
		blockWidth = this.minWidth,
		blockHeight,
		l = [],
		lines = [],
		space = this.isPrototype ?
		1 : Math.floor(fontHeight(this.fontSize) / 3),
		bottomCorrection,
		rightCorrection = 0,
		rightMost;

	if ((this instanceof MultiArgMorph) && (this.slotSpec !== '%cs')) {
		blockWidth += this.arrows().width();
	} else if (this instanceof ReporterBlockMorph) {
		blockWidth += (this.rounding * 2) + (this.edge * 2);
	} else {
		blockWidth += (this.corner * 4)
			+ (this.edge * 2)
			+ (this.inset * 3)
			+ this.dent;
	}

	if (this.nextBlock) {
		nb = this.nextBlock();
	}

	// determine lines
	parts.forEach(part => {
		if ((part instanceof CSlotMorph) ||
			(part instanceof MultiArgMorph && part.slotSpec.includes('%cs'))
		) {
			if (l.length > 0) {
				lines.push(l);
				lines.push([part]);
				l = [];
				x = 0;
			} else {
				lines.push([part]);
			}
		} else {
			if (part.isVisible) {
				x += part.fullBounds().width() + space;
			}
			if ((x > this.labelWidth) || part.isBlockLabelBreak) {
				if (l.length > 0) {
					lines.push(l);
					l = [];
					x = part.fullBounds().width() + space;
				}
			}
			l.push(part);
			if (part.isBlockLabelBreak) {
				x = 0;
			}
		}
	});
	if (l.length > 0) {
		lines.push(l);
	}

	// distribute parts on lines
	if (this instanceof CommandBlockMorph) {
		y = this.top() + this.corner + this.edge;
		if (this instanceof HatBlockMorph) {
			y += this.hatHeight;
		}
	} else if (this instanceof ReporterBlockMorph) {
		y = this.top() + (this.edge * 2);
	} else if (this instanceof MultiArgMorph
		|| this instanceof ArgLabelMorph) {
		y = this.top();
		if (this.slotSpec === '%cs' && this.inputs().length > 0) {
			y -= this.rounding;
		}
	}
	lines.forEach(line => {
		x = this.left() + this.edge + this.labelPadding;
		if (this.isPredicate) {
			x = this.left() + this.rounding;
		} else if (this instanceof MultiArgMorph ||
			this instanceof ArgLabelMorph
		) {
			x = this.left();
		}
		y += lineHeight;
		lineHeight = 0;
		line.forEach(part => {
			if (part instanceof CSlotMorph) {
				x -= this.labelPadding;
				if (this.isPredicate) {
					x = this.left() + this.rounding;
				}
				part.setColor(this.color);
				part.setPosition(new Point(x, y));
				lineHeight = part.height();
			} else if (part instanceof MultiArgMorph &&
				(part.slotSpec.includes('%cs'))
			) {
				if (this.isPredicate) {
					x += this.corner;
				}
				part.setPosition(new Point(x, y));
				lineHeight = part.height();
				maxX = Math.max(
					maxX,
					Math.max(...part.children.filter(each =>
						each.isVisible &&
						!(each instanceof CSlotMorph)
					).map(each => each.right()))
				);
			} else {
				part.setPosition(new Point(x, y));
				if (!part.isBlockLabelBreak) {
					if (part.slotSpec === '%c') {
						x += part.width();
					} else if (part.isVisible) {
						x += part.fullBounds().width() + space;
					}
				}
				maxX = Math.max(maxX, x);
				lineHeight = Math.max(
					lineHeight,
					part instanceof StringMorph ?
					part.rawHeight() : part.height()
				);
			}
		});

		// center parts vertically on each line:
		line.forEach(part => {
			part.moveBy(new Point(
				0,
				Math.floor((lineHeight - part.height()) / 2)
			));
		});
	});

	// determine my height:
	y += lineHeight;
	if (this.children.some(any => any instanceof CSlotMorph)) {
		bottomCorrection = this.bottomPadding;
		rightMost = this.inputs()[this.inputs().length - 1];
		if (rightMost instanceof MultiArgMorph) {
			bottomCorrection = -this.bottomPadding;
			if (rightMost.slotSpec.includes('%cs')) {
				if (rightMost.inputs().length) {
					bottomCorrection -= this.bottomPadding;
				} else {
					bottomCorrection += this.bottomPadding	/ 4;
				}
			}
		}
		if (this instanceof ReporterBlockMorph && !this.isPredicate) {
			bottomCorrection = Math.max(
				this.bottomPadding,
				this.rounding - this.bottomPadding
			);
		}
		y += bottomCorrection;
	}
	if (this instanceof CommandBlockMorph) {
		blockHeight = y - this.top() + (this.corner * 2);
	} else if (this instanceof ReporterBlockMorph) {
		blockHeight = y - this.top() + (this.edge * 2);
	} else if (this instanceof MultiArgMorph
		|| this instanceof ArgLabelMorph) {
		blockHeight = y - this.top();
	}

	// determine my width:
	if (this.isPredicate) {
		blockWidth = Math.max(
			blockWidth,
			maxX - this.left() + this.rounding
		);
		rightCorrection = space;
	} else if ((this instanceof MultiArgMorph && this.slotSpec !== '%cs')
		|| this instanceof ArgLabelMorph) {
		blockWidth = Math.max(
			blockWidth,
			maxX - this.left() - space
		);
	} else {
		blockWidth = Math.max(
			blockWidth,
			maxX - this.left() + this.labelPadding - this.edge
		);
		rightCorrection = space;
	}

	// adjust right padding if rightmost input has arrows
	rightMost = parts[parts.length - 1];
	if (rightMost instanceof MultiArgMorph && rightMost.isVisible &&
		(lines.length === 1)) {
		blockWidth -= rightCorrection;
	}

	// adjust width to hat width
	if (this instanceof HatBlockMorph) {
		blockWidth = Math.max(blockWidth, this.hatWidth * 1.5);
	}

	// set my extent (silently, because we'll redraw later anyway):
	this.bounds.setWidth(blockWidth);
	this.bounds.setHeight(blockHeight);

	// adjust CSlots and collect holes
	this.holes = [];
	parts.forEach(part => {
		var adjustMultiWidth = 0;
		if (part instanceof CSlotMorph ||
			(part.slotSpec && part.slotSpec.includes('%cs'))
		) {
			if (this.isPredicate) {
				part.bounds.setWidth(
					blockWidth -
					ico -
					this.rounding -
					this.inset -
					this.corner
				);
				adjustMultiWidth = this.corner;
			} else {
				part.bounds.setWidth(blockWidth - this.edge);
				adjustMultiWidth = this.corner + this.edge;
			}
		}
		if (part instanceof MultiArgMorph && part.slotSpec.includes('%cs')) {
			part.inputs().filter(each =>
				each instanceof CSlotMorph
			).forEach(slot =>
				slot.bounds.setWidth(
					part.right() - slot.left() - adjustMultiWidth
				)
			);
		}
		part.fixHolesLayout();
		this.holes.push.apply(
			this.holes,
			part.holes.map( hole =>
				hole.translateBy(part.position().subtract(pos))
			)
		);
	});

	// position next block:
	if (nb) {
		nb.setPosition(
			new Point(
				this.left(),
				this.bottom() - (this.corner)
			)
		);
	}

	// find out if one of my parents needs to be fixed
	if (this instanceof BlockMorph && this.parent && this.parent.fixLayout) {
		this.parent.fixLayout();
		this.parent.changed();
		if (this.parent instanceof SyntaxElementMorph) {
			return;
		}
	}

	this.fixHighlight();
};

SyntaxElementMorph.prototype.fixHighlight = function () {
	var top = this.topBlock();
	if (top.getHighlight && top.getHighlight()) {
		top.addHighlight(top.removeHighlight());
	}
};

// SyntaxElementMorph evaluating:

SyntaxElementMorph.prototype.evaluate = function () {
	// responsibility of my children, default is to answer null
	return null;
};

SyntaxElementMorph.prototype.isEmptySlot = function () {
	// responsibility of my children, default is to answer false
	return false;
};

// SyntaxElementMorph speech bubble feedback:

SyntaxElementMorph.prototype.showBubble = function (value, exportPic, target) {
	alert('not implemented yet');
	return;
	var bubble,
		txt,
		img,
		morphToShow,
		isClickable = true,
		ide = this.parentThatIsA(IDE_Morph) || target.parentThatIsA(IDE_Morph),
		anchor = this,
		pos = this.rightCenter().add(new Point(2, 0)),
		sf = this.parentThatIsA(ScrollFrameMorph),
		wrrld = this.world() || target.world(),
		maxHeight,
		scroller;

	async function writeClipboardText(text, ide) {
		try {
			await navigator.clipboard.writeText(text);
			ide.showMessage('copied to clipboard', 1, true);
		} catch (error) {
			ide.showMessage(error.message, 2, true);
		}
	}

	if ((value === undefined) || !wrrld) {
		return null;
	}
	if (typeof value === 'boolean') {
		morphToShow = SpriteMorph.prototype.booleanMorph.call(
			null,
			value
		);
	} else if (value instanceof Color) {
		morphToShow = SpriteMorph.prototype.colorSwatch(
			value,
			this.fontSize * 1.4
		);
	} else if (isString(value)) {
		// shorten the string, commented out because we now scroll it
		// txt	= value.length > 500 ? value.slice(0, 500) + '...' : value;
		txt	 = value;
		maxHeight = ide.height() / 2;
		morphToShow = new TextMorph(
			txt,
			this.fontSize
		);

		if (morphToShow.height() > maxHeight) { // scroll
			scroller = new ScrollFrameMorph();
			scroller.acceptsDrops = false;
			scroller.contents.acceptsDrops = false;
			scroller.bounds.setWidth(morphToShow.width());
			scroller.bounds.setHeight(maxHeight);
			scroller.addContents(morphToShow);
			scroller.color = new Color(0, 0, 0, 0);
			morphToShow = scroller;
		}

		// support exporting text / numbers directly from result bubbles:
		morphToShow.userMenu = function () {
			var menu = new MenuMorph(this);
			menu.addItem(
				'export',
				() => ide.saveFileAs(
					value,
					'text/plain;charset=utf-8',
					localize('data')
				)
			);
			menu.addItem(
				'copy',
				() => writeClipboardText(value, ide)
			);
			return menu;
		};
	} else {
		return this.showBubble(
			display(value),
			exportPic,
			target
		);
	}
	if (ide && (ide.currentSprite !== target)) {
		if (target instanceof StageMorph) {
			anchor = ide.corral.stageIcon;
		} else if (target) {
			if (target.isTemporary) {
				target = detect(
					target.allExemplars(),
					each => !each.isTemporary
				);
			}
			anchor = detect(
				ide.corral.frame.contents.children,
				icon => icon.object === target
			);
		} else {
			target = ide;
		}
		pos = anchor.center();
	}
	bubble = new SpeechBubbleMorph(
		morphToShow,
		null,
		Math.max(this.rounding - 2, 6),
		0
	);
	bubble.popUp(
		wrrld,
		pos,
		isClickable
	);
	if (exportPic) {
		this.exportPictureWithResult(bubble);
	}
	if (anchor instanceof SpriteIconMorph) {
		bubble.keepWithin(ide.corral);
	} else if (sf) {
		bubble.keepWithin(sf);
	}
};

SyntaxElementMorph.prototype.exportPictureWithResult = function (aBubble) {
	alert('not implemented yet');
	return;
	if (this.removeHighlight) {this.removeHighlight(); }
	var ide = this.parentThatIsA(IDE_Morph) ||
		this.parentThatIsA(BlockEditorMorph).target.parentThatIsA(
			IDE_Morph
		),
		scr = this.fullImage(),
		bub = aBubble.fullImage(),
		taller = Math.max(0, bub.height - scr.height),
		pic = newCanvas(new Point(
			scr.width + bub.width + 2,
			scr.height + taller
		)),
		ctx = pic.getContext('2d');
	ctx.drawImage(scr, 0, pic.height - scr.height);
	ctx.drawImage(bub, scr.width + 2, 0);
	// request to open pic in new window.

	ide.saveFileAs(
		embedMetadataPNG(pic, this.toXMLString()),
		'image/png',
		(ide.getProjectName() || localize('untitled')) + ' ' +
		localize('script pic')
	);
};

// BlockLabelMorph ///////////////////////////////////////////////

/*
		I am a piece of single-line text written on a block. I serve as a
		container for sharing typographic attributes among my instances
		*/

// BlockLabelMorph inherits from StringMorph:

BlockLabelMorph.prototype = new StringMorph();
BlockLabelMorph.prototype.constructor = BlockLabelMorph;
BlockLabelMorph.uber = StringMorph.prototype;

function BlockLabelMorph(
	text,
	fontSize,
	fontStyle,
	bold,
	italic,
	isNumeric,
	shadowOffset,
	shadowColor,
	color,
	fontName
) {
	this.init(
		text,
		fontSize,
		fontStyle,
		bold,
		italic,
		isNumeric,
		shadowOffset,
		shadowColor,
		color,
		fontName
	);
}

BlockLabelMorph.prototype.getRenderColor = function () {
	var block = this.parentThatIsA(BlockMorph);
	return !block || block.alpha > 0.5 ? this.color
		: block.color.solid().lighter(Math.max(block.alpha * 200, 0.1));

};

BlockLabelMorph.prototype.getShadowRenderColor = function () {
	var block = this.parentThatIsA(BlockMorph);
	return (block && block.alpha > 0.5) ?
		this.shadowColor
		: CLEAR;
};

// BlockMorph //////////////////////////////////////////////////////////

/*
		I am an abstraction of all blocks (commands, reporters, hats).

		Aside from the visual settings inherited from Morph and
		SyntaxElementMorph my most important attributes and public
		accessors are:

		selector		- (string) name of method to be triggered
		scriptTarget()	- answer the object (sprite) to which I apply
		inputs()		- answer an array with my arg slots and nested reporters
		defaults		- an optional Array containing default input values
		topBlock()		- answer the top block of the stack I'm attached to
		blockSpec		- a formalized description of my label parts
		setSpec()		- force me to change my label structure
		evaluate()		- answer the result of my evaluation
		isUnevaluated() - answer whether I am part of a special form

		Zebra coloring provides a mechanism to alternate brightness of nested,
		same colored blocks (of the same category). The deviation of alternating
		brightness is set in the preferences setting:

		zebraContrast - <number> percentage of brightness deviation

		attribute. If the attribute is set to zero, zebra coloring is turned
		off. If it is a positive number, nested blocks will be colored in
		a brighter shade of the same hue and the label color (for texts)
		alternates between white and black. If the attribute is set to a negative
		number, nested blocks are colored in a darker shade of the same hue
		with no alternating label colors.

		Note: Some of these methods are inherited from SyntaxElementMorph
		for technical reasons, because they are shared among Block and
		MultiArgMorph (e.g. topBlock()).

		blockSpec is a formatted string consisting of plain words and
		reserved words starting with the percent character (%), which
		represent the following pre-defined input slots and/or label
		features:

		arity: single

		%br		- user-forced line break
		%s		- white rectangular type-in slot ("string-type")
		%txt	- white rectangular type-in slot ("text-type")
		%mlt	- white rectangular type-in slot ("multi-line-text-type")
		%code	- white rectangular type-in slot, monospaced font
		%n		- white roundish type-in slot ("numerical")
		%dir	- white roundish type-in slot with drop-down for directions
		%inst	- white roundish type-in slot with drop-down for instruments
		%ida	- white roundish type-in slot with drop-down for list indices
		%idx	- white roundish type-in slot for indices incl. "random"
		%dim	- white roundish type-in slot for dimensinos incl. "current"
		%obj	- specially drawn slot for object reporters
		%rel	- chameleon colored rectangular drop-down for relation options
		%spr	- chameleon colored rectangular drop-down for object-names
		%col	- chameleon colored rectangular drop-down for collidables
		%dst	- chameleon colored rectangular drop-down for destinations
		%cst	- chameleon colored rectangular drop-down for costume-names
		%eff	- chameleon colored rectangular drop-down for graphic effects
		%snd	- chameleon colored rectangular drop-down for sound names
		%key	- chameleon colored rectangular drop-down for keyboard keys
		%msg	- chameleon colored rectangular drop-down for messages
		%att	- chameleon colored rectangular drop-down for attributes
		%fun	- chameleon colored rectangular drop-down for math functions
		%typ	- chameleon colored rectangular drop-down for data types
		%var	- chameleon colored rectangular drop-down for variable names
		%shd	- Chameleon colored rectuangular drop-down for shadowed var names
		%b		- chameleon colored hexagonal slot (for predicates)
		%bool	- chameleon colored hexagonal slot (for predicates), static
		%l		- list icon
		%c		- C-shaped command slot, special form for primitives
		%ca		- C-shaped with loop arrow, for custom blocks
		%cs		- C-shaped, auto-reifying, accepts reporter drops
		%cl		- C-shaped, auto-reifying, rejects reporters
		%cla	- C-shaped with loop arrows, auto-reifying, rejects reporters
		%clr	- interactive color slot
		%t		- inline variable reporter template
		%anyUE	- white rectangular type-in slot, unevaluated if replaced
		%boolUE - chameleon colored hexagonal slot, unevaluated if replaced
		%f		- round function slot, unevaluated if replaced,
		%r		- round reporter slot
		%p		- hexagonal predicate slot
		%vid	- chameleon colored rectangular drop-down for video modes
		%scn	- chameleon colored rectangular drop-down for scene names

		arity: multiple

		%mult%x		 - where %x stands for any of the above single inputs
		%group%x%y	 - where %x and %y stand for any of the above single inputs
		%inputs		 - for an additional text label 'with inputs'
		%words		 - for an expandable list of default 2 (used in JOIN)
		%lists		 - for an expandable list of default 2 lists (CONCAT)
		%exp		 - for a static expandable list of minimum 0 (used in LIST)
		%scriptVars	 - for an expandable list of variable reporter templates
		%parms		 - for an expandable list of formal parameters

		special form: upvar

		%upvar		 - same as %t (inline variable reporter template)

		special form: input name

		%inputName	 - variable blob (used in input type dialog)

		examples:

				'if %b %c else %c'			- creates Scratch's If/Else block
				'set pen color to %clr'		- creates Scratch's Pen color block
				'list %mult%s'				- creates BYOB's list reporter block
				'call %n %inputs'			- creates BYOB's Call block
				'the script %parms %c'		- creates BYOB's THE SCRIPT block
				*/

// BlockMorph inherits from SyntaxElementMorph:

BlockMorph.prototype = new SyntaxElementMorph();
BlockMorph.prototype.constructor = BlockMorph;
BlockMorph.uber = SyntaxElementMorph.prototype;

BlockMorph.prototype.colorFor = function (category) {
	let result = {
		Output : new Color(72, 82, 191),
		Input : new Color(159, 66, 165),
		Pins : new Color(84, 135, 153),
		Comm : new Color(30, 153, 122),
		Control : new Color(209, 140, 37),
		Operators : new Color(71, 157, 29),
		Variables : new Color(211, 115, 42),
		Data : new Color(196, 78, 107),
		Advanced : new Color(178, 116, 53),
		'My Blocks' : new Color(26, 140, 221),
		Library : new Color(30, 153, 122),
		Obsolete : new Color(196, 15, 0),
	}[category];
	if (result === undefined) {
		result = new Color(37, 145, 221);
	}
	return result;
};

// BlockMorph preferences settings:

BlockMorph.prototype.isCachingInputs = true;
BlockMorph.prototype.zebraContrast = 40; // alternating color brightness

// BlockMorph sound feedback:

BlockMorph.prototype.snapSound = null;

BlockMorph.prototype.toggleSnapSound = function () {
	if (this.snapSound !== null) {
		this.snapSound = null;
	} else {
		BlockMorph.prototype.snapSound = document.createElement('audio');
		BlockMorph.prototype.snapSound.src = 'src/click.wav';
	}
};

// BlockMorph instance creation:

function BlockMorph() {
	this.init();
}

BlockMorph.prototype.init = function () {
	this.selector = null; // name of method to be triggered
	this.blockSpec = ''; // formal description of label and arguments
	this.comment = null; // optional "sticky" comment morph

	// not to be persisted:
	this.instantiationSpec = null; // spec to set upon fullCopy() of template
	this.category = null; // for zebra coloring (non persistent)
	this.isCorpse = false; // marked for deletion fom a custom block definition
	this.afterglow = 0; // frame count-down for displaying the "active" halo

	BlockMorph.uber.init.call(this);
	this.color = new Color(102, 102, 102);
	this.cachedInputs = null;
};

BlockMorph.prototype.toString = function () {
	return 'a ' +
		(this.constructor.name ||
			this.constructor.toString().split(' ')[1].split('(')[0]) +
		' ("' +
		this.blockSpec.slice(0, 30) + '...")';
};

// BlockMorph spec:

BlockMorph.prototype.parseSpec = function (spec) {
	var result = [],
		words,
		word = '';

	words = isString(spec) ? spec.split(' ') : [];
	if (words.length === 0) {
		words = [spec];
	}
	if (this.labelWordWrap) {
		return words;
	}

	function addWord(w) {
		if ((w[0] === '%') && (w.length > 1)) {
			if (word !== '') {
				result.push(word);
				word = '';
			}
			result.push(w);
		} else {
			if (word !== '') {
				word += ' ' + w;
			} else {
				word = w;
			}
		}
	}

	words.forEach(each => addWord(each));
	if (word !== '') {
		result.push(word);
	}
	return result;
};

BlockMorph.prototype.setSpec = function (spec, definition) {
	var part,
		inputIdx = -1;

	if (!spec) {return; }
	this.parts().forEach(part =>
		part.destroy()
	);
	if (this.isPrototype) {
		this.add(this.placeHolder());
	}
	this.parseSpec(spec).forEach((word, idx, arr) => {
		if (word[0] === '%' && (word !== '%br')) {
			inputIdx += 1;
		}
		part = this.labelPart(word);
		if (isNil(part)) {
			// console.log('could not create label part', word);
			return;
		}
		this.add(part);
		if (!(part instanceof CommandSlotMorph ||
			part instanceof StringMorph)) {
			part.fixLayout();
			part.rerender();
		}
		if (part instanceof MultiArgMorph || part.constructor === CommandSlotMorph) {
			part.fixLayout();
		}
		if (this.isPrototype) {
			this.add(this.placeHolder());
		}
		if (this.isCustomBlock) {
			if (part instanceof InputSlotMorph) {
				part.setChoices.apply(
					part,
					(definition || this.definition).inputOptionsOfIdx(inputIdx)
				);
			}
			if (part instanceof ArgMorph &&
				!(part instanceof TemplateSlotMorph)) {
				part.isStatic = (definition
					|| this.definition).isIrreplaceableInputIdx(inputIdx);
				part.canBeEmpty = !part.isStatic;
			}
		}
	});
	this.blockSpec = spec;
	this.fixLayout();
	this.rerender();
	this.cachedInputs = null;
};

BlockMorph.prototype.userSetSpec = function (spec) {
	var tb = this.topBlock(),
		old = this.abstractBlockSpec();
	tb.fullChanged();
	this.setSpec(spec);
	tb.fullChanged();
};

BlockMorph.prototype.buildSpec = function () {
	// create my blockSpec from my parts - for demo purposes only
	this.blockSpec = '';
	this.parts().forEach(part => {
		if (part instanceof StringMorph) {
			this.blockSpec += part.text;
		} else if (part instanceof ArgMorph) {
			this.blockSpec += part.getSpec();
		} else if (part.isBlockLabelBreak) {
			this.blockSpec += part.getSpec();
		} else {
			this.blockSpec += '[undefined]';
		}
		this.blockSpec += ' ';
	});
	this.blockSpec = this.blockSpec.trim();
};

BlockMorph.prototype.rebuild = function (contrast) {
	// rebuild my label fragments, for use in ToggleElementMorphs
	this.setSpec(this.blockSpec);
	if (contrast) {
		this.inputs().forEach(input => {
			if (input instanceof ReporterBlockMorph) {
				input.setColor(input.color.lighter(contrast));
				input.setSpec(input.blockSpec);
			}
		});
	}
};

BlockMorph.prototype.abstractBlockSpec = function () {
	// answer the semantic block spec substituting each input
	// with an underscore. Used as "name" of the Block.
	return this.parseSpec(this.blockSpec).map(str =>
		str === '%br' ? '$nl' : (str.length > 1 && (str[0]) === '%') ? '_' : str
	).join(' ');
};

BlockMorph.prototype.localizeBlockSpec = function (spec) {
	// answer the translated block spec where the translation itself
	// is in the form of an abstract spec, i.e. with padded underscores
	// in place for percent-sign prefixed slot specs.
	var prefixes = ['%', '$'],
		slotSpecs = [],
		slotCount = -1,
		abstractSpec,
		translation;

	abstractSpec = this.parseSpec(spec).map(str => {
		if (str.length > 1 && prefixes.includes(str[0])) {
			slotSpecs.push(str);
			return '_';
		}
		return str;
	}).join(' ');

	// make sure to also remove any explicit slot specs from the translation
	translation = this.parseSpec(localize(abstractSpec)).map(str =>
		(str.length > 1 && prefixes.includes(str[0])) ? '_' : str
	).join(' ');

	// replace abstract slot placeholders in the translation with their
	// concrete specs from the original block spec
	return translation.split(' ').map(word => {
		if (word === '_') {
			slotCount += 1;
			return slotSpecs[slotCount] || '';
		}
		return word;
	}).join(' ');
};

// BlockMorph menu:

BlockMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this),
		shiftClicked = this.world().currentKey === 16;

	menu.addItem(
		'print code',
		() => { console.log(this.printCode(0, [])); },
		'test coverting scripts to pseudocode'
	);
	menu.addItem(
		'duplicate',
		() => { this.fullCopy().pickUp(world); },
		'make a copy\nand pick it up'
	);
	menu.addItem(
		'delete',
		() => { this.destroy(); },
		'delete this morph'
	);
	menu.addLine();
	menu.addItem('scripts pic...', 'exportScriptsPicture', 'save a picture\nof all scripts');
	return menu;
};

BlockMorph.prototype.printCode = function (indent, result) {
	if (this.type() == 'reporter') {
		result.push('(');
	} else { // command or hat block
		result.push('\t'.repeat(indent));
	}
	result.push(this.selector + ' ');

	let args = this.inputs();
	for (let i = 0; i < args.length; i++) {
		let arg = args[i];
		if (arg instanceof BooleanSlotMorph) {
			result.push(arg.value == true);
		} else if (arg instanceof CSlotMorph) {
			let nested = arg.nestedBlock();
			if (nested == null) {
				result.push('{}');
			} else {
				result.push('{\n');
				nested.printCode(indent + 1, result);
				result.push('\t'.repeat(indent));
				result.push('}');
			}
		} else if (arg instanceof ReporterBlockMorph) {
			arg.printCode(indent, result);
		} else {
			let value = arg.contents().text;
			if ((value.length == 0) && (arg.isNumeric)) {
				value = '0';
			}
			if ((typeof value1 === 'number') || ((value.length > 0) && (Number(value) != NaN))) { // number
				result.push(value);
			} else if ((typeof value) == 'boolean') {
				result.push(value);
			} else { // string
				result.push('"' + value + '"');
			}
		}
		if (i < (args.length - 1)) {
			result.push(' ');
		}
	}

	if (this.type() == 'reporter') {
		result.push(')');
	} else { // command or hat block
		result.push('\n');
		let next = this.nextBlock();
		if (this instanceof HatBlockMorph) indent += 1;
		if (next != null) next.printCode(indent, result); // recursive!
	}
	return result.join('');
}

BlockMorph.prototype.type = function () {
	// private
	return this instanceof CommandBlockMorph ? 'command'
		: (this.isPredicate ? 'predicate' : 'reporter');
};

BlockMorph.prototype.isUnattached = function () {
	// private
	return ((this.nextBlock && !this.nextBlock()) || !this.nextBlock) &&
		!(this.parent instanceof SyntaxElementMorph) &&
		!(this.parent instanceof ScriptsMorph);
};

BlockMorph.prototype.deleteBlock = function () {
	// delete just this one block, keep inputs and next block around
	var scripts = this.parentThatIsA(ScriptsMorph),
		nb = this.nextBlock ? this.nextBlock() : null,
		tobefixed,
		isindef;
	if (scripts) {
		if (nb) {
			scripts.add(nb);
		}
		this.inputs().forEach(inp => {
			if (inp instanceof BlockMorph) {
				scripts.add(inp);
			}
		});
	}
	if (this instanceof ReporterBlockMorph &&
		((this.parent instanceof BlockMorph) || (this.parent instanceof MultiArgMorph))) {
		this.parent.revertToDefaultInput(this);
	} else { // CommandBlockMorph
		if (this.parent && this.parent.fixLayout) {
			tobefixed = this.parentThatIsA(ArgMorph);
		} else { // must be in a custom block definition
			isindef = true;
		}
	}
	this.destroy();
	if (isindef) {
		/*
						since the definition's body still points to this block
						even after it has been destroyed, mark it to be deleted
						later.
						*/
		this.isCorpse = true;
	}
	if (tobefixed) {
		tobefixed.fixLayout();
	}
};

BlockMorph.prototype.relabel = function (alternativeSelectors) {
	alert('not yet implemented');
	return;

	// morph one block into another trying to keep the inputs in place
	// alternative Selector can either be a string representing
	// a block selector or a 2-item array containing a string and
	// an integer offset for restoring inputs
	var menu, oldInputs,
		target = this.selectForEdit(); // copy-on-edit
	if (target !== this) {
		return this.relabel.call(target, alternativeSelectors);
	}
	menu = new MenuMorph(this);
	oldInputs = this.inputs();
	alternativeSelectors.forEach(alternative => {
		var block, selector, offset;
		if (alternative instanceof Array) {
			selector = alternative[0];
			offset = -alternative[1];
		} else {
			selector = alternative;
			offset = 0;
		}
		block = SpriteMorph.prototype.blockForSelector(selector, true);
		block.restoreInputs(oldInputs, offset);
		block.fixBlockColor(null, true);
		block.addShadow(new Point(3, 3));
		menu.addItem(
			block.doWithAlpha(1, () => block.fullImage()),
			() => {
				var old = this.abstractBlockSpec();
				this.setSelector(selector, -offset);
			}
		);
	});
	menu.popup(this.world(), this.bottomLeft().subtract(new Point(
		8,
		this instanceof CommandBlockMorph ? this.corner : 0
	)));
};


BlockMorph.prototype.setSelector = function (aSelector, inputOffset = 0) {
	// private - used only for relabel()
	// input offset is optional and can be used to shift the inputs
	// to be restored
	var oldInputs = this.inputs(),
		scripts = this.parentThatIsA(ScriptsMorph),
		surplus,
		info,
		slots,
		i;
	info = SpriteMorph.prototype.blocks[aSelector];
	this.setCategory(info.category);
	this.selector = aSelector;
	this.setSpec(this.localizeBlockSpec(info.spec));
	this.defaults = info.defaults || [];

	// restore default values
	slots = this.inputs();
	if (slots[0] instanceof MultiArgMorph) {
		slots[0].setContents(this.defaults);
		slots[0].defaults = this.defaults;
	} else {
		for (i = 0; i < this.defaults.length; i += 1) {
			if (this.defaults[i] !== null && slots[i].setContents) {
				slots[i].setContents(this.defaults[i]);
			}
		}
	}

	// restore previous inputs
	surplus = this.restoreInputs(oldInputs, -inputOffset);
	this.fixLabelColor();
	this.fixLayout();

	// place surplus blocks on scipts
	if (scripts && surplus?.length) {
		surplus.forEach(blk => {
			blk.moveBy(10);
			scripts.add(blk);
		});
	}
};

BlockMorph.prototype.restoreInputs = function (oldInputs, offset = 0) {
	// private - used only for relabel()
	// try to restore my previous inputs when my spec has been changed
	// return an Array of left-over blocks, if any
	// optional offset parameter allows for shifting the range
	// of inputs to be restored
	var old, nb, i, src, trg,
		element = this,
		inputs = this.inputs(),
		leftOver = [];

	function preserveBlocksIn(slot) {
		if (slot instanceof ReporterBlockMorph) {
			leftOver.push(slot);
		} else if (slot instanceof CommandSlotMorph) {
			nb = slot.nestedBlock();
			if (nb) {
				leftOver.push(nb);
			}
		} else if (slot instanceof MultiArgMorph) {
			slot.inputs().forEach(inp => {
				if (inp instanceof ReporterBlockMorph) {
					leftOver.push(inp);
				} else if (inp instanceof CommandSlotMorph) {
					nb = inp.nestedBlock();
					if (nb) {
						leftOver.push(nb);
					}
				}
			});
		}
	}

	// gather leading surplus blocks
	for (i = 0; i < offset; i += 1) {
		preserveBlocksIn(oldInputs[i]);
	}

	// special cases for relabelling to / from single variadic infix reporters
	src = oldInputs[0];
	trg = inputs[0];

	// 1.
	// both blocks have exactly one variadic slot, with the same slot spec but
	// different infixes, and not nessesarily matching numbers of expanded
	// slots.
	if (oldInputs.length === 1 &&
		(inputs.length === 1) &&
		src instanceof MultiArgMorph &&
		trg instanceof MultiArgMorph &&
		src.slotSpec === trg.slotSpec &&
		(src.infix !== trg.infix)
	) {
		element = trg;
		oldInputs = src.inputs();
		while(element.inputs().length < oldInputs.length) {
			element.addInput();
		}
		inputs = element.inputs();
	}

	// 2.
	// this block has a single variadic infix slot which will hold all of the
	// old block inputs.
	else if (oldInputs.length &&
		(inputs.length === 1) &&
		trg instanceof MultiArgMorph &&
		!(src instanceof MultiArgMorph) &&
		!(src instanceof ArgLabelMorph)
	) {
		element = trg;
		inputs = element.inputs();
	}

	// 3.
	// the old inputs are a single variadic infix slot whose inputs will be
	// distributed over this blocks non-variadic slots
	else if (oldInputs.length === 1 &&
		inputs.length &&
		src instanceof MultiArgMorph &&
		!(trg instanceof MultiArgMorph)
	) {
		oldInputs = src.inputs();
	}

	// restore matching inputs in their original order
	inputs.forEach(inp => {
		old = oldInputs[offset];
		if (old instanceof ArgLabelMorph) {
			old = old.argMorph();
		}
		if (old instanceof ReporterBlockMorph) {
			if (inp instanceof TemplateSlotMorph || inp.isStatic) {
				leftOver.push(old);
			} else {
				element.replaceInput(inp, old.fullCopy());
			}
		} else if (old && inp instanceof InputSlotMorph) {
			// original - turns empty numberslots to 0:
			// inp.setContents(old.evaluate());
			// "fix" may be wrong b/c constants
			if (old.contents) {
				inp.setContents(old.contents().text);
				if (old.constant) {
					inp.constant = old.constant;
				}
			}
		} else if (old instanceof CSlotMorph && inp instanceof CSlotMorph) {
			nb = old.nestedBlock();
			if (nb) {
				inp.nestedBlock(nb.fullCopy());
			}
		} else if (old instanceof MultiArgMorph &&
			inp instanceof MultiArgMorph &&
			(old.slotSpec === inp.slotSpec) &&
			old.infix === inp.infix) {
			element.replaceInput(inp, old.fullCopy());
		} else {
			preserveBlocksIn(old);
		}
		offset += 1;
	});

	// gather trailing surplus blocks
	for (offset; offset < oldInputs.length; offset += 1) {
		preserveBlocksIn(oldInputs[offset]);
	}
	element.cachedInputs = null;
	this.cachedInputs = null;
	return leftOver;
};

// BlockMorph exporting picture with result bubble

BlockMorph.prototype.exportResultPic = function () {
	alert('not implemented yet');
	return;
	var top = this.topBlock();
	if (top !== this) {return; }
};

// BlockMorph syntax analysis

BlockMorph.prototype.toLisp = function (indentation = 0) {
	return Process.prototype.toTextSyntax(
		this.components()
	).encode(0, indentation);
};

BlockMorph.prototype.components = function (parameterNames = []) {
	if (this instanceof ReporterBlockMorph) {
		return this.syntaxTree(parameterNames);
	}
	var seq = new List(this.blockSequence(true)).map((block, i) =>
		block.syntaxTree(i < 1 ? parameterNames : [])
	);
	return seq.length() === 1 ? seq.at(1) : seq;
};

BlockMorph.prototype.syntaxTree = function (parameterNames) {
	var expr = this.fullCopy(),
		nb = expr.nextBlock ? expr.nextBlock() : null,
		inputs, parts;
	if (nb) {
		nb.destroy();
	}
	expr.fixBlockColor(null, true);
	inputs = expr.inputs();
	parts = new List([expr.reify()]);
	inputs.forEach(inp => {
		var val;
		if (inp instanceof BlockMorph) {
			parts.add(inp.components());
			expr.revertToEmptyInput(inp);
		} else if (inp.isEmptySlot()) {
			parts.add();
		} else if (inp instanceof MultiArgMorph) {
			if (!inp.inputs().length) {
				parts.add();
			}
			inp.inputs().forEach((slot, i) => {
				var entry;
				if (slot instanceof BlockMorph) {
					parts.add(slot.components());
				} else if (slot.isEmptySlot()) {
					parts.add();
				} else {
					entry = slot.evaluate();
					parts.add(entry instanceof BlockMorph ?
						entry.components() : entry);
				}
				inp.revertToEmptyInput(slot);
			});
		} else if (inp instanceof ArgLabelMorph) {
			parts.add(inp.argMorph().components());
			expr.revertToEmptyInput(inp).collapseAll();
		} else {
			val = inp.evaluate();
			if (val instanceof Array) {
				val = '[' + val + ']';
			}
			if (inp instanceof ColorSlotMorph) {
				val = val.toString();
			}
			parts.add(val instanceof BlockMorph ? val.components() : val);
			expr.revertToEmptyInput(inp, true);
		}
	});
	parts.at(1).updateEmptySlots();
	if (expr.selector === 'v') {
		parts.add(expr.blockSpec);
		expr.setSpec('\xa0'); // non-breaking space, appears blank
	}
	parameterNames.forEach(name => parts.add(name));
	return parts;
};

BlockMorph.prototype.equalTo = function (other) {
	// private - only to be called from a Context
	return this.constructor.name === other.constructor.name &&
		this.selector === other.selector &&
		this.blockSpec === other.blockSpec;
};

BlockMorph.prototype.copyWithNext = function (next, parameterNames) {
	var expr = this.fullCopy(),
		top;
	if (this instanceof ReporterBlockMorph) {
		return expr.reify();
	}
	top = next.fullCopy().topBlock();
	if (top instanceof CommandBlockMorph) {
		expr.bottomBlock().nextBlock(top);
	}
	return expr.reify(parameterNames);
};

BlockMorph.prototype.markEmptySlots = function () {
	// private - mark all empty slots with an identifier
	// and return the count
	var count = 0;

	this.allInputs().forEach(input =>
		delete input.bindingID
	);
	this.allEmptySlots().forEach(slot => {
		count += 1;
		if (slot instanceof MultiArgMorph) {
			slot.bindingID = Symbol.for('arguments');
		} else {
			slot.bindingID = count;
		}
	});
	return count;
};

// BlockMorph thumbnail and script pic

BlockMorph.prototype.thumbnail = function (scale, clipWidth) {
	var nb = this.nextBlock(),
		fadeout = 12,
		ext,
		trgt,
		ctx,
		gradient;

	if (nb) {nb.isVisible = false; }
	ext = this.fullBounds().extent();
	trgt = newCanvas(new Point(
		clipWidth ? Math.min(ext.x * scale, clipWidth) : ext.x * scale,
		ext.y * scale
	));
	ctx = trgt.getContext('2d');
	ctx.scale(scale, scale);
	ctx.drawImage(this.fullImage(), 0, 0);
	// draw fade-out
	if (clipWidth && ext.x * scale > clipWidth) {
		gradient = ctx.createLinearGradient(
			trgt.width / scale - fadeout,
			0,
			trgt.width / scale,
			0
		);
		gradient.addColorStop(0, 'transparent');
		gradient.addColorStop(1, 'black');
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = gradient;
		ctx.fillRect(
			trgt.width / scale - fadeout,
			0,
			trgt.width / scale,
			trgt.height / scale
		);
	}
	if (nb) {nb.isVisible = true; }
	return trgt;
};

BlockMorph.prototype.scriptPic = function () {
	// answer a canvas image that also includes comments
	var scr = this.fullImage(),
		fb = this.stackFullBounds(),
		pic = newCanvas(fb.extent()),
		ctx = pic.getContext('2d');

	this.allComments().forEach(comment =>
		ctx.drawImage(
			comment.fullImage(),
			comment.fullBounds().left() - fb.left(),
			comment.top() - fb.top()
		)
	);
	ctx.drawImage(scr, 0, 0);
	return pic;
};

BlockMorph.prototype.fullImage = function () {
	// answer a canvas image meant for (semi-) transparent blocks
	// that lets the background shine through
	var src, solid, pic, ctx;

	if (this.alpha === 1) {
		return BlockMorph.uber.fullImage.call(this);
	}
	this.forAllChildren(m => {
		if (m instanceof BlockMorph) {
			m.mouseLeaveBounds();
		}
	});
	src = BlockMorph.uber.fullImage.call(this);
	solid = this.doWithAlpha(1, () => BlockMorph.uber.fullImage.call(this));
	pic = newCanvas(this.fullBounds().extent());
	ctx = pic.getContext('2d');
	ctx.fillStyle = ScriptsMorph.prototype.getRenderColor().toString();
	ctx.fillRect(0, 0, pic.width, pic.height);
	ctx.globalCompositeOperation = 'destination-in';
	ctx.drawImage(solid, 0, 0);
	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(src, 0, 0);
	return pic;
};

BlockMorph.prototype.clearAlpha = function () {
	this.forAllChildren(m => {
		if (m instanceof BlockMorph) {
			delete m.alpha;
		}
	});
};

// BlockMorph drawing

BlockMorph.prototype.render = function (ctx) {
	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();

	// draw the outline
	ctx.fillStyle = this.cachedClrDark;
	ctx.beginPath();
	this.outlinePath(ctx, 0);
	ctx.closePath();
	ctx.fill();

	// draw the inner filled shaped
	ctx.fillStyle = this.cachedClr;
	ctx.beginPath();
	this.outlinePath(ctx, this.flatEdge);
	ctx.closePath();
	ctx.fill();
};

BlockMorph.prototype.cSlots = function () {
	var result = [];
	this.parts().forEach(part => {
		if (part instanceof CSlotMorph) {
			result.push(part);
		} else if (part instanceof MultiArgMorph) {
			part.parts().forEach(slot => {
				if (slot instanceof CSlotMorph) {
					result.push(slot);
				}
			});
		}
	});
	return result;
};

BlockMorph.prototype.isRuleHat = function () {
	return false;
};

// BlockMorph highlighting

BlockMorph.prototype.addHighlight = function (oldHighlight) {
	var isHidden = !this.isVisible,
		highlight;

	if (isHidden) {this.show(); }
	if (SyntaxElementMorph.prototype.alpha < 1) {
		this.clearAlpha();
	}
	highlight = this.highlight(
		oldHighlight ? oldHighlight.color : this.activeHighlight,
		this.activeBlur,
		this.activeBorder
	);
	this.addBack(highlight);
	this.fullChanged();
	if (isHidden) {this.hide(); }
	return highlight;
};

BlockMorph.prototype.addErrorHighlight = function () {
	var isHidden = !this.isVisible,
		highlight;

	if (isHidden) {this.show(); }
	this.removeHighlight();
	highlight = this.highlight(
		this.errorHighlight,
		this.activeBlur,
		this.activeBorder
	);
	this.addBack(highlight);
	this.fullChanged();
	if (isHidden) {this.hide(); }
	return highlight;
};

BlockMorph.prototype.removeHighlight = function () {
	var highlight = this.getHighlight();
	if (highlight !== null) {
		this.fullChanged();
		this.removeChild(highlight);
		this.afterglow = 0;
	}
	return highlight;
};

BlockMorph.prototype.toggleHighlight = function () {
	if (this.getHighlight()) {
		this.removeHighlight();
	} else {
		this.addHighlight();
	}
};

BlockMorph.prototype.highlight = function (color, blur, border) {
	var highlight = new BlockHighlightMorph(),
		fb = this.fullBounds(),
		edge = border;
	highlight.bounds.setExtent(fb.extent().add(edge * 2));
	highlight.holes = [highlight.bounds]; // make the highlight untouchable
	highlight.color = color;
	highlight.cachedImage = this.highlightImage(color, border);
	highlight.setPosition(fb.origin.subtract(new Point(edge, edge)));
	return highlight;
};

BlockMorph.prototype.highlightImage = function (color, border) {
	var fb, img, hi, ctx, out;
	fb = this.fullBounds().extent();
	this.doWithAlpha(1, () => img = this.fullImage());

	hi = newCanvas(fb.add(border * 2));
	ctx = hi.getContext('2d');

	ctx.drawImage(img, 0, 0);
	ctx.drawImage(img, border, 0);
	ctx.drawImage(img, border * 2, 0);
	ctx.drawImage(img, border * 2, border);
	ctx.drawImage(img, border * 2, border * 2);
	ctx.drawImage(img, border, border * 2);
	ctx.drawImage(img, 0, border * 2);
	ctx.drawImage(img, 0, border);

	ctx.globalCompositeOperation = 'destination-out';
	ctx.drawImage(img, border, border);

	out = newCanvas(fb.add(border * 2));
	ctx = out.getContext('2d');
	ctx.drawImage(hi, 0, 0);
	ctx.globalCompositeOperation = 'source-atop';
	ctx.fillStyle = color.toString();
	ctx.fillRect(0, 0, out.width, out.height);

	return out;
};

BlockMorph.prototype.highlightImageBlurred = function (color, blur) {
	var fb, img, hi, ctx;
	fb = this.fullBounds().extent();
	this.doWithAlpha(1, () => img = this.fullImage());

	hi = newCanvas(fb.add(blur * 2));
	ctx = hi.getContext('2d');
	ctx.shadowBlur = blur;
	ctx.shadowColor = color.toString();
	ctx.drawImage(img, blur, blur);

	ctx.shadowBlur = 0;
	ctx.globalCompositeOperation = 'destination-out';
	ctx.drawImage(img, blur, blur);
	return hi;
};

BlockMorph.prototype.getHighlight = function () {
	var highlights;
	highlights = this.children.slice(0).reverse().filter(child =>
		child instanceof BlockHighlightMorph
	);
	if (highlights.length !== 0) {
		return highlights[0];
	}
	return null;
};

BlockMorph.prototype.flashOutline = function (color, border) {
	this.removeHighlight();
	this.addBack(this.outline(color, border));
	this.fullChanged();
};

BlockMorph.prototype.outline = function (color, border) {
	var highlight = new BlockHighlightMorph(),
		fb = this.fullBounds(),
		edge = border;
	highlight.bounds.setExtent(fb.extent().add(edge * 2));
	highlight.color = color;
	highlight.cachedImage = this.highlightImage(color, border);
	highlight.setPosition(fb.origin.subtract(new Point(edge, edge)));
	return highlight;
};

// BlockMorph zebra coloring

BlockMorph.prototype.fixBlockColor = function (nearestBlock, isForced) {
	var nearest = nearestBlock,
		clr,
		cslot;

	if (!this.zebraContrast && !isForced) {
		return;
	}
	if (!this.zebraContrast && isForced) {
		return this.forceNormalColoring(true);
	}

	if (!nearest) {
		if (this.parent) {
			if (this.isPrototype) {
				nearest = null; // this.parent; // the PrototypeHatBlockMorph
			} else if (this instanceof ReporterBlockMorph) {
				nearest = this.parent.parentThatIsA(BlockMorph);
			} else { // command
				cslot = this.parentThatIsA(CommandSlotMorph);
				if (cslot) {
					nearest = cslot.parentThatIsA(BlockMorph);
				}
			}
		}
	}
	if (!nearest) { // top block
		clr = this.colorFor(this.category);
		if (!this.color.eq(clr)) {
			this.alternateBlockColor();
		}
	} else if (nearest.category === this.category) {
		if (nearest.color.eq(this.color)) {
			this.alternateBlockColor();
		}
	} else if (this.category && !this.color.eq(
			this.colorFor(this.category)
		)) {
		this.alternateBlockColor();
	}
	if (isForced) {
		this.fixChildrensBlockColor(true);
	}
};

BlockMorph.prototype.forceNormalColoring = function () {
	var clr = this.colorFor(this.category);
	this.setColor(clr);
	this.setLabelColor(
		WHITE,
		clr.darker(this.labelContrast),
		ZERO
	);
	this.fixChildrensBlockColor(true);
};

BlockMorph.prototype.alternateBlockColor = function () {
	var clr = this.colorFor(this.category);

	if (this.color.eq(clr)) {
		this.setColor(
			this.zebraContrast < 0 ? clr.darker(Math.abs(this.zebraContrast))
				: clr.lighter(this.zebraContrast),
			this.hasLabels() // silently
		);
	} else {
		this.setColor(clr, this.hasLabels()); // silently
	}
	this.fixLabelColor();
	this.fixChildrensBlockColor(true); // has issues if not forced
};

BlockMorph.prototype.ghost = function () {
	this.setColor(
		this.colorFor(this.category).lighter(35)
	);
};

BlockMorph.prototype.fixLabelColor = function () {
	if (this.zebraContrast > 0 && this.category) {
		var clr = this.colorFor(this.category);
		if (this.color.eq(clr)) {
			this.setLabelColor(
				WHITE,
				clr.darker(this.labelContrast)
			);
		} else {
			this.setLabelColor(
				BLACK,
				clr.lighter(this.zebraContrast)
					.lighter(this.labelContrast * 2)
			);
		}
	}
};

BlockMorph.prototype.fixChildrensBlockColor = function (isForced) {
	this.children.forEach(morph => {
		if (morph instanceof CommandBlockMorph) {
			morph.fixBlockColor(null, isForced);
		} else if (morph instanceof SyntaxElementMorph) {
			morph.fixBlockColor(this, isForced);
			if (morph instanceof BooleanSlotMorph) {
				morph.fixLayout();
			}
		}
	});
};

BlockMorph.prototype.setCategory = function (aString) {
	this.category = aString;
	this.fixBlockColor();
};

BlockMorph.prototype.hasLabels = function () {
	return this.children.some(any => any instanceof StringMorph);
};

// BlockMorph copying

BlockMorph.prototype.fullCopy = function () {
	var ans = BlockMorph.uber.fullCopy.call(this);
	ans.removeHighlight();
	ans.isDraggable = true;
	if (this.instantiationSpec) {
		ans.setSpec(this.instantiationSpec);
	}
	ans.allChildren().filter(block => {
		if (block instanceof SyntaxElementMorph) {
			block.cachedInputs = null;
			if (block.isCustomBlock) {
				block.initializeVariables(block.variables.names());
			}
		}
		return !isNil(block.comment);
	}).forEach(block => {
		var cmnt = block.comment.fullCopy();
		block.comment = cmnt;
		cmnt.block = block;
	});
	ans.cachedInputs = null;
	return ans;
};

BlockMorph.prototype.reactToTemplateCopy = function () {
	if (this.isLocalVarTemplate) {
		this.isLocalVarTemplate = null;
		this.fixLayout();
	}
	this.forceNormalColoring();
};

BlockMorph.prototype.hasBlockVars = function () {
	return this.anyChild(any =>
		any.isCustomBlock && any.variables.names().length
	);
};

BlockMorph.prototype.pickUp = function (wrrld) {
	// used when duplicating and grabbing a block via its context menu
	// position the duplicate's top-left corner at the mouse pointer
	var world = wrrld || this.world();
	this.setPosition(world.hand.position().subtract(this.rounding));
	world.hand.grab(this);
};

// BlockMorph events

BlockMorph.prototype.mouseClickLeft = function () {
	alert('not implemented yet');
	return;

	var top = this.topBlock(),
		receiver = top.scriptTarget(),
		shiftClicked = this.world().currentKey === 16,
		stage;
	if (shiftClicked && !this.isTemplate) {
		return this.selectForEdit().focus(); // enable copy-on-edit
	}
	if (top instanceof PrototypeHatBlockMorph) {
		return; // top.mouseClickLeft();
	}
	if (receiver) {
		stage = receiver.parentThatIsA(StageMorph);
		if (stage) {
			stage.threads.toggleProcess(top, receiver);
		}
	}
};

BlockMorph.prototype.focus = function () {
	var scripts = this.parentThatIsA(ScriptsMorph),
		world = this.world(),
		focus;
	if (!scripts || !ScriptsMorph.prototype.enableKeyboard) {return; }
	if (scripts.focus) {scripts.focus.stopEditing(); }
	world.stopEditing();
	focus = new ScriptFocusMorph(scripts, this);
	scripts.focus = focus;
	focus.getFocus(world);
	if (this instanceof HatBlockMorph) {
		focus.nextCommand();
	}
};

// BlockMorph dragging and dropping

BlockMorph.prototype.rootForGrab = function () {
	return this;
};

/*
	for demo purposes, allows you to drop arg morphs onto
	blocks and forces a layout update. This section has
	no relevance in end user mode.
*/

BlockMorph.prototype.wantsDropOf = function (aMorph) {
	// override the inherited method
	return (aMorph instanceof ArgMorph
		|| aMorph instanceof StringMorph
		|| aMorph instanceof TextMorph
	) && !this.isTemplate;
};

BlockMorph.prototype.reactToDropOf = function (droppedMorph) {
	droppedMorph.isDraggable = false;
	droppedMorph.fixLayout();
	this.fixLayout();
	this.buildSpec();
};

BlockMorph.prototype.situation = function () {
	// answer a dictionary specifying where I am right now, so
	// I can slide back to it if I'm dropped somewhere else
	// NOTE: We can also add more key-value pairs to the situation
	// dictionary to support non-standard modes of user-interaction,
	// such as extracting single commands from within a stack
	// see recordDrop() and userExtractJustThis()
	if (!(this.parent instanceof TemplateSlotMorph)) {
		var scripts = this.parentThatIsA(ScriptsMorph);
		if (scripts) {
			return {
				origin: scripts,
				position: this.position().subtract(scripts.position())
			};
		}
	}
	return BlockMorph.uber.situation.call(this);
};

// BlockMorph sticky comments

BlockMorph.prototype.prepareToBeGrabbed = function (hand) {
	var wrld = hand ? hand.world : this.world();

	this.allInputs().forEach(input =>
		delete input.bindingID
	);
	this.allComments().forEach(comment =>
		comment.startFollowing(this, wrld)
	);
};

BlockMorph.prototype.justDropped = function () {
	delete this.alpha;
};

BlockMorph.prototype.allComments = function () {
	return this.allChildren().filter(block =>
		!isNil(block.comment)
	).map(block =>
		block.comment
	);
};

BlockMorph.prototype.destroy = function (justThis) {
	// private - use IDE_Morph.removeBlock() to first stop all my processes
	if (justThis) {
		if (!isNil(this.comment)) {
			this.comment.destroy();
		}
	} else {
		this.allComments().forEach(comment =>
			comment.destroy()
		);
	}
	BlockMorph.uber.destroy.call(this);
};

BlockMorph.prototype.stackHeight = function () {
	var fb = this.fullBounds(),
		commentsBottom = Math.max(this.allComments().map(comment =>
			comment.bottom()
		)) || this.bottom();
	return Math.max(fb.bottom(), commentsBottom) - fb.top();
};

BlockMorph.prototype.stackFullBounds = function () {
	var fb = this.fullBounds();
	this.allComments().forEach(comment =>
		fb.mergeWith(comment.bounds)
	);
	return fb;
};

BlockMorph.prototype.stackWidth = function () {
	var fb = this.fullBounds(),
		commentsRight = Math.max(this.allComments().map(comment =>
			comment.right()
		)) || this.right();
	return Math.max(fb.right(), commentsRight) - fb.left();
};

BlockMorph.prototype.snap = function () {
	var top = this.topBlock(),
		receiver,
		stage,
		ide;
	top.allComments().forEach(comment =>
		comment.align(top)
	);
	// fix highlights, if any
	if (this.getHighlight() && (this !== top)) {
		this.removeHighlight();
	}
	if (top.getHighlight()) {
		top.addHighlight(top.removeHighlight());
	}
};

// CommandBlockMorph ///////////////////////////////////////////////////

/*
	I am a stackable jigsaw-shaped block.

	I inherit from BlockMorph adding the following most important
	public accessors:

		nextBlock()		- set / get the block attached to my bottom
		bottomBlock()	- answer the bottom block of my stack
		blockSequence()	- answer an array of blocks starting with myself

	and the following "lexical awareness" indicators:

		partOfCustomCommand	- temporary bool set by the evaluator
		exitTag			- temporary string or number set by the evaluator
*/

// CommandBlockMorph inherits from BlockMorph:

CommandBlockMorph.prototype = new BlockMorph();
CommandBlockMorph.prototype.constructor = CommandBlockMorph;
CommandBlockMorph.uber = BlockMorph.prototype;

// CommandBlockMorph instance creation:

function CommandBlockMorph() {
	this.init();
}

CommandBlockMorph.prototype.init = function () {
	CommandBlockMorph.uber.init.call(this);

	this.bounds.setExtent(new Point(60, 24).multiplyBy(this.scale));
	this.fixLayout();
	this.rerender();

	this.partOfCustomCommand = false;
	this.exitTag = null;
};

// CommandBlockMorph enumerating:

CommandBlockMorph.prototype.blockSequence = function () {
	var sequence = [this],
		nb = this.nextBlock();
	while (nb) {
		sequence.push(nb);
		nb = nb.nextBlock();
	}
	return sequence;
};

CommandBlockMorph.prototype.bottomBlock = function () {
	// topBlock() also exists - inherited from SyntaxElementMorph
	if (this.nextBlock()) {
		return this.nextBlock().bottomBlock();
	}
	return this;
};

CommandBlockMorph.prototype.nextBlock = function (block) {
	// set / get the block attached to my bottom
	if (block) {
		var nb = this.nextBlock(),
			affected = this.parentThatIsA(CommandSlotMorph);
		this.add(block);
		if (nb) {
			block.bottomBlock().nextBlock(nb);
		}
		block.setPosition(
			new Point(
				this.left(),
				this.bottom() - (this.corner)
			)
		);
		if (affected) {
			affected.fixLayout();
		}
	} else {
		return detect(
			this.children,
			child => child instanceof CommandBlockMorph && !child.isPrototype
		);
	}
};

// CommandBlockMorph attach targets:

CommandBlockMorph.prototype.topAttachPoint = function () {
	return new Point(
		this.dentCenter(),
		this.top()
	);
};

CommandBlockMorph.prototype.bottomAttachPoint = function () {
	return new Point(
		this.dentCenter(),
		this.bottom()
	);
};

CommandBlockMorph.prototype.wrapAttachPoint = function () {
	var cslot = detect( // could be a method making uses of caching...
		this.inputs(), // ... although these already are cached
		each => each instanceof CSlotMorph
	);
	if (cslot && !cslot.nestedBlock()) {
		return new Point(
			cslot.left() + (cslot.inset * 2) + cslot.corner,
			cslot.top() + (cslot.corner * 2)
		);
	}
	return null;
};

CommandBlockMorph.prototype.dentLeft = function () {
	return this.left()
		+ this.corner
		+ this.inset;
};

CommandBlockMorph.prototype.dentCenter = function () {
	return this.dentLeft()
		+ this.corner
		+ (this.dent * 0.5);
};

CommandBlockMorph.prototype.attachTargets = function () {
	var answer = [],
		tp;
	if (!(this instanceof HatBlockMorph)) {
		tp = this.topAttachPoint();
		if (!(this.parent instanceof SyntaxElementMorph)) {
			answer.push({
				point: tp,
				element: this,
				loc: 'top',
				type: 'block'
			});
		}
		if (ScriptsMorph.prototype.enableNestedAutoWrapping ||
				!this.parentThatIsA(CommandSlotMorph)) {
			answer.push({
				point: tp,
				element: this,
				loc: 'wrap',
				type: 'block'
			});
		}
	}
	if (!this.isStop()) {
		answer.push({
			point: this.bottomAttachPoint(),
			element: this,
			loc: 'bottom',
			type: 'block'
		});
	}
	return answer;
};

CommandBlockMorph.prototype.allAttachTargets = function (newParent) {
	var target = newParent || this.parent,
		answer = [],
		topBlocks;

	if (this instanceof HatBlockMorph &&
		((newParent.rejectsHats && !this.isCustomBlockSpecific()) ||
			(!newParent.rejectsHats && this.isCustomBlockSpecific()))
	) {
		return answer;
	}
	topBlocks = target.children.filter(child =>
		(child !== this) &&
			child instanceof SyntaxElementMorph &&
				!child.isTemplate
	);
	topBlocks.forEach(block =>
		block.forAllChildren(child => {
			if (child.attachTargets) {
				child.attachTargets().forEach(at =>
					answer.push(at)
				);
			}
		})
	);
	return answer;
};

CommandBlockMorph.prototype.closestAttachTarget = function (newParent) {
	var target = newParent || this.parent,
		bottomBlock = this.bottomBlock(),
		answer = null,
		thresh = Math.max(
			this.corner * 2 + this.dent,
			this.minSnapDistance
		),
		dist,
		ref = [],
		minDist = 1000,
		wrap;

	if (!(this instanceof HatBlockMorph)) {
		ref.push(
			{
				point: this.topAttachPoint(),
				loc: 'top'
			}
		);
		wrap = this.wrapAttachPoint();
		if (wrap) {
			ref.push(
				{
					point: wrap,
					loc: 'wrap'
				}
			);
		}
	}
	if (!bottomBlock.isStop()) {
		ref.push(
			{
				point: bottomBlock.bottomAttachPoint(),
				loc: 'bottom'
			}
		);
	}
	this.allAttachTargets(target).forEach(eachTarget =>
		ref.forEach(eachRef => {
			// match: either both locs are 'wrap' or both are different,
			// none being 'wrap' (can this be expressed any better?)
			if ((eachRef.loc === 'wrap' && (eachTarget.loc === 'wrap')) ||
				((eachRef.loc !== eachTarget.loc) &&
					(eachRef.loc !== 'wrap') && (eachTarget.loc !== 'wrap'))
			) {
				dist = eachRef.point.distanceTo(eachTarget.point);
				if ((dist < thresh) && (dist < minDist)) {
					minDist = dist;
					answer = eachTarget;
				}
			}
		})
	);
	return answer;
};

CommandBlockMorph.prototype.snap = function (hand) {
	var target = this.closestAttachTarget(),
		scripts = this.parentThatIsA(ScriptsMorph),
		before,
		next,
		offsetY,
		cslot,
		affected;

	if (target === null) {
		this.fixBlockColor();
		CommandBlockMorph.uber.snap.call(this); // align stuck comments
		return;
	}
	if (target.loc === 'bottom') {
		if (target.type === 'slot') {
			this.removeHighlight();
			scripts.lastNextBlock = target.element.nestedBlock();
			target.element.nestedBlock(this);
		} else {
			scripts.lastNextBlock = target.element.nextBlock();
			target.element.nextBlock(this);
		}
		if (this.isStop()) {
			next = this.nextBlock();
			if (next) {
				scripts.add(next);
				next.moveBy(this.extent().floorDivideBy(2));
				affected = this.parentThatIsA(CommandSlotMorph);
				if (affected) {
					affected.fixLayout();
				}
			}
		}
	} else if (target.loc === 'top') {
		target.element.removeHighlight();
		offsetY = this.bottomBlock().bottom() - this.bottom();
		this.setBottom(target.element.top() + this.corner - offsetY);
		this.setLeft(target.element.left());
		this.bottomBlock().nextBlock(target.element);
	} else if (target.loc === 'wrap') {
		cslot = detect( // this should be a method making use of caching
			this.inputs(), // these are already cached, so maybe it's okay
			each => each instanceof CSlotMorph
		);
		// assume the cslot is (still) empty, was checked determining the target
		before = (target.element.parent);
		scripts.lastWrapParent = before;

		// adjust position of wrapping block
		this.moveBy(target.point.subtract(cslot.slotAttachPoint()));

		// wrap c-slot around target
		cslot.nestedBlock(target.element);
		if (before instanceof CommandBlockMorph) {
			before.nextBlock(this);
		} else if (before instanceof CommandSlotMorph) {
			before.nestedBlock(this);
		}

		// fix zebra coloring.
		// this could probably be generalized into the fixBlockColor mechanism
		target.element.blockSequence().forEach(cmd =>
			cmd.fixBlockColor()
		);
	}
	this.fixBlockColor();
	CommandBlockMorph.uber.snap.call(this); // align stuck comments
	if (this.snapSound) {
		this.snapSound.play();
	}
};

CommandBlockMorph.prototype.prepareToBeGrabbed = function (handMorph) {
	// check whether the shift-key is held down and if I can be "extracted"
	if (handMorph && handMorph.world.currentKey === 16 && this.nextBlock()) {
		this.extract(); // NOTE: no infinite recursion, because extract()
						// doesn't call this again with a hand
		handMorph.grabOrigin.action = 'extract'; // ???
		return;
	}

	var oldPos = this.position();

	CommandBlockMorph.uber.prepareToBeGrabbed.call(this, handMorph);
};

CommandBlockMorph.prototype.isStop = function () {
	var choice;
	if (this.selector === 'doStopThis') { // this could be cached...
		choice = this.inputs()[0].evaluate();
		return choice instanceof Array && choice[0].length < 12;
	}
	return ([
		'doForever',
		'doReport',
		'removeClone',
		'doSwitchToScene'
	].indexOf(this.selector) > -1);
};

// CommandBlockMorph deleting

CommandBlockMorph.prototype.userDestroy = function () {
	if (this.nextBlock()) {
		this.userDestroyJustThis();
		return;
	}

	var scripts = this.parentThatIsA(ScriptsMorph),
		parent = this.parentThatIsA(SyntaxElementMorph),
		cslot = this.parentThatIsA(CSlotMorph);

	this.prepareToBeGrabbed(); // fix outer ring reporter slot

	this.destroy();
	if (cslot) {
		cslot.fixLayout();
	}
	if (parent) {
		parent.reactToGrabOf(this); // fix highlight
	}
};

CommandBlockMorph.prototype.userDestroyJustThis = function () {
	// delete just this one block, reattach next block to the previous one,
	var scripts = this.parentThatIsA(ScriptsMorph),
		nb = this.nextBlock();

	// for undrop / redrop
	if (scripts) {
		scripts.clearDropInfo();
		scripts.lastDroppedBlock = this;
		scripts.recordDrop(this.situation());
		scripts.dropRecord.lastNextBlock = nb;
		scripts.dropRecord.action = 'delete';
	}

	this.extract();
};

CommandBlockMorph.prototype.userExtractJustThis = function () {
	// extract just this one block, reattach next block to the previous one,
	var situation = this.situation();
	situation.action = "extract"; // record how this block was retrieved
	this.extract();
	this.pickUp(situation.origin.world());
	this.parent.grabOrigin = situation;
};

CommandBlockMorph.prototype.extract = function () {
	// private: extract just this one block
	// reattach next block to the previous one,
	var scripts = this.parentThatIsA(ScriptsMorph),
		cs = this.parentThatIsA(CommandSlotMorph),
		pb,
		nb = this.nextBlock(),
		above,
		parent = this.parentThatIsA(SyntaxElementMorph),
		cslot = this.parentThatIsA(CSlotMorph);


	this.topBlock().fullChanged();
	if (this.parent) {
		pb = this.parent.parentThatIsA(CommandBlockMorph);
	}
	if (pb && (pb.nextBlock() === this)) {
		above = pb;
	} else if (cs && (cs.nestedBlock() === this)) {
		above = cs;
		this.prepareToBeGrabbed(); // restore ring reporter slot, if any
	}
	this.destroy(true); // just this block
	if (nb) {
		if (above instanceof CommandSlotMorph) {
			above.nestedBlock(nb);
		} else if (above instanceof CommandBlockMorph) {
			above.nextBlock(nb);
		} else {
			scripts.add(nb);
		}
	} else if (cslot) {
		cslot.fixLayout();
	}
	if (parent) {
		parent.reactToGrabOf(this); // fix highlight
	}
};

// CommandBlockMorph drawing:

CommandBlockMorph.prototype.outlinePath = function(ctx, inset) {
	var indent = this.corner * 2 + this.inset,
		bottom = this.height() - this.corner,
		bottomCorner = this.height() - this.corner * 2,
		radius = Math.max(this.corner - inset, 0),
		pos = this.position();

	// top left:
	ctx.arc(
		this.corner,
		this.corner,
		radius,
		radians(-180),
		radians(-90),
		false
	);

	// top dent:
	ctx.lineTo(this.corner + this.inset, inset);
	ctx.lineTo(indent, this.corner + inset);
	ctx.lineTo(indent + this.dent, this.corner + inset);
	ctx.lineTo(this.corner * 3 + this.inset + this.dent, inset);
	ctx.lineTo(this.width() - this.corner, inset);

	// top right:
	ctx.arc(
		this.width() - this.corner,
		this.corner,
		radius,
		radians(-90),
		radians(-0),
		false
	);

	// C-Slots
	this.cSlots().forEach(slot => {
		slot.outlinePath(ctx, inset, slot.position().subtract(pos));
	});

	// bottom right:
	ctx.arc(
		this.width() - this.corner,
		bottomCorner,
		radius,
		radians(0),
		radians(90),
		false
	);

	if (!this.isStop()) {
		ctx.lineTo(this.width() - this.corner, bottom - inset);
		ctx.lineTo(this.corner * 3 + this.inset + this.dent, bottom - inset);
		ctx.lineTo(indent + this.dent, bottom + this.corner - inset);
		ctx.lineTo(indent, bottom + this.corner - inset);
		ctx.lineTo(this.corner + this.inset, bottom - inset);
	}

	// bottom left:
	ctx.arc(
		this.corner,
		bottomCorner,
		radius,
		radians(90),
		radians(180),
		false
	);
};

CommandBlockMorph.prototype.drawEdges = function (ctx) {
	this.drawTopDentEdge(ctx, 0, 0);
	this.drawBottomDentEdge(ctx, 0, this.height() - this.corner);
	this.drawLeftEdge(ctx);
	this.drawRightEdge(ctx);
	this.drawTopLeftEdge(ctx);
	this.drawBottomRightEdge(ctx);
};

CommandBlockMorph.prototype.drawTopDentEdge = function (ctx, x, y) {
	var shift = this.edge * 0.5,
		indent = x + this.corner * 2 + this.inset,
		upperGradient,
		lowerGradient,
		leftGradient,
		lgx;

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	upperGradient = ctx.createLinearGradient(
		0,
		y,
		0,
		y + this.edge
	);
	upperGradient.addColorStop(0, this.cachedClrBright);
	upperGradient.addColorStop(1, this.cachedClr);

	ctx.strokeStyle = upperGradient;
	ctx.beginPath();
	ctx.moveTo(this.corner, y + shift);
	ctx.lineTo(x + this.corner + this.inset, y + shift);
	ctx.stroke();

	ctx.strokeStyle = upperGradient;
	ctx.beginPath();
	ctx.moveTo(
		x + this.corner * 3 + this.inset + this.dent + shift,
		y + shift
	);
	ctx.lineTo(this.width() - this.corner, y + shift);
	ctx.stroke();

	lgx = x + this.corner + this.inset;
	leftGradient = ctx.createLinearGradient(
		lgx - this.edge,
		y + this.edge,
		lgx,
		y
	);
	leftGradient.addColorStop(0, this.cachedClr);
	leftGradient.addColorStop(1, this.cachedClrBright);

	ctx.strokeStyle = leftGradient;
	ctx.beginPath();
	ctx.moveTo(x + this.corner + this.inset, y + shift);
	ctx.lineTo(indent, y + this.corner + shift);
	ctx.stroke();

	lowerGradient = ctx.createLinearGradient(
		0,
		y + this.corner,
		0,
		y + this.corner + this.edge
	);
	lowerGradient.addColorStop(0, this.cachedClrBright);
	lowerGradient.addColorStop(1, this.cachedClr);

	ctx.strokeStyle = lowerGradient;
	ctx.beginPath();
	ctx.moveTo(indent, y + this.corner + shift);
	ctx.lineTo(indent + this.dent, y + this.corner + shift);
	ctx.stroke();
};

CommandBlockMorph.prototype.drawBottomDentEdge = function (ctx, x, y) {
	var shift = this.edge * 0.5,
		indent = x + this.corner * 2 + this.inset,
		upperGradient,
		lowerGradient,
		rightGradient;

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	upperGradient = ctx.createLinearGradient(
		0,
		y - this.edge,
		0,
		y
	);
	upperGradient.addColorStop(0, this.cachedClr);
	upperGradient.addColorStop(1, this.cachedClrDark);

	ctx.strokeStyle = upperGradient;
	ctx.beginPath();
	ctx.moveTo(this.corner, y - shift);
	if (this.isStop()) {
		ctx.lineTo(this.width() - this.corner, y - shift);
	} else {
		ctx.lineTo(x + this.corner + this.inset - shift, y - shift);
	}
	ctx.stroke();

	if (this.isStop()) {	// draw straight bottom edge
		return null;
	}

	lowerGradient = ctx.createLinearGradient(
		0,
		y + this.corner - this.edge,
		0,
		y + this.corner
	);
	lowerGradient.addColorStop(0, this.cachedClr);
	lowerGradient.addColorStop(1, this.cachedClrDark);

	ctx.strokeStyle = lowerGradient;
	ctx.beginPath();
	ctx.moveTo(indent + shift, y + this.corner - shift);
	ctx.lineTo(indent + this.dent, y + this.corner - shift);
	ctx.stroke();

	rightGradient = ctx.createLinearGradient(
		x + indent + this.dent - this.edge,
		y + this.corner - this.edge,
		x + indent + this.dent,
		y + this.corner
	);
	rightGradient.addColorStop(0, this.cachedClr);
	rightGradient.addColorStop(1, this.cachedClrDark);

	ctx.strokeStyle = rightGradient;
	ctx.beginPath();
	ctx.moveTo(x + indent + this.dent, y + this.corner - shift);
	ctx.lineTo(
		x + this.corner * 3 + this.inset + this.dent,
		y - shift
	);
	ctx.stroke();

	ctx.strokeStyle = upperGradient;
	ctx.beginPath();
	ctx.moveTo(
		x + this.corner * 3 + this.inset + this.dent,
		y - shift
	);
	ctx.lineTo(this.width() - this.corner, y - shift);
	ctx.stroke();
};

CommandBlockMorph.prototype.drawFlatBottomDentEdge = function (ctx) {
	if (!this.isStop()) {
		ctx.fillStyle = this.color.darker(this.contrast / 2).toString();
		ctx.beginPath();
		this.drawDent(ctx, 0, this.height() - this.corner);
		ctx.closePath();
		ctx.fill();
	}
};

CommandBlockMorph.prototype.drawLeftEdge = function (ctx) {
	var shift = this.edge * 0.5,
		gradient = ctx.createLinearGradient(0, 0, this.edge, 0);

	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(shift, this.corner);
	ctx.lineTo(shift, this.height() - this.corner * 2 - shift);
	ctx.stroke();
};

CommandBlockMorph.prototype.drawRightEdge = function (ctx) {
	var shift = this.edge * 0.5,
		cslots = this.cSlots(),
		top = this.top(),
		x = this.width(),
		y,
		gradient;

	gradient = ctx.createLinearGradient(x - this.edge, 0, x, 0);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = gradient;

	if (cslots.length) {
		ctx.beginPath();
		ctx.moveTo(x - shift, this.corner + shift);
		cslots.forEach(slot => {
			y = slot.top() - top;
			ctx.lineTo(x - shift, y);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x - shift, y + slot.height());
		});
	} else {
		ctx.beginPath();
		ctx.moveTo(x - shift, this.corner + shift);
	}
	ctx.lineTo(x - shift, this.height() - this.corner * 2);
	ctx.stroke();
};

CommandBlockMorph.prototype.drawTopLeftEdge = function (ctx) {
	var shift = this.edge * 0.5,
		gradient;

	gradient = ctx.createRadialGradient(
		this.corner,
		this.corner,
		this.corner,
		this.corner,
		this.corner,
		this.corner - this.edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.strokeStyle = gradient;

	ctx.beginPath();
	ctx.arc(
		this.corner,
		this.corner,
		this.corner - shift,
		radians(-180),
		radians(-90),
		false
	);
	ctx.stroke();
};

CommandBlockMorph.prototype.drawBottomRightEdge = function (ctx) {
	var shift = this.edge * 0.5,
		x = this.width() - this.corner,
		y = this.height() - this.corner * 2,
		gradient;

	gradient = ctx.createRadialGradient(
		x,
		y,
		this.corner,
		x,
		y,
		this.corner - this.edge
	);
	gradient.addColorStop(0, this.cachedClrDark);
	gradient.addColorStop(1, this.cachedClr);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.strokeStyle = gradient;

	ctx.beginPath();
	ctx.arc(
		x,
		y,
		this.corner - shift,
		radians(90),
		radians(0),
		true
	);
	ctx.stroke();
};

// HatBlockMorph ///////////////////////////////////////////////////////

/*
	I am a script's top most block. I can attach command blocks at my
	bottom, but not on top.

*/

// HatBlockMorph inherits from CommandBlockMorph:

HatBlockMorph.prototype = new CommandBlockMorph();
HatBlockMorph.prototype.constructor = HatBlockMorph;
HatBlockMorph.uber = CommandBlockMorph.prototype;

// HatBlockMorph instance creation:

function HatBlockMorph() {
	this.init();
}

HatBlockMorph.prototype.init = function () {
	// additional property for generic hat block variations
	this.isLoaded = null; // for hat blocks with event-semantics

	HatBlockMorph.uber.init.call(this);
	this.bounds.setExtent(new Point(120, 36).multiplyBy(this.scale));
	this.fixLayout();
	this.rerender();
};

// HatBlockMorph enumerating:

HatBlockMorph.prototype.blockSequence = function (forSyntax) {
	// override my inherited method so that I am not part of my sequence
	var result;
	if (forSyntax) {
		return HatBlockMorph.uber.blockSequence.call(this);
	}
	if (this.isCustomBlock || this.selector.startsWith('receiveCondition')) {
		return this;
	}
	result = HatBlockMorph.uber.blockSequence.call(this);
	result.shift();
	return result;
};

// HatBlockMorph accessing:

HatBlockMorph.prototype.isCustomBlockSpecific = function () {
	return this.selector === 'receiveSlotEvent';
};

HatBlockMorph.prototype.isRuleHat = function () {
	return this.selector === 'receiveCondition';
};

// HatBlockMorph drawing:

HatBlockMorph.prototype.outlinePath = function(ctx, inset) {
	var indent = this.corner * 2 + this.inset,
		bottom = this.height() - this.corner,
		bottomCorner = this.height() - this.corner * 2,
		radius = Math.max(this.corner - inset, 0),
		s = this.hatWidth,
		h = this.hatHeight,
		r = ((4 * h * h) + (s * s)) / (8 * h),
		a = degrees(4 * Math.atan(2 * h / s)),
		sa = a / 2,
		sp = Math.min(s * 1.7, this.width() - this.corner),
		pos = this.position();


	// top arc:
	ctx.moveTo(inset, h + this.corner);
	ctx.arc(
		s / 2,
		r,
		r,
		radians(-sa - 90),
		radians(-90),
		false
	);
	ctx.bezierCurveTo(
		s,
		0,
		s,
		h,
		sp,
		h
	);

	// top right:
	ctx.arc(
		this.width() - this.corner,
		h + this.corner,
		radius,
		radians(-90),
		radians(-0),
		false
	);

	// C-Slots
	this.cSlots().forEach(slot => {
		slot.outlinePath(ctx, inset, slot.position().subtract(pos));
	});

	// bottom right:
	ctx.arc(
		this.width() - this.corner,
		bottomCorner,
		radius,
		radians(0),
		radians(90),
		false
	);

	if (!this.isStop()) {
		ctx.lineTo(this.width() - this.corner, bottom - inset);
		ctx.lineTo(this.corner * 3 + this.inset + this.dent, bottom - inset);
		ctx.lineTo(indent + this.dent, bottom + this.corner - inset);
		ctx.lineTo(indent, bottom + this.corner - inset);
		ctx.lineTo(this.corner + this.inset, bottom - inset);
	}

	// bottom left:
	ctx.arc(
		this.corner,
		bottomCorner,
		radius,
		radians(90),
		radians(180),
		false
	);
};

HatBlockMorph.prototype.drawLeftEdge = function (ctx) {
	var shift = this.edge * 0.5,
		gradient = ctx.createLinearGradient(0, 0, this.edge, 0);

	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(shift, this.hatHeight + shift);
	ctx.lineTo(shift, this.height() - this.corner * 2 - shift);
	ctx.stroke();
};

HatBlockMorph.prototype.drawRightEdge = function (ctx) {
	var shift = this.edge * 0.5,
		x = this.width(), y,
		cslots = this.cSlots(),
		gradient;

	gradient = ctx.createLinearGradient(x - this.edge, 0, x, 0);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(x - shift, this.corner + this.hatHeight + shift);
	if (cslots.length) {
		cslots.forEach(slot => {
			y = slot.top() - top;
			ctx.lineTo(x - shift, y);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x - shift, y + slot.height());
		});
	}
	ctx.lineTo(x - shift, this.height() - this.corner * 2);
	ctx.stroke();
};

HatBlockMorph.prototype.drawTopDentEdge = nop;

HatBlockMorph.prototype.drawTopLeftEdge = function (ctx) {
	var shift = this.edge * 0.5,
		s = this.hatWidth,
		h = this.hatHeight,
		r = ((4 * h * h) + (s * s)) / (8 * h),
		a = degrees(4 * Math.atan(2 * h / s)),
		sa = a / 2,
		sp = Math.min(s * 1.7, this.width() - this.corner),
		gradient;

	gradient = ctx.createRadialGradient(
		s / 2,
		r,
		r - this.edge,
		s / 2,
		r,
		r
	);
	gradient.addColorStop(1, this.cachedClrBright);
	gradient.addColorStop(0, this.cachedClr);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.arc(
		Math.round(s / 2),
		r,
		r - shift,
		radians(-sa - 90),
		radians(-90),
		false
	);
	ctx.moveTo(s / 2, shift);
	ctx.bezierCurveTo(
		s,
		shift,
		s,
		h + shift,
		sp,
		h + shift
	);
	ctx.lineTo(this.width() - this.corner, h + shift);
	ctx.stroke();
};

BlockMorph.prototype.drawRuleIcon = function (ctx) {
	var h = this.hatHeight * 0.8,
		l = Math.max(h / 4, 1),
		r = h / 2,
		x = (this.hatWidth - h * 1.75) * 0.55,
		y = h / 2,
		isNormal =
			this.color === this.colorFor(this.category);

	ctx.lineWidth = l;
	// ctx.strokeStyle = color.toString();
	ctx.strokeStyle = isNormal ? this.cachedClrBright : this.cachedClrDark;

	// left arc
	ctx.beginPath();
	ctx.arc(x + r, y + r, r - l / 2, radians(60), radians(360), false);
	ctx.stroke();

	// right arc
	ctx.beginPath();
	ctx.arc(
		x + r * 3 - l,
		y + r,
		r - l / 2,
		radians(-120),
		radians(180), false
	);
	ctx.stroke();
};

// ReporterBlockMorph //////////////////////////////////////////////////

/*
	I am a block with a return value, either round-ish or diamond shaped
	I inherit all my important accessors from BlockMorph
*/

// ReporterBlockMorph inherits from BlockMorph:

ReporterBlockMorph.prototype = new BlockMorph();
ReporterBlockMorph.prototype.constructor = ReporterBlockMorph;
ReporterBlockMorph.uber = BlockMorph.prototype;

// ReporterBlockMorph instance creation:

function ReporterBlockMorph(isPredicate) {
	this.init(isPredicate);
}

ReporterBlockMorph.prototype.init = function (isPredicate) {
	ReporterBlockMorph.uber.init.call(this);
	this.isPredicate = isPredicate || false;

	this.bounds.setExtent(new Point(50, 22).multiplyBy(this.scale));
	this.fixLayout();
	this.rerender();

	this.cachedSlotSpec = null; // don't serialize
	this.isLocalVarTemplate = null; // don't serialize
};

// ReporterBlockMorph drag & drop:

ReporterBlockMorph.prototype.snap = function (hand) {
	// passing the hand is optional (for when blocks are dragged & dropped)
	var scripts = this.parent,
		nb,
		target;

	this.cachedSlotSpec = null;
	if (!(scripts instanceof ScriptsMorph)) {
		return null;
	}

	target = scripts.closestInput(this, hand);
	if (target !== null) {
		scripts.lastReplacedInput = target;
		scripts.lastDropTarget = target.parent;
		if (target instanceof MultiArgMorph) {
			scripts.lastPreservedBlocks = target.inputs();
			scripts.lastReplacedInput = target.fullCopy();
		} else if (target instanceof CommandSlotMorph) {
			scripts.lastReplacedInput = target;
			nb = target.nestedBlock();
			if (nb) {
				nb = nb.fullCopy();
				scripts.add(nb);
				nb.moveBy(nb.extent());
				nb.fixBlockColor();
				scripts.lastPreservedBlocks = [nb];
			}
		}
		target.parent.replaceInput(target, this);
		if (this.snapSound) {
			this.snapSound.play();
		}
	}
	this.fixBlockColor();
	ReporterBlockMorph.uber.snap.call(this);
};

ReporterBlockMorph.prototype.prepareToBeGrabbed = function (handMorph) {
	var oldPos = this.position();

	if ((this.parent instanceof BlockMorph) || (this.parent instanceof MultiArgMorph)) {
		this.parent.revertToDefaultInput(this);
		this.setPosition(oldPos);
	}
	ReporterBlockMorph.uber.prepareToBeGrabbed.call(this, handMorph);
	if (handMorph) {
		handMorph.alpha = this.alpha < 1 ? 1 : 0.85;
	}
	this.cachedSlotSpec = null;
};

// ReporterBlockMorph enumerating

ReporterBlockMorph.prototype.blockSequence = function () {
	// reporters don't have a sequence, answer myself
	return this;
};

// ReporterBlockMorph evaluating

ReporterBlockMorph.prototype.isLocked = function () {
	// answer true if I can be exchanged by a dropped reporter
	return this.isStatic || (this.getSlotSpec() === '%t');
};

ReporterBlockMorph.prototype.getSlotSpec = function () {
	// answer the spec of the slot I'm in, if any
	// cached for performance
	if (!this.cachedSlotSpec) {
		this.cachedSlotSpec = this.determineSlotSpec();
	/*
	} else {
		// debug slot spec caching
		var real = this.determineSlotSpec();
		if (real !== this.cachedSlotSpec) {
			throw new Error(
				'cached slot spec ' +
				this.cachedSlotSpec +
				' does not match: ' +
				real
			);
		}
	*/
	}
	return this.cachedSlotSpec;
};

ReporterBlockMorph.prototype.determineSlotSpec = function () {
	// private - answer the spec of the slot I'm in, if any
	var parts, idx;
	if (this.parent instanceof BlockMorph) {
		parts = this.parent.parts().filter(part =>
			!(part instanceof BlockHighlightMorph)
		);
		idx = parts.indexOf(this);
		if (idx !== -1) {
			if (this.parent.blockSpec) {
				return this.parseSpec(this.parent.blockSpec)[idx];
			}
		}
	}
	if (this.parent instanceof MultiArgMorph) {
		if (this.parent.slotSpec instanceof Array) { // input group
			idx = this.parent.inputs().indexOf(this);
			parts = this.parent.slotSpec;
			return parts[idx % parts.length];
		}
		return this.parent.slotSpec;
	}
	if (this.parent instanceof TemplateSlotMorph) {
		return this.parent.getSpec();
	}
	return '';
};

// ReporterBlockMorph events

ReporterBlockMorph.prototype.mouseClickLeft = function (pos) {
	alert('not implemented yet');
	return;
	var label;
	if (this.parent instanceof BlockInputFragmentMorph) {
		return this.parent.mouseClickLeft();
	}
	if (this.parent instanceof TemplateSlotMorph) {
		if (this.parent.parent.elementSpec === '%blockVars') {
			label = "Block variable name";
		} else {
			label = "Script variable name";
		}
		new DialogBoxMorph(
			this,
			this.userSetSpec,
			this
		).prompt(
			label,
			this.blockSpec,
			this.world()
		);
	} else {
		ReporterBlockMorph.uber.mouseClickLeft.call(this, pos);
	}
};

// ReporterBlockMorph deleting

ReporterBlockMorph.prototype.userDestroy = function () {
	// make sure to restore default slot of parent block
	var parent;

	parent = this.parentThatIsA(SyntaxElementMorph);
	if (parent) {
		this.parent.reactToGrabOf(this); // fix highlight and variadic case
	}

	// for undrop / redrop
	var scripts = this.parentThatIsA(ScriptsMorph);
	if (scripts) {
		scripts.clearDropInfo();
		scripts.lastDroppedBlock = this;
		scripts.recordDrop(this.situation());
		scripts.dropRecord.action = 'delete';
	}

	this.topBlock().fullChanged();
	this.prepareToBeGrabbed(this.world().hand);
	this.destroy();
};

// ReporterBlockMorph drawing:

ReporterBlockMorph.prototype.outlinePath = function (ctx, inset) {
	if (this.isPredicate) {
		this.outlinePathDiamond(ctx, inset);
	} else {
		this.outlinePathOval(ctx, inset);
	}
};

ReporterBlockMorph.prototype.outlinePathOval = function (ctx, inset) {
	// draw the 'flat' shape
	var h = this.height(),
		r = Math.min(this.rounding, h / 2),
		radius = Math.max(r - inset, 0),
		w = this.width(),
		pos = this.position();

	// top left:
	ctx.arc(
		r,
		r,
		radius,
		radians(-180),
		radians(-90),
		false
	);

	// top right:
	ctx.arc(
		w - r,
		r,
		radius,
		radians(-90),
		radians(-0),
		false
	);

	// C-Slots
	this.cSlots().forEach(slot => {
		slot.outlinePath(ctx, inset, slot.position().subtract(pos));
	});

	// bottom right:
	ctx.arc(
		w - r,
		h - r,
		radius,
		radians(0),
		radians(90),
		false
	);

	// bottom left:
	ctx.arc(
		r,
		h - r,
		radius,
		radians(90),
		radians(180),
		false
	);

	ctx.lineTo(r - radius, r); // close the path so we can clip it for rings
};

ReporterBlockMorph.prototype.outlinePathDiamond = function (ctx, inset) {
	// draw the 'flat' shape:
	var w = this.width(),
		h = this.height(),
		h2 = Math.floor(h / 2),
		r = this.rounding,
		right = w - r,
		pos = this.position(),
		cslots = this.cSlots();

	ctx.moveTo(inset, h2);
	ctx.lineTo(r, inset);
	ctx.lineTo(right - inset, inset);

	if (cslots.length) {
		this.cSlots().forEach(slot => {
			slot.outlinePath(ctx, inset, slot.position().subtract(pos));
		});
	} else {
		ctx.lineTo(w - inset, h2);
	}

	ctx.lineTo(right - inset, h - inset);
	ctx.lineTo(r, h - inset);
};

ReporterBlockMorph.prototype.drawEdges = function (ctx) {
	if (this.isPredicate) {
		this.drawEdgesDiamond(ctx);
	} else {
		this.drawEdgesOval(ctx);
	}
};

ReporterBlockMorph.prototype.drawEdgesOval = function (ctx) {
	// add 3D-Effect
	var h = this.height(),
		r = Math.max(Math.min(this.rounding, h / 2), this.edge),
		w = this.width(),
		shift = this.edge / 2,
		y,
		top = this.top(),
		cslots = this.cSlots(),
		gradient;

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	// half-tone edges
	// bottem left corner
	gradient = ctx.createRadialGradient(
		r,
		h - r,
		r - this.edge,
		r,
		h - r,
		r + this.edge
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrBright);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.arc(
		r,
		h - r,
		r - shift,
		radians(90),
		radians(180),
		false
	);
	ctx.stroke();

	// top right corner
	gradient = ctx.createRadialGradient(
		w - r,
		r,
		r - this.edge,
		w - r,
		r,
		r + this.edge
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.arc(
		w - r,
		r,
		r - shift,
		radians(-90),
		radians(0),
		false
	);
	ctx.stroke();

	// normal gradient edges

	// top edge: straight line
	gradient = ctx.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(r - shift, shift);
	ctx.lineTo(w - r + shift, shift);
	ctx.stroke();

	// top edge: left corner
	gradient = ctx.createRadialGradient(
		r,
		r,
		r - this.edge,
		r,
		r,
		r
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrBright);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.arc(
		r,
		r,
		r - shift,
		radians(180),
		radians(270),
		false
	);
	ctx.stroke();

	// bottom edge: right corner
	gradient = ctx.createRadialGradient(
		w - r,
		h - r,
		r - this.edge,
		w - r,
		h - r,
		r
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.arc(
		w - r,
		h - r,
		r - shift,
		radians(0),
		radians(90),
		false
	);
	ctx.stroke();

	// bottom edge: straight line
	gradient = ctx.createLinearGradient(
		0,
		h - this.edge,
		0,
		h
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(r - shift, h - shift);
	ctx.lineTo(w - r + shift, h - shift);
	ctx.stroke();

	// left edge: straight vertical line
	gradient = ctx.createLinearGradient(0, 0, this.edge, 0);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(shift, r);
	ctx.lineTo(shift, h - r);
	ctx.stroke();

	// right edge: straight vertical line
	gradient = ctx.createLinearGradient(w - this.edge, 0, w, 0);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	ctx.strokeStyle = gradient;

	if (cslots.length) {
		ctx.beginPath();
		ctx.moveTo(w - shift, r + shift);
		cslots.forEach(slot => {
			y = slot.top() - top;
			ctx.lineTo(w - shift, y);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(w - shift, y + slot.height());
		});
	} else {
		ctx.beginPath();
		ctx.moveTo(w - shift, r + shift);
	}

	ctx.lineTo(w - shift, h - r);
	ctx.stroke();
};

ReporterBlockMorph.prototype.drawEdgesDiamond = function (ctx) {
	// add 3D-Effec
	var w = this.width(),
		h = this.height(),
		h2 = Math.floor(h / 2),
		r = this.rounding,
		shift = this.edge / 2,
		cslots = this.cSlots(),
		top = this.top(),
		y,
		gradient;

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	// half-tone edges
	// bottom left corner
	gradient = ctx.createLinearGradient(
		-r,
		0,
		r,
		0
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(shift, h2);
	ctx.lineTo(r, h - shift);
	ctx.closePath();
	ctx.stroke();

	// normal gradient edges
	// top edge: left corner
	gradient = ctx.createLinearGradient(
		0,
		0,
		r,
		0
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(shift, h2);
	ctx.lineTo(r, shift);
	ctx.closePath();
	ctx.stroke();

	// top edge: straight line
	gradient = ctx.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(r, shift);

	// right edge
	if (cslots.length) {
		// end of top edge
		ctx.lineTo(w - r - shift, shift);
		ctx.closePath();
		ctx.stroke();

		// right vertical edge
		gradient = ctx.createLinearGradient(w - r - this.edge, 0, w - r, 0);
		gradient.addColorStop(0, this.cachedClr);
		gradient.addColorStop(1, this.cachedClrDark);

		ctx.lineWidth = this.edge;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.strokeStyle = gradient;

		ctx.beginPath();
		ctx.moveTo(w - r - shift, this.edge + shift);
		cslots.forEach(slot => {
			y = slot.top() - top;
			ctx.lineTo(w - r - shift, y);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(w - r - shift, y + slot.height());
		});
		ctx.lineTo(w - r - shift, h - shift);
		ctx.stroke();
	} else {
		// end of top edge
		ctx.lineTo(w - r, shift);
		ctx.closePath();
		ctx.stroke();

		// top diagonal slope right
		gradient = ctx.createLinearGradient(
			w - r,
			0,
			w + r,
			0
		);
		gradient.addColorStop(0, this.cachedClr);
		gradient.addColorStop(1, this.cachedClrDark);
		ctx.strokeStyle = gradient;
		ctx.beginPath();
		ctx.moveTo(w - shift, h2);
		ctx.lineTo(w - r, shift);
		ctx.closePath();
		ctx.stroke();

		// bottom diagonal slope right
		gradient = ctx.createLinearGradient(
			w - r,
			0,
			w,
			0
		);
		gradient.addColorStop(0, this.cachedClr);
		gradient.addColorStop(1, this.cachedClrDark);
		ctx.strokeStyle = gradient;
		ctx.beginPath();
		ctx.moveTo(w - r, h - shift);
		ctx.lineTo(w - shift, h2);
		ctx.closePath();
		ctx.stroke();
	}

	// bottom edge: straight line
	gradient = ctx.createLinearGradient(
		0,
		h - this.edge,
		0,
		h
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(r + shift, h - shift);
	ctx.lineTo(w - r - shift, h - shift);
	ctx.closePath();
	ctx.stroke();
};

// ScriptsMorph ////////////////////////////////////////////////////////

/*
	I give feedback about possible drop targets and am in charge
	of actually snapping blocks together.

	My children are the top blocks of scripts.

	I store a back-pointer to my owner, i.e. the object (sprite)
	to whom my scripts apply.
*/

// ScriptsMorph inherits from FrameMorph:

ScriptsMorph.prototype = new FrameMorph();
ScriptsMorph.prototype.constructor = ScriptsMorph;
ScriptsMorph.uber = FrameMorph.prototype;

// ScriptsMorph preference settings

ScriptsMorph.prototype.cleanUpMargin = 20;
ScriptsMorph.prototype.cleanUpSpacing = 15;
ScriptsMorph.prototype.isPreferringEmptySlots = true;
ScriptsMorph.prototype.enableKeyboard = true;
ScriptsMorph.prototype.enableNestedAutoWrapping = true;
ScriptsMorph.prototype.feedbackColor = WHITE;

// ScriptsMorph instance creation:

function ScriptsMorph() {
	this.init();
}

ScriptsMorph.prototype.init = function () {
	this.feedbackMorph = new BoxMorph();
	this.rejectsHats = false;

	// "undrop" attributes:
	this.lastDroppedBlock = null;
	this.lastReplacedInput = null;
	this.lastDropTarget = null;
	this.lastPreservedBlocks = null;
	this.lastNextBlock = null;
	this.lastWrapParent = null;

	// keyboard editing support:
	this.focus = null;

	ScriptsMorph.uber.init.call(this);
	this.setColor(new Color(70, 70, 70));

	// initialize "undrop" queue
	this.isAnimating = false;
};

// ScriptsMorph deep copying:

ScriptsMorph.prototype.fullCopy = function () {
	var cpy = new ScriptsMorph(),
		pos = this.position(),
		child;
	if (this.focus) {
		this.focus.stopEditing();
	}
	this.children.forEach(morph => {
		if (!morph.block) { // omit anchored comments
			child = morph.fullCopy();
			cpy.add(child);
			child.setPosition(morph.position().subtract(pos));
			if (child instanceof BlockMorph) {
				child.allComments().forEach(comment =>
					comment.align(child)
				);
			}
		}
	});
	cpy.adjustBounds();
	return cpy;
};

// ScriptsMorph rendering:

ScriptsMorph.prototype.render = function (aContext) {
	aContext.fillStyle = this.getRenderColor().toString();
	aContext.fillRect(0, 0, this.width(), this.height());
	if (this.cachedTexture) {
		this.renderCachedTexture(aContext);
	} else if (this.texture) {
		this.renderTexture(this.texture, aContext);
	}
};

ScriptsMorph.prototype.getRenderColor = function () {
	return this.color;
};

ScriptsMorph.prototype.renderCachedTexture = function (ctx) {
	// support blocks-to-text slider
	if (SyntaxElementMorph.prototype.alpha > 0.8) {
		ScriptsMorph.uber.renderCachedTexture.call(this, ctx);
	}
};

// ScriptsMorph stepping:

ScriptsMorph.prototype.step = function () {
	var world = this.world(),
		hand = world.hand,
		block;

	if (this.feedbackMorph.parent) {
		this.feedbackMorph.destroy();
		this.feedbackMorph.parent = null;
	}
	if (this.focus && !world.keyboardFocus) {
		this.focus.getFocus(world);
	}
	if (hand.children.length === 0) {
		return null;
	}
	if (!this.bounds.containsPoint(hand.bounds.origin)) {
		return null;
	}
	block = hand.children[0];
	if (!(block instanceof BlockMorph)) {
		return null;
	}
	if (!contains(hand.morphAtPointer().allParents(), this)) {
		return null;
	}
	if (block instanceof ReporterBlockMorph) {
		this.showReporterDropFeedback(block, hand);
	} else {
		this.showCommandDropFeedback(block);
	}
};

ScriptsMorph.prototype.showReporterDropFeedback = function (block, hand) {
	var target = this.closestInput(block, hand);

	if (target === null) {
		return null;
	}
	this.feedbackMorph.edge = SyntaxElementMorph.prototype.rounding;
	this.feedbackMorph.border = Math.max(
		SyntaxElementMorph.prototype.edge,
		3
	);
	if (target instanceof MultiArgMorph) {
		this.feedbackMorph.color =
			SpriteMorph.prototype.blockColor.lists.copy();
		this.feedbackMorph.borderColor =
			SpriteMorph.prototype.blockColor.lists;
		target = target.arrows();
	} else {
		this.feedbackMorph.color = this.feedbackColor.copy();
		this.feedbackMorph.borderColor = this.feedbackColor;
	}
	this.feedbackMorph.bounds = target.fullBounds()
		.expandBy(Math.max(
			block.edge * 2,
			block.reporterDropFeedbackPadding
		));
	this.feedbackMorph.color.a = 0.5;
	this.feedbackMorph.rerender();
	this.add(this.feedbackMorph);
};

ScriptsMorph.prototype.showCommandDropFeedback = function (block) {
	var y, target;

	target = block.closestAttachTarget(this);
	if (!target) {
		return null;
	}
	if (target.loc === 'wrap') {
		this.showCSlotWrapFeedback(block, target.element);
		return;
	}
	this.add(this.feedbackMorph);
	this.feedbackMorph.border = 0;
	this.feedbackMorph.edge = 0;
	this.feedbackMorph.alpha = 1;
	this.feedbackMorph.bounds.setWidth(target.element.width());
	this.feedbackMorph.bounds.setHeight(Math.max(
			SyntaxElementMorph.prototype.corner,
			SyntaxElementMorph.prototype.feedbackMinHeight
		)
	);
	this.feedbackMorph.color = this.feedbackColor;
	y = target.point.y;
	if (target.loc === 'bottom') {
		if (target.type === 'block') {
			if (target.element.nextBlock()) {
				y -= SyntaxElementMorph.prototype.corner;
			}
		} else if (target.type === 'slot') {
			if (target.element.nestedBlock()) {
				y -= SyntaxElementMorph.prototype.corner;
			}
		}
	}
	this.feedbackMorph.setPosition(new Point(
		target.element.left(),
		y
	));
};

ScriptsMorph.prototype.showCommentDropFeedback = function (comment, hand) {
	var target = this.closestBlock(comment, hand);
	if (!target) {
		return null;
	}

	this.feedbackMorph.bounds = target.bounds
		.expandBy(Math.max(
			BlockMorph.prototype.edge * 2,
			BlockMorph.prototype.reporterDropFeedbackPadding
		));
	this.feedbackMorph.edge = SyntaxElementMorph.prototype.rounding;
	this.feedbackMorph.border = Math.max(
		SyntaxElementMorph.prototype.edge,
		3
	);
	this.add(this.feedbackMorph);
	this.feedbackMorph.color = comment.color.copy();
	this.feedbackMorph.color.a = 0.25;
	this.feedbackMorph.borderColor = comment.titleBar.color;
	this.feedbackMorph.rerender();
};

ScriptsMorph.prototype.showCSlotWrapFeedback = function (srcBlock, trgBlock) {
	var clr;
	this.feedbackMorph.bounds = trgBlock.fullBounds()
		.expandBy(BlockMorph.prototype.corner);
	this.feedbackMorph.edge = SyntaxElementMorph.prototype.corner;
	this.feedbackMorph.border = Math.max(
		SyntaxElementMorph.prototype.edge,
		3
	);
	this.add(this.feedbackMorph);
	clr = srcBlock.color.lighter(40);
	this.feedbackMorph.color = clr.copy();
	this.feedbackMorph.color.a = 0.1;
	this.feedbackMorph.borderColor = clr;
	this.feedbackMorph.rerender();
};

ScriptsMorph.prototype.closestInput = function (reporter, hand) {
	// passing the hand is optional (when dragging reporters)
	var fb = reporter.fullBoundsNoShadow(),
		stacks = this.children.filter(child =>
			(child instanceof BlockMorph) &&
				(child.fullBounds().intersects(fb))
		),
		blackList = reporter.allInputs(),
		handPos,
		target,
		all;

	all = [];
	stacks.forEach(stack =>
		all = all.concat(stack.allInputs())
	);
	if (all.length === 0) {return null; }

	function touchingVariadicArrowsIfAny(inp, point) {
		if (inp instanceof MultiArgMorph) {
			if (point) {
				return inp.arrows().bounds.containsPoint(point);
			}
			return inp.arrows().bounds.intersects(fb);
		}
		return true;
	}

	if (this.isPreferringEmptySlots) {
		if (hand) {
			handPos = hand.position();
			target = detect(
				all,
				input => (input instanceof InputSlotMorph ||
						(input instanceof ArgMorph &&
							!(input instanceof CommandSlotMorph) &&
							!(input instanceof MultiArgMorph)
						) || input.isEmptySlot()
					) &&
						!input.isLocked() &&
							input.bounds.containsPoint(handPos) &&
								!contains(blackList, input)
			);
			if (target) {
				return target;
			}
		}
		target = detect(
			all,
			input => (input instanceof InputSlotMorph ||
					input instanceof ArgMorph ||
					input.isEmptySlot()
				) &&
					!input.isLocked() &&
						input.bounds.intersects(fb) &&
							!contains(blackList, input) &&
								touchingVariadicArrowsIfAny(input, handPos)
		);
		if (target) {
			return target;
		}
	}

	if (hand) {
		handPos = hand.position();
		target = detect(
			all,
			input => (input !== reporter) &&
				!input.isLocked() &&
					input.bounds.containsPoint(handPos) &&
							!contains(blackList, input) &&
								touchingVariadicArrowsIfAny(input, handPos)
		);
		if (target) {
			return target;
		}
	}
	return detect(
		all,
		input => (input !== reporter) &&
			!input.isLocked() &&
				input.fullBounds().intersects(fb) &&
						!contains(blackList, input) &&
							touchingVariadicArrowsIfAny(input)
	);
};

ScriptsMorph.prototype.closestBlock = function (comment, hand) {
	// passing the hand is optional (when dragging comments)
	var fb = comment.bounds,
		stacks = this.children.filter(child =>
			(child instanceof BlockMorph) &&
				(child.fullBounds().intersects(fb))
		),
		handPos,
		target,
		all;

	all = [];
	stacks.forEach(stack => {
		all = all.concat(stack.allChildren().slice(0).reverse().filter(
			child => child instanceof BlockMorph && !child.isTemplate
		));
	});
	if (all.length === 0) {return null; }

	if (hand) {
		handPos = hand.position();
		target = detect(
			all,
			block => !block.comment &&
				!block.isPrototype &&
					block.bounds.containsPoint(handPos)
		);
		if (target) {
			return target;
		}
	}
	return detect(
		all,
		block => !block.comment &&
			!block.isPrototype &&
				block.bounds.intersects(fb)
	);
};

// ScriptsMorph user menu

ScriptsMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this),
		shiftClicked = this.world().currentKey === 16;

	menu.addItem('clean up', 'cleanUp', 'arrange scripts\nvertically');
	menu.addItem('scripts pic...', 'exportScriptsPicture', 'save a picture\nof all scripts');
	return menu;
};

// ScriptsMorph user menu features:

ScriptsMorph.prototype.cleanUp = function () {
	var target = this.selectForEdit(), // enable copy-on-edit
		origin = target.topLeft(),
		y = target.cleanUpMargin;
	target.children.sort((a, b) =>
		// make sure the prototype hat block always stays on top
		a instanceof PrototypeHatBlockMorph ? 0 : a.top() - b.top()
	).forEach(child => {
		child.setPosition(origin.add(new Point(target.cleanUpMargin, y)));
		if (child instanceof BlockMorph) {
			child.allComments().forEach(comment =>
				comment.align(child, true) // ignore layer
			);
		}
		y += child.stackHeight() + target.cleanUpSpacing;
	});
	if (target.parent) {
		target.setPosition(target.parent.topLeft());
	}
	target.adjustBounds();
};

ScriptsMorph.prototype.exportScriptsPicture = function () {
	var pic = this.scriptsPicture(),
		ide = this.world().children[0],
		xml = this.scriptsXML();

	if (pic) {
		if (xml) {
			ide.saveFileAs(
				embedMetadataPNG(pic, xml),
				'image/png',
				(ide.getProjectName() || localize('untitled')) + ' ' +
					localize('script pic')
			);
		} else {
			ide.saveCanvasAs(
				pic,
				(ide.getProjectName() || localize('untitled')) + ' ' +
					localize('script pic')
			);
		}
	}
};

ScriptsMorph.prototype.scriptsPicture = function () {
	// private - answer a canvas containing the pictures of all scripts
	var boundingBox, pic, ctx;
	if (this.children.length === 0) {return; }
	boundingBox = this.children[0].fullBounds();
	this.children.forEach(child => {
		if (child.isVisible) {
			boundingBox = boundingBox.merge(child.fullBounds());
		}
	});
	pic = newCanvas(boundingBox.extent());
	ctx = pic.getContext('2d');
	this.children.forEach(child => {
		var pos = child.fullBounds().origin;
		if (child.isVisible) {
			ctx.drawImage(
				child.fullImage(),
				pos.x - boundingBox.origin.x,
				pos.y - boundingBox.origin.y
			);
		}
	});
	return pic;
};

// ScriptsMorph sorting blocks and comments

ScriptsMorph.prototype.sortedElements = function () {
	// return all scripts and unattached comments
	var scripts = this.children.slice(); // make a copy
	scripts.sort((a, b) =>
		// make sure the prototype hat block always stays on top
		a instanceof PrototypeHatBlockMorph ? 0 : a.top() - b.top()
	);
	return scripts;
};

// ScriptsMorph blocks layout fix

ScriptsMorph.prototype.fixMultiArgs = function () {
	this.forAllChildren(morph => {
		if (morph instanceof MultiArgMorph) {
			morph.fixLayout();
		}
	});
};

// ScriptsMorph drag & drop:

ScriptsMorph.prototype.wantsDropOf = function (aMorph) {
	// override the inherited method
	if (aMorph instanceof HatBlockMorph) {
		return (!this.rejectsHats && !aMorph.isCustomBlockSpecific()) ||
			(this.rejectsHats && aMorph.isCustomBlockSpecific());
	}
	return aMorph instanceof SyntaxElementMorph;
};

ScriptsMorph.prototype.reactToDropOf = function (droppedMorph, hand) {
	if (droppedMorph instanceof BlockMorph) {
		droppedMorph.snap(hand);
	}
	this.adjustBounds();
};

// ScriptsMorph events

ScriptsMorph.prototype.mouseClickLeft = function (pos) {
	var shiftClicked = this.world().currentKey === 16;
	if (shiftClicked) {
		return this.edit(pos);
	}
	if (this.focus) {this.focus.stopEditing(); }
};

ScriptsMorph.prototype.selectForEdit = function () {
	return this;
};

// ScriptsMorph keyboard support

ScriptsMorph.prototype.edit = function (pos) {
	var target,
		world = this.world();
	if (this.focus) {this.focus.stopEditing(); }
	world.stopEditing();
	if (!ScriptsMorph.prototype.enableKeyboard) {return; }
	target = this.selectForEdit(); // enable copy-on-edit
	target.focus = new ScriptFocusMorph(target, target, pos);
	target.focus.getFocus(world);
};

ScriptsMorph.prototype.toggleKeyboardEntry = function () {
	// when the user clicks the keyboard button in the toolbar
	var target, sorted,
		world = this.world();
	if (this.focus) {
		this.focus.stopEditing();
		return;
	}
	world.stopEditing();
	if (!ScriptsMorph.prototype.enableKeyboard) {return; }
	target = this.selectForEdit(); // enable copy-on-edit
	target.focus = new ScriptFocusMorph(target, target, target.position());
	target.focus.getFocus(world);
	sorted = target.focus.sortedScripts();
	if (sorted.length) {
		target.focus.element = sorted[0];
		if (target.focus.element instanceof HatBlockMorph) {
			target.focus.nextCommand();
		}
	} else {
		target.focus.moveBy(new Point(50, 50));
	}
	target.focus.fixLayout();
};

// ArgMorph //////////////////////////////////////////////////////////

/*
	I am a syntax element and the ancestor of all block inputs.
	I am present in block labels.
	Usually I am just a receptacle for inherited methods and attributes,
	however, if my 'type' attribute is set to one of the following
	values, I act as an iconic slot myself:

		'list'		- a list symbol
		'object'	- a turtle symbol
*/

// ArgMorph inherits from SyntaxElementMorph:

ArgMorph.prototype = new SyntaxElementMorph();
ArgMorph.prototype.constructor = ArgMorph;
ArgMorph.uber = SyntaxElementMorph.prototype;

// ArgMorph instance creation:

function ArgMorph(type) {
	this.init(type);
}

ArgMorph.prototype.init = function (type) {
	this.type = type || null;
	this.icon = null;
	ArgMorph.uber.init.call(this);
	this.color = new Color(0, 17, 173);
	this.createIcon();
	if (type === 'list') {
		this.alpha = 1;
	}
};

// ArgMorph preferences settings:

ArgMorph.prototype.executeOnSliderEdit = false;

// ArgMorph events:

ArgMorph.prototype.reactToSliderEdit = function () {
/*
	directly execute the stack of blocks I'm part of if my
	"executeOnSliderEdit" setting is turned on, obeying the stage's
	thread safety setting. This feature allows for "Bret Victor" style
	interactive coding.
*/
	var block, top, receiver, stage;
	if (!this.executeOnSliderEdit) {return; }
	block = this.parentThatIsA(BlockMorph);
	if (block) {
		top = block.topBlock();
		receiver = top.scriptTarget();
		if (top instanceof PrototypeHatBlockMorph) {
			return;
		}
		if (receiver) {
			stage = receiver.parentThatIsA(StageMorph);
			if (stage && (stage.isThreadSafe ||
					Process.prototype.enableSingleStepping)) {
				stage.threads.startProcess(top, receiver, stage.isThreadSafe);
			} else {
				top.mouseClickLeft();
			}
		}
	}
};

ArgMorph.prototype.setContents = function () {
	// subclass responsibility
	nop();
};

// ArgMorph drag & drop: for demo puposes only

ArgMorph.prototype.justDropped = function () {
	if (!(this instanceof CommandSlotMorph)) {
		this.fixLayout();
		this.rerender();
	}
};

// ArgMorph spec extrapolation (for demo purposes)

ArgMorph.prototype.getSpec = function () {
	return this.type === 'list' ? '%l' : '%s'; // default
};

// ArgMorph menu

ArgMorph.prototype.userMenu = function () {
	var sm = this.slotMenu(),
		menu;
	if (!sm && !(this.parent instanceof MultiArgMorph)) {
		return this.parent.userMenu();
	}
	menu = sm || new MenuMorph(this);
	if (this.parent instanceof MultiArgMorph &&
		this.parentThatIsA(ScriptsMorph) &&
		!(this.parent.slotSpec instanceof Array)
	) {
		if (!this.parent.maxInputs ||
			(this.parent.inputs().length < this.parent.maxInputs)
		) {
			menu.addItem(
				'insert a slot',
				() => this.parent.insertNewInputBefore(this)
			);
		}
		if (this.parent.inputs().length > this.parent.minInputs) {
			menu.addItem(
				'delete slot',
				() => this.parent.deleteSlot(this)
			);
		}
	}
	return menu;
};

ArgMorph.prototype.slotMenu = function () {
	// subclass responsibility
	return null;
};

// ArgMorph drawing

ArgMorph.prototype.createIcon = function () {
	switch (this.type) {
	case 'list':
		this.icon = this.labelPart('$list');
		this.add(this.icon);
		break;
	case 'object':
		this.icon = this.labelPart('$turtle');
		this.add(this.icon);
		break;
	default:
		nop(); // no icon
	}
};

ArgMorph.prototype.fixLayout = function () {
	if (this.icon) {
		this.icon.setPosition(this.position());
		this.bounds.setExtent(this.icon.extent());
	} else {
		ArgMorph.uber.fixLayout.call(this);
	}
};

ArgMorph.prototype.render = function (ctx) {
	// make sure my icon's shadow color matches my block's color
	var block;
	if (this.icon) {
		block = this.parentThatIsA(BlockMorph);
		if (block) {
			this.icon.shadowColor = block.color.darker(this.labelContrast);
		}
		switch (this.type) {
		case 'list':
			this.color = new Color(255, 140, 0); // list color
			break;
		default:
			return; // don't draw anything except the icon
		}
	}
	ArgMorph.uber.render.call(this, ctx);
};

// ArgMorph evaluation

ArgMorph.prototype.evaluate = function () {
	return this.type === 'list' ? new List() : null;
};

ArgMorph.prototype.isEmptySlot = function () {
	return this.type !== null;
};

// ArgMorph op-sequence analysis

ArgMorph.prototype.unwind = function () {
	var nxt = this.parent instanceof MultiArgMorph ? this.parent
				: this.parentThatIsA(BlockMorph);
	return [this].concat(nxt.unwindAfter(this));
};

// CommandSlotMorph ////////////////////////////////////////////////////

/*
	I am a CommandBlock-shaped input slot. I can nest command blocks
	and also accept reporters (containing reified scripts).

	my most important accessor is

	nestedBlock()	 - answer the command block I encompass, if any

	My command spec is %cmd

	evaluate() returns my nested block or null
*/

// CommandSlotMorph inherits from ArgMorph:

CommandSlotMorph.prototype = new ArgMorph();
CommandSlotMorph.prototype.constructor = CommandSlotMorph;
CommandSlotMorph.uber = ArgMorph.prototype;

// CommandSlotMorph instance creation:

function CommandSlotMorph() {
	this.init();
}

CommandSlotMorph.prototype.init = function () {
	CommandSlotMorph.uber.init.call(this);
	this.color = new Color(0, 17, 173);
	this.setExtent(
		new Point(230, this.corner * 4 + this.cSlotPadding)
	);
};

CommandSlotMorph.prototype.getSpec = function () {
	return '%cmd';
};

// CommandSlotMorph enumerating:

CommandSlotMorph.prototype.topBlock = function () {
	if (this.parent.topBlock) {
		return this.parent.topBlock();
	}
	return this.nestedBlock();
};

// CommandSlotMorph nesting:

CommandSlotMorph.prototype.nestedBlock = function (block) {
	if (block) {
		var nb = this.nestedBlock();
		this.add(block);
		if (nb) {
			block.bottomBlock().nextBlock(nb);
		}
		this.fixLayout();
	} else {
		return detect(
			this.children,
			child => child instanceof CommandBlockMorph
		);
	}
};

// CommandSlotMorph attach targets:

CommandSlotMorph.prototype.slotAttachPoint = function () {
	return new Point(
		this.dentCenter(),
		this.top() + this.corner * 2
	);
};

CommandSlotMorph.prototype.dentLeft = function () {
	return this.left()
		+ this.corner
		+ this.inset * 2;
};

CommandSlotMorph.prototype.dentCenter = function () {
	return this.dentLeft()
		+ this.corner
		+ (this.dent * 0.5);
};

CommandSlotMorph.prototype.attachTargets = function () {
	var answer = [];
	answer.push({
		point: this.slotAttachPoint(),
		element: this,
		loc: 'bottom',
		type: 'slot'
	});
	return answer;
};

// CommandSlotMorph layout:

CommandSlotMorph.prototype.fixLayout = function () {
	var nb = this.nestedBlock();
	if (this.parent) {
		if (!this.color.eq(this.parent.color)) {
			this.setColor(this.parent.color);
		}
	}
	if (nb) {
		nb.setPosition(
			new Point(
				this.left() + this.edge + this.rfBorder,
				this.top() + this.edge + this.rfBorder
			)
		);
		this.bounds.setWidth(nb.fullBounds().width()
			+ (this.edge + this.rfBorder) * 2
			);
		this.bounds.setHeight(nb.fullBounds().height()
			+ this.edge + (this.rfBorder * 2) - (this.corner - this.edge)
			);
	} else {
		this.bounds.setHeight(this.corner * 4);
		this.bounds.setWidth(
			this.corner * 4
				+ this.inset
				+ this.dent
		);
	}
	if (this.parent && this.parent.fixLayout) {
		this.parent.fixLayout();
	}
};

// CommandSlotMorph evaluating:

CommandSlotMorph.prototype.evaluate = function () {
	return this.nestedBlock();
};

CommandSlotMorph.prototype.isEmptySlot = function () {
	return !this.isStatic && (this.nestedBlock() === null);
};

// CommandSlotMorph context menu ops

CommandSlotMorph.prototype.attach = function () {
	// for context menu demo and testing purposes
	// override inherited version to adjust new owner's layout
	var choices = this.overlappedMorphs(),
		menu = new MenuMorph(this, 'choose new parent:');

	choices.forEach(each =>
		menu.addItem(
			each.toString().slice(0, 50),
			() => {
				each.add(this);
				this.isDraggable = false;
				if (each.fixLayout) {
					each.fixLayout();
				}
			}
		)
	);
	if (choices.length > 0) {
		menu.popUpAtHand(this.world());
	}
};

// CommandSlotMorph op-sequence analysis

CommandSlotMorph.prototype.unwind = function () {
	var nested = this.nestedBlock(),
		nxt = this.parent instanceof MultiArgMorph ? this.parent
				: this.parentThatIsA(BlockMorph);
	if (nested) {
		if (this.isLambda) {
			return [nested.unwind()].concat(nxt.unwindAfter(this));
		}
		return nested.unwind().concat(nxt.unwindAfter(this));
	}
	return nxt.unwindAfter(this);
};

// CommandSlotMorph drawing:

CommandSlotMorph.prototype.render = function (ctx) {
	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();
	ctx.fillStyle = this.cachedClr;
	ctx.fillRect(0, 0, this.width(), this.height());

	// draw the 'flat' shape:
	ctx.fillStyle = this.rfColor.toString();
	this.drawFlat(ctx);
};

CommandSlotMorph.prototype.drawFlat = function (ctx) {
	var isFilled = this.nestedBlock() !== null,
		ins = (isFilled ? this.inset : this.inset / 2),
		dent = (isFilled ? this.dent : this.dent / 2),
		indent = this.corner * 2 + ins,
		edge = this.edge,
		rf = (isFilled ? this.rfBorder : 0),
		y = this.height() - this.corner - edge;

	ctx.beginPath();

	// top left:
	ctx.arc(
		this.corner + edge,
		this.corner + edge,
		this.corner,
		radians(-180),
		radians(-90),
		false
	);

	// dent:
	ctx.lineTo(this.corner + ins + edge + rf * 2, edge);
	ctx.lineTo(indent + edge + rf * 2, this.corner + edge);
	ctx.lineTo(
		indent + edge + rf * 2 + (dent - rf * 2),
		this.corner + edge
	);
	ctx.lineTo(
		indent + edge + rf * 2 + (dent - rf * 2) + this.corner,
		edge
	);
	ctx.lineTo(this.width() - this.corner - edge, edge);

	// top right:
	ctx.arc(
		this.width() - this.corner - edge,
		this.corner + edge,
		this.corner,
		radians(-90),
		radians(-0),
		false
	);

	// bottom right:
	ctx.arc(
		this.width() - this.corner - edge,
		y,
		this.corner,
		radians(0),
		radians(90),
		false
	);

	// bottom left:
	ctx.arc(
		this.corner + edge,
		y,
		this.corner,
		radians(90),
		radians(180),
		false
	);

	ctx.closePath();
	ctx.fill();

};

CommandSlotMorph.prototype.drawEdges = function (ctx) {
	var isFilled = this.nestedBlock() !== null,
		ins = (isFilled ? this.inset : this.inset / 2),
		dent = (isFilled ? this.dent : this.dent / 2),
		indent = this.corner * 2 + ins,
		edge = this.edge,
		rf = (isFilled ? this.rfBorder : 0),
		shift = this.edge * 0.5,
		gradient,
		upperGradient,
		lowerGradient,
		rightGradient;

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';


	// bright:
	// bottom horizontal line
	gradient = ctx.createLinearGradient(
		0,
		this.height(),
		0,
		this.height() - this.edge
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrBright);

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(this.corner + edge, this.height() - shift);
	ctx.lineTo(
		this.width() - this.corner - edge,
		this.height() - shift
	);
	ctx.stroke();

	// bottom right corner
	gradient = ctx.createRadialGradient(
		this.width() - (this.corner + edge),
		this.height() - (this.corner + edge),
		this.corner,
		this.width() - (this.corner + edge),
		this.height() - (this.corner + edge),
		this.corner + edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.arc(
		this.width() - (this.corner + edge),
		this.height() - (this.corner + edge),
		this.corner + shift,
		radians(0),
		radians(90),
		false
	);
	ctx.stroke();

	// right vertical line
	gradient = ctx.createLinearGradient(
		this.width(),
		0,
		this.width() - this.edge,
		0
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrBright);

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(
		this.width() - shift,
		this.height() - this.corner - this.edge
	);
	ctx.lineTo(this.width() - shift, edge + this.corner);
	ctx.stroke();

	if (useBlurredShadows) {
		ctx.shadowOffsetY = shift;
		ctx.shadowBlur = this.edge;
		ctx.shadowColor = this.rfColor.darker(80).toString();
	}

	// left vertical side
	gradient = ctx.createLinearGradient(
		0,
		0,
		edge,
		0
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(shift, edge + this.corner);
	ctx.lineTo(shift, this.height() - edge - this.corner);
	ctx.stroke();

	// upper left corner
	gradient = ctx.createRadialGradient(
		this.corner + edge,
		this.corner + edge,
		this.corner,
		this.corner + edge,
		this.corner + edge,
		this.corner + edge
	);
	gradient.addColorStop(0, this.cachedClrDark);
	gradient.addColorStop(1, this.cachedClr);

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.arc(
		this.corner + edge,
		this.corner + edge,
		this.corner + shift,
		radians(-180),
		radians(-90),
		false
	);
	ctx.stroke();

	// upper edge (left side)
	upperGradient = ctx.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	upperGradient.addColorStop(0, this.cachedClr);
	upperGradient.addColorStop(1, this.cachedClrDark);

	ctx.strokeStyle = upperGradient;
	ctx.beginPath();
	ctx.moveTo(this.corner + edge, shift);
	ctx.lineTo(
		this.corner + ins + edge + rf * 2 - shift,
		shift
	);
	ctx.stroke();

	// dent bottom
	lowerGradient = ctx.createLinearGradient(
		0,
		this.corner,
		0,
		this.corner + edge
	);
	lowerGradient.addColorStop(0, this.cachedClr);
	lowerGradient.addColorStop(1, this.cachedClrDark);

	ctx.strokeStyle = lowerGradient;
	ctx.beginPath();
	ctx.moveTo(indent + edge + rf * 2 + shift, this.corner + shift);
	ctx.lineTo(
		indent + edge + rf * 2 + (dent - rf * 2),
		this.corner + shift
	);
	ctx.stroke();

	// dent right edge
	rightGradient = ctx.createLinearGradient(
		indent + edge + rf * 2 + (dent - rf * 2) - shift,
		this.corner,
		indent + edge + rf * 2 + (dent - rf * 2) + shift * 0.7,
		this.corner + shift + shift * 0.7
	);
	rightGradient.addColorStop(0, this.cachedClr);
	rightGradient.addColorStop(1, this.cachedClrDark);

	ctx.strokeStyle = rightGradient;
	ctx.beginPath();
	ctx.moveTo(
		indent + edge + rf * 2 + (dent - rf * 2),
		this.corner + shift
	);
	ctx.lineTo(
		indent + edge + rf * 2 + (dent - rf * 2) + this.corner,
		shift
	);
	ctx.stroke();

	// upper edge (right side)
	ctx.strokeStyle = upperGradient;
	ctx.beginPath();
	ctx.moveTo(
		indent + edge + rf * 2 + (dent - rf * 2) + this.corner,
		shift
	);
	ctx.lineTo(this.width() - this.corner - edge, shift);
	ctx.stroke();
};

// CSlotMorph ////////////////////////////////////////////////////

/*
	I am a C-shaped input slot. I can nest command blocks and also accept
	reporters (containing reified scripts).

	my most important accessor is

	nestedBlock()	 - the command block I encompass, if any (inherited)

	My command spec is %c

	evaluate() returns my nested block or null
*/

// CSlotMorph inherits from CommandSlotMorph:

CSlotMorph.prototype = new CommandSlotMorph();
CSlotMorph.prototype.constructor = CSlotMorph;
CSlotMorph.uber = CommandSlotMorph.prototype;

// CSlotMorph instance creation:

function CSlotMorph() {
	this.init();
}

CSlotMorph.prototype.init = function () {
	CommandSlotMorph.uber.init.call(this);
	this.isLambda = false; // see Process.prototype.evaluateInput
	this.color = new Color(0, 17, 173);
	this.setExtent(new Point(230, this.corner * 4 + this.cSlotPadding));
};

CSlotMorph.prototype.getSpec = function () {
	return '%c';
};

// CSlotMorph layout:

CSlotMorph.prototype.fixLayout = function () {
	var nb = this.nestedBlock();
	if (nb) {
		nb.setPosition(
			new Point(
				this.left() + this.inset,
				this.top() + this.corner
			)
		);
		this.bounds.setHeight(nb.fullBounds().height() + this.corner);
		this.bounds. setWidth(
			nb.fullBounds().width() + (this.cSlotPadding * 2)
		);
	} else {
		this.bounds.setHeight(this.corner * 4 + this.cSlotPadding); // default
		this.bounds.setWidth(
			this.corner * 4
				+ (this.inset * 2)
				+ this.dent
				+ (this.cSlotPadding * 2)
		);
	}

	if (this.parent && this.parent.fixLayout) {
		this.parent.fixLayout();
	}
};

CSlotMorph.prototype.fixHolesLayout = function () {
	this.holes = [
		new Rectangle(
			this.inset,
			this.corner,
			this.width(),
			this.height() - this.corner
		)
	];
};

CSlotMorph.prototype.isLocked = function () {
	return this.isStatic || this.parent instanceof MultiArgMorph;
};

// CSlotMorph drawing:

CSlotMorph.prototype.render = function (ctx) { return; };

CSlotMorph.prototype.outlinePath = function (ctx, inset, offset) {
	var ox = offset.x,
		oy = offset.y,
		radius = Math.max(this.corner - inset, 0);

	// top corner:
	ctx.lineTo(this.width() + ox - inset, oy);

	// top right:
	ctx.arc(
		this.width() - this.corner + ox,
		oy,
		radius,
		radians(90),
		radians(0),
		true
	);

	// jigsaw shape:
	ctx.lineTo(
		this.width() - this.corner + ox,
		this.corner + oy - inset
	);
	ctx.lineTo(
		(this.inset * 2) + (this.corner * 3) + this.dent + ox,
		this.corner + oy - inset
	);
	ctx.lineTo(
		(this.inset * 2) + (this.corner * 2) + this.dent + ox,
		this.corner * 2 + oy - inset
	);
	ctx.lineTo(
		(this.inset * 2) + (this.corner * 2) + ox,
		this.corner * 2 + oy - inset
	);
	ctx.lineTo(
		(this.inset * 2) + this.corner + ox,
		this.corner + oy - inset
	);
	ctx.lineTo(
		this.inset + this.corner + ox,
		this.corner + oy - inset
	);
	ctx.arc(
		this.inset + this.corner + ox,
		this.corner * 2 + oy,
		this.corner + inset,
		radians(270),
		radians(180),
		true
	);

	// bottom:
	ctx.lineTo(
		this.inset + ox - inset,
		this.height() - (this.corner * 2) + oy
	);
	ctx.arc(
		this.inset + this.corner + ox,
		this.height() - (this.corner * 2) + oy,
		this.corner + inset,
		radians(180),
		radians(90),
		true
	);
	ctx.lineTo(
		this.width() - this.corner + ox,
		this.height() - this.corner + oy + inset
	);
	ctx.arc(
		this.width() - this.corner + ox,
		this.height() + oy,
		radius,
		radians(-90),
		radians(-0),
		false
	);
};

CSlotMorph.prototype.drawTopRightEdge = function (ctx) {
	var shift = this.edge * 0.5,
		x = this.width() - this.corner,
		y = 0,
		gradient;

	gradient = ctx.createRadialGradient(
		x,
		y,
		this.corner,
		x,
		y,
		this.corner - this.edge
	);
	gradient.addColorStop(0, this.cachedClrDark);
	gradient.addColorStop(1, this.cachedClr);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.strokeStyle = gradient;

	ctx.beginPath();
	ctx.arc(
		x,
		y,
		this.corner - shift,
		radians(90),
		radians(0),
		true
	);
	ctx.stroke();
};

CSlotMorph.prototype.drawTopEdge = function (ctx, x, y) {
	var shift = this.edge * 0.5,
		indent = x + this.corner * 2 + this.inset,
		upperGradient,
		lowerGradient,
		rightGradient;

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	upperGradient = ctx.createLinearGradient(
		0,
		y - this.edge,
		0,
		y
	);
	upperGradient.addColorStop(0, this.cachedClr);
	upperGradient.addColorStop(1, this.cachedClrDark);

	ctx.strokeStyle = upperGradient;
	ctx.beginPath();
	ctx.moveTo(x + this.corner, y - shift);
	ctx.lineTo(x + this.corner + this.inset - shift, y - shift);
	ctx.stroke();

	lowerGradient = ctx.createLinearGradient(
		0,
		y + this.corner - this.edge,
		0,
		y + this.corner
	);
	lowerGradient.addColorStop(0, this.cachedClr);
	lowerGradient.addColorStop(1, this.cachedClrDark);

	ctx.strokeStyle = lowerGradient;
	ctx.beginPath();
	ctx.moveTo(indent + shift, y + this.corner - shift);
	ctx.lineTo(indent + this.dent, y + this.corner - shift);
	ctx.stroke();

	rightGradient = ctx.createLinearGradient(
		(x + this.inset + (this.corner * 2) + this.dent) - shift,
		(y + this.corner - shift) - shift,
		(x + this.inset + (this.corner * 2) + this.dent) + (shift * 0.7),
		(y + this.corner - shift) + (shift * 0.7)
	);
	rightGradient.addColorStop(0, this.cachedClr);
	rightGradient.addColorStop(1, this.cachedClrDark);


	ctx.strokeStyle = rightGradient;
	ctx.beginPath();
	ctx.moveTo(
		x + this.inset + (this.corner * 2) + this.dent,
		y + this.corner - shift
	);
	ctx.lineTo(
		x + this.corner * 3 + this.inset + this.dent,
		y - shift
	);
	ctx.stroke();

	ctx.strokeStyle = upperGradient;
	ctx.beginPath();
	ctx.moveTo(
		x + this.corner * 3 + this.inset + this.dent,
		y - shift
	);
	ctx.lineTo(this.width() - this.corner, y - shift);
	ctx.stroke();
};

CSlotMorph.prototype.drawTopLeftEdge = function (ctx) {
	var shift = this.edge * 0.5,
		gradient;

	gradient = ctx.createRadialGradient(
		this.corner + this.inset,
		this.corner * 2,
		this.corner,
		this.corner + this.inset,
		this.corner * 2,
		this.corner + this.edge
	);
	gradient.addColorStop(0, this.cachedClrDark);
	gradient.addColorStop(1, this.cachedClr);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.strokeStyle = gradient;

	ctx.beginPath();
	ctx.arc(
		this.corner + this.inset,
		this.corner * 2,
		this.corner + shift,
		radians(-180),
		radians(-90),
		false
	);
	ctx.stroke();
};

CSlotMorph.prototype.drawRightEdge = function (ctx) {
	var shift = this.edge * 0.5,
		x = this.inset,
		gradient;

	gradient = ctx.createLinearGradient(x - this.edge, 0, x, 0);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(x - shift, this.corner * 2);
	ctx.lineTo(x - shift, this.height() - this.corner * 2);
	ctx.stroke();
};

CSlotMorph.prototype.drawBottomEdge = function (ctx) {
	var shift = this.edge * 0.5,
		gradient,
		upperGradient;

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	upperGradient = ctx.createRadialGradient(
		this.corner + this.inset,
		this.height() - (this.corner * 2),
		this.corner, /*- this.edge*/ // uncomment for half-tone
		this.corner + this.inset,
		this.height() - (this.corner * 2),
		this.corner + this.edge
	);
	upperGradient.addColorStop(0, this.cachedClrBright);
	upperGradient.addColorStop(1, this.cachedClr);
	ctx.strokeStyle = upperGradient;
	ctx.beginPath();
	ctx.arc(
		this.corner + this.inset,
		this.height() - (this.corner * 2),
		this.corner + shift,
		radians(180),
		radians(90),
		true
	);
	ctx.stroke();

	gradient = ctx.createLinearGradient(
		0,
		this.height() - this.corner,
		0,
		this.height() - this.corner + this.edge
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);

	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(
		this.inset + this.corner,
		this.height() - this.corner + shift
	);
	ctx.lineTo(
		this.width() - this.corner,
		this.height() - this.corner + shift
	);

	ctx.stroke();
};

// InputSlotMorph //////////////////////////////////////////////////////

/*
	I am an editable text input slot. I can be either rectangular or
	rounded, and can have an optional drop-down menu. If I'm set to
	read-only I must have a drop-down menu and will assume a darker
	shade of my parent's color.

	my most important public attributes and accessors are:

	setContents(str/float)	- display the argument (string or float)
	contents().text			- get the displayed string
	choices					- a key/value list for my optional drop-down
	isReadOnly				- governs whether I am editable or not
	isNumeric				- governs my outer shape (round or rect)

	my block specs are:

	%s		- string input, rectangular
	%n		- numerical input, semi-circular vertical edges
	%anyUE	- any unevaluated

	evaluate() returns my displayed string, cast to float if I'm numerical

	there are also a number of specialized drop-down menu presets, refer
	to BlockMorph for details.
*/

// InputSlotMorph inherits from ArgMorph:

InputSlotMorph.prototype = new ArgMorph();
InputSlotMorph.prototype.constructor = InputSlotMorph;
InputSlotMorph.uber = ArgMorph.prototype;

// InputSlotMorph instance creation:

function InputSlotMorph(text, isNumeric, choiceDict, isReadOnly) {
	this.init(text, isNumeric, choiceDict, isReadOnly);
}

InputSlotMorph.prototype.init = function (
	text,
	isNumeric,
	choiceDict,
	isReadOnly
) {
	var contents = new InputSlotStringMorph(''),
		arrow = new ArrowMorph(
			'down',
			0,
			Math.max(Math.floor(this.fontSize / 6), 1),
			BLACK,
			true
		);

	contents.fontSize = this.fontSize;
	contents.isShowingBlanks = true;

	this.selectedBlock = null;
	this.symbol = null;

	this.isUnevaluated = false;
	this.choices = choiceDict || null; // object, function or selector
	this.oldContentsExtent = contents.extent();
	this.isNumeric = isNumeric || false;
	this.evaluateAsString = false; // special case for RANDOM NUMBER reporter
	this.isAlphanumeric = false; // temporary override for allowing text
	this.isReadOnly = isReadOnly || false;
	this.minWidth = 0; // can be chaged for text-type inputs ("landscape")
	this.constant = null;
	this.onSetContents = null;

	InputSlotMorph.uber.init.call(this, null, true);
	this.color = WHITE;
	this.add(contents);
	this.add(arrow);
	contents.isEditable = true;
	contents.isDraggable = false;
	contents.enableSelecting();
	this.setContents(text);
};

// InputSlotMorph accessing:

InputSlotMorph.prototype.getSpec = function () {
	if (this.isUnevaluated) {
		return '%anyUE';
	}
	if (this.isNumeric) {
		return '%n';
	}
	return '%s'; // default
};

InputSlotMorph.prototype.contents = function () {
	return detect(
		this.children,
		child => child instanceof StringMorph
	);
};

InputSlotMorph.prototype.arrow = function () {
	return detect(
		this.children,
		child => child instanceof ArrowMorph
	);
};

InputSlotMorph.prototype.setContents = function (data) {
	// data can be a String, Float, or "wish" Block
	var cnts = this.contents(),
		dta = data,
		isConstant = dta instanceof Array,
		block;

	if (this.selectedBlock) {
		this.selectedBlock = null;
	}
	if (this.symbol) {
		this.symbol.destroy();
		this.symbol = null;
	}

	if (isConstant) {
		// migrate old "any" constants
		if (dta[0] === 'any') {
			dta[0] = 'random';
		}
		if (dta[0] === '__shout__go__') {
			this.symbol = this.labelPart('$greenflag');
			this.add(this.symbol);
			dta = '';
		} else {
			dta = localize(dta[0]);
			cnts.isItalic = !this.isReadOnly;
		}
	} else if (dta instanceof BlockMorph) {
		this.selectedBlock = dta;
		dta = ''; // make sure the contents text emptied
	} else {
		cnts.isItalic = false;
		/*
		// assume dta is a localizable choice if it's a key in my choices
		if (!isNil(this.choices) && this.choices[dta] instanceof Array) {
			return this.setContents(this.choices[dta]);
		}
		*/
	}
	cnts.text = dta;
	if (isNil(dta)) {
		cnts.text = '';
	} else if (dta.toString) {
		cnts.text = dta.toString();
	}
	cnts.fixLayout();

	// remember the constant, if any
	this.constant = isConstant ? data : null;

	// adjust to zebra coloring:
	if (this.isReadOnly) {
		block = this.parentThatIsA(BlockMorph); // could be inside a multi-arg
		if (block) {
			block.fixLabelColor();
		}
	}

	// run onSetContents if any
	if (this.onSetContents) {
		this[this.onSetContents](data);
	}
};

InputSlotMorph.prototype.userSetContents = function (aStringOrFloat) {
	// enable copy-on-edit for inherited scripts
	var block = this.parentThatIsA(BlockMorph),
		trgt = block.scriptTarget(true);
	this.selectForEdit().setContents(aStringOrFloat);
	if (trgt && !block.isTemplate) {
		trgt.recordUserEdit(
			'scripts',
			'input slot',
			'set',
			block.abstractBlockSpec(),
			aStringOrFloat
		);
	}
	this.reactToEdit();
};

// InputSlotMorph drop-down menu:

InputSlotMorph.prototype.dropDownMenu = function (enableKeyboard) {
	var menu;
	if (this.choices === 'dynamicMenu') {
		return this.dynamicMenu(null, enableKeyboard);
	}
	menu = this.menuFromDict(this.choices, null, enableKeyboard);
	if (!menu) { // has already happened
		return;
	}
	if (menu.items.length > 0) {
		if (enableKeyboard) {
			menu.popup(this.world(), this.bottomLeft());
			menu.getFocus();
		} else {
			menu.popUpAtHand(this.world());
		}
	}
};

InputSlotMorph.prototype.menuFromDict = function (
	choices,
	noEmptyOption,
	enableKeyboard)
{
	alert('not implemented yet');
	return;

	var key, dial, flag,
		myself = this,
		selector,
		block = this.parentThatIsA(BlockMorph),
		trgt = block.scriptTarget(true),
		menu = new MenuMorph(
			this.userSetContents,
			null,
			this,
			this.fontSize
		);

	function update(num) {
		myself.setContents(num);
		myself.reactToSliderEdit();
		if (trgt && !block.isTemplate) {
			trgt.recordUserEdit(
				'scripts',
				'input slot',
				'set choice',
				block.abstractBlockSpec(),
				num
			);
		}
	}

	function getImg(block) {
		return () => block.fullImage();
	}

	if (choices instanceof Function) {
		if (!Process.prototype.enableJS) {
			menu.addItem('JavaScript extensions for Snap!\nare turned off');
			return menu;
		}
		choices = choices.call(this);
	} else if (isString(choices)) {
		if (choices.indexOf('ext_') === 0) {
			selector = choices.slice(4);
			choices = SnapExtensions.menus.get(selector);
			if (choices) {
				choices = choices.call(this);
			} else {
				menu.addItem('cannot find extension menu "' + selector + '"');
				return menu;
			}
		} else {
			choices = this[choices]();
		}
		if (!choices) { // menu has already happened
			return;
		}
	}
	if (!noEmptyOption) {
		menu.addItem(' ', null);
	}
	for (key in choices) {
		if (Object.prototype.hasOwnProperty.call(choices, key)) {
			if (key[0] && key[0].split('').every(c => c === '~')) {
				menu.addLine();
			} else if (key.indexOf('§_def') === 0) {
				menu.addItem(
					this.doWithAlpha(1, getImg(choices[key])),
					choices[key]
				);
			} else if (key.indexOf('§_dir') === 0) {
				dial = new DialMorph();
				dial.rootForGrab = function () {return this; };
				dial.target = this;
				dial.action = update;
				dial.fillColor = this.parent.color;
				dial.setRadius(this.fontSize * 3);
				dial.setValue(+this.evaluate(), false, true);
				menu.addLine();
				menu.items.push(dial);
				menu.addLine();
			} else if (key.indexOf('§_') === 0) {
				// prefixing a key with '§_' only makes the menu item
				// appear when the user holds down the shift-key
				// use with care because mobile devices might only
				// have a "soft" keyboard that isn't always there
				if (this.world().currentKey === 16) { // shift
					menu.addItem(
						key.slice(2),
						choices[key],
						null, // hint
						null, // color
						null, // bold
						true, // italic
						null, // doubleClickAction
						null, // shortcut
						!(choices[key] instanceof Array) &&
							typeof choices[key] !== 'function' // verbatim?
					);
				}
			} else if (choices[key] instanceof Object &&
					!(choices[key] instanceof Array) &&
					(typeof choices[key] !== 'function')) {
				menu.addMenu(
					key,
					this.menuFromDict(choices[key],true),
					null,	// indicator
					true	// verbatim? - don't translate
				);
			} else if (choices[key] instanceof Array &&
					choices[key][0] instanceof Object &&
					typeof choices[key][0] !== 'function') {
				menu.addMenu(
					key,
					this.menuFromDict(choices[key][0],true),
					null,	// indicator
					false	// verbatim? - do translate, if inside an array
				);
			} else {
				menu.addItem(
					key,
					choices[key],
					null, // hint
					null, // color
					null, // bold
					null, // italic
					null, // doubleClickAction
					null, // shortcut
					!(choices[key] instanceof Array) &&
						typeof choices[key] !== 'function' &&
							typeof(choices[key]) !== 'number' // verbatim?
				);
			}
		}
	}
	return menu;
};

// InputSlotMorph layout:

InputSlotMorph.prototype.fixLayout = function () {
	var width, height, arrowWidth,
		contents = this.contents(),
		arrow = this.arrow(),
		tp = this.topBlock();

	contents.isNumeric = this.isNumeric && !this.isAlphanumeric;
	contents.isEditable = (!this.isReadOnly);
	if (this.isReadOnly) {
		contents.disableSelecting();
		contents.color = WHITE;
	} else {
		contents.enableSelecting();
		contents.color = BLACK;
	}

	if (this.choices) {
		arrow.setSize(fontHeight(this.fontSize));
		arrow.show();
	} else {
		arrow.hide();
	}
	arrowWidth = arrow.isVisible ? arrow.width() : 0;

	// determine slot dimensions
	if (this.selectedBlock) { // a "wish" in the OF-block's left slot
		height = this.selectedBlock.height() + this.edge * 2;
		 width = this.selectedBlock.width()
			+ arrowWidth
			+ this.edge * 2
			+ this.typeInPadding * 2;
	} else if (this.symbol) {
		this.symbol.fixLayout();
		this.symbol.setPosition(this.position().add(this.edge * 2));
		height = this.symbol.height() + this.edge * 4;
		width = this.symbol.width()
			+ arrowWidth
			+ this.edge * 4
			+ this.typeInPadding * 2;
	} else {
		height = contents.height() + this.edge * 2; // + this.typeInPadding * 2
		if (this.isNumeric) {
			width = contents.width()
				+ Math.floor(arrowWidth * 0.5)
				+ height
				+ this.typeInPadding * 2;
		} else {
			width = Math.max(
				contents.width()
					+ arrowWidth
					+ this.edge * 2
					+ this.typeInPadding * 2,
				contents.rawHeight ? // single vs. multi-line contents
							contents.rawHeight() + arrowWidth
									: fontHeight(contents.fontSize) / 1.3
										+ arrowWidth,
				this.minWidth // for text-type slots
			);
		}
	}
	this.bounds.setExtent(new Point(width, height));

	if (this.isNumeric) {
		contents.setPosition(new Point(
			Math.floor(height / 2),
			this.edge
		).add(new Point(this.typeInPadding, 0)).add(this.position()));
	} else {
		contents.setPosition(new Point(
			this.edge,
			this.edge
		).add(new Point(this.typeInPadding, 0)).add(this.position()));
	}

	if (arrow.isVisible) {
		arrow.setPosition(new Point(
			this.right() - arrowWidth - this.edge,
			contents.top() - arrowWidth / 8
		));
	}

	if (this.parent && this.parent.fixLayout) {
		tp.fullChanged();
		this.parent.fixLayout();
		tp.fullChanged();
	}
};

// InputSlotMorph events:

InputSlotMorph.prototype.mouseDownLeft = function (pos) {
	if (this.isReadOnly || this.symbol ||
			this.arrow().bounds.containsPoint(pos)) {
		this.escalateEvent('mouseDownLeft', pos);
	}
};

InputSlotMorph.prototype.mouseClickLeft = function (pos) {
	if (this.arrow().bounds.containsPoint(pos)) {
		this.dropDownMenu();
	} else if (this.isReadOnly || this.symbol) {
		this.dropDownMenu();
	} else {
		this.contents().edit();
	}
};

InputSlotMorph.prototype.reactToKeystroke = function () {
	var cnts;
	if (this.constant) {
		cnts = this.contents();
		this.constant = null;
		cnts.isItalic = false;
		cnts.rerender();
	}
};

InputSlotMorph.prototype.reactToEdit = function () {
	var block = this.parentThatIsA(BlockMorph);
	this.contents().clearSelection();
};

InputSlotMorph.prototype.freshTextEdit = function (aStringOrTextMorph) {
	this.onNextStep = () => aStringOrTextMorph.selectAll();
};

// InputSlotMorph evaluating:

InputSlotMorph.prototype.evaluate = function () {
	// answer my contents, which can be a "wish", i.e. a block that refers to
	// another sprite's local method, or a text string. If I am numerical
	// convert that string to a number. If the conversion fails answer the
	// string (e.g. for special choices like 'random', 'all' or 'last')
	// otherwise the numerical value.
	var val, num;
	if (this.selectedBlock) {
		return this.selectedBlock;
	}
	if (this.symbol) {
		if (this.symbol.name === 'flag') {
			return ['__shout__go__'];
		}
		return '';
	}
	if (this.constant) {
		return this.constant;
	}
	val = this.contents().text;
	if (this.isNumeric &&
		!this.isAlphanumeric &&
		(!this.evaluateAsString || val === '')
	) {
		num = +val;
		if (!isNaN(num)) {
			return num;
		}
	}
	return val;
};

InputSlotMorph.prototype.evaluateOption = function () {
	var val = this.evaluate();
	return val instanceof Array ? val[0] : val;
};

InputSlotMorph.prototype.isEmptySlot = function () {
	return this.contents().text === '' && !this.selectedBlock && !this.symbol;
};

// InputSlotMorph drawing:

InputSlotMorph.prototype.render = function (ctx) {
	var borderColor, r;

	// initialize my surface property
	if (this.cachedNormalColor) { // if flashing
		borderColor = this.color;
	} else if (this.parent) {
		borderColor = this.parent.color;
	} else {
		borderColor = new Color(120, 120, 120);
	}
	ctx.fillStyle = this.color.toString();
	if (this.isReadOnly && !this.cachedNormalColor) { // unless flashing
		ctx.fillStyle = borderColor.darker().toString();
	}

	// cache my border colors
	this.cachedClr = borderColor.toString();
	this.cachedClrBright = borderColor.lighter(this.contrast)
		.toString();
	this.cachedClrDark = borderColor.darker(this.contrast).toString();

	if (!this.isNumeric) {
		ctx.fillRect(
			this.edge,
			this.edge,
			this.width() - this.edge * 2,
			this.height() - this.edge * 2
		);
	} else {
		r = Math.max((this.height() - (this.edge * 2)) / 2, 0);
		ctx.beginPath();
		ctx.arc(
			r + this.edge,
			r + this.edge,
			r,
			radians(90),
			radians(-90),
			false
		);
		ctx.arc(
			this.width() - r - this.edge,
			r + this.edge,
			r,
			radians(-90),
			radians(90),
			false
		);
		ctx.closePath();
		ctx.fill();
	}

	// draw my "wish" block, if any
	if (this.selectedBlock) {
		ctx.drawImage(
			this.doWithAlpha(1, () => this.selectedBlock.fullImage()),
			this.edge + this.typeInPadding,
			this.edge
		);
	}
};

InputSlotMorph.prototype.drawRectBorder = function (ctx) {
	var shift = this.edge * 0.5,
		gradient;

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	if (useBlurredShadows) {
		ctx.shadowOffsetY = shift;
		ctx.shadowBlur = this.edge;
		ctx.shadowColor = this.color.darker(80).toString();
	}

	gradient = ctx.createLinearGradient(
		0,
		0,
		0,
		this.edge
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(this.edge, shift);
	ctx.lineTo(this.width() - this.edge - shift, shift);
	ctx.stroke();

	ctx.shadowOffsetY = 0;

	gradient = ctx.createLinearGradient(
		0,
		0,
		this.edge,
		0
	);
	gradient.addColorStop(0, this.cachedClr);
	gradient.addColorStop(1, this.cachedClrDark);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(shift, this.edge);
	ctx.lineTo(shift, this.height() - this.edge - shift);
	ctx.stroke();

	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.shadowBlur = 0;

	gradient = ctx.createLinearGradient(
		0,
		this.height() - this.edge,
		0,
		this.height()
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(this.edge, this.height() - shift);
	ctx.lineTo(this.width() - this.edge, this.height() - shift);
	ctx.stroke();

	gradient = ctx.createLinearGradient(
		this.width() - this.edge,
		0,
		this.width(),
		0
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(this.width() - shift, this.edge);
	ctx.lineTo(this.width() - shift, this.height() - this.edge);
	ctx.stroke();

};

InputSlotMorph.prototype.drawRoundBorder = function (ctx) {
	var shift = this.edge * 0.5,
		r = Math.max((this.height() - (this.edge * 2)) / 2, 0),
		start,
		end,
		gradient;

	ctx.lineWidth = this.edge;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	// straight top edge:
	start = r + this.edge;
	end = this.width() - r - this.edge;
	if (end > start) {

		if (useBlurredShadows) {
			ctx.shadowOffsetX = shift;
			ctx.shadowOffsetY = shift;
			ctx.shadowBlur = this.edge;
			ctx.shadowColor = this.color.darker(80).toString();
		}

		gradient = ctx.createLinearGradient(
			0,
			0,
			0,
			this.edge
		);
		gradient.addColorStop(0, this.cachedClr);
		gradient.addColorStop(1, this.cachedClrDark);
		ctx.strokeStyle = gradient;
		ctx.beginPath();

		ctx.moveTo(start, shift);
		ctx.lineTo(end, shift);
		ctx.stroke();

		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 0;
	}

	// straight bottom edge:
	gradient = ctx.createLinearGradient(
		0,
		this.height() - this.edge,
		0,
		this.height()
	);
	gradient.addColorStop(0, this.cachedClrBright);
	gradient.addColorStop(1, this.cachedClr);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.moveTo(r + this.edge, this.height() - shift);
	ctx.lineTo(this.width() - r - this.edge, this.height() - shift);
	ctx.stroke();

	r = Math.max(this.height() / 2, this.edge);

	if (useBlurredShadows) {
		ctx.shadowOffsetX = shift;
		ctx.shadowOffsetY = shift;
		ctx.shadowBlur = this.edge;
		ctx.shadowColor = this.color.darker(80).toString();
	}

	// top edge: left corner
	gradient = ctx.createRadialGradient(
		r,
		r,
		r - this.edge,
		r,
		r,
		r
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrDark);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.arc(
		r,
		r,
		r - shift,
		radians(180),
		radians(270),
		false
	);

	ctx.stroke();

	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.shadowBlur = 0;

	// bottom edge: right corner
	gradient = ctx.createRadialGradient(
		this.width() - r,
		r,
		r - this.edge,
		this.width() - r,
		r,
		r
	);
	gradient.addColorStop(1, this.cachedClr);
	gradient.addColorStop(0, this.cachedClrBright);
	ctx.strokeStyle = gradient;
	ctx.beginPath();
	ctx.arc(
		this.width() - r,
		r,
		r - shift,
		radians(0),
		radians(90),
		false
	);
	ctx.stroke();
};

// InputSlotStringMorph ///////////////////////////////////////////////

/*
	I am a piece of single-line text inside an input slot block. I serve as a
	container for sharing typographic attributes among my instances
*/

// InputSlotStringMorph inherits from StringMorph:

InputSlotStringMorph.prototype = new StringMorph();
InputSlotStringMorph.prototype.constructor = InputSlotStringMorph;
InputSlotStringMorph.uber = StringMorph.prototype;

function InputSlotStringMorph(
	text,
	fontSize,
	fontStyle,
	bold,
	italic,
	isNumeric,
	shadowOffset,
	shadowColor,
	color,
	fontName
) {
	this.init(
		text,
		fontSize,
		fontStyle,
		bold,
		italic,
		isNumeric,
		shadowOffset,
		shadowColor,
		color,
		fontName
	);
}

InputSlotStringMorph.prototype.getRenderColor = function () {
	return this.parent.alpha > 0.25 ? this.color : WHITE;
};

InputSlotStringMorph.prototype.getShadowRenderColor = function () {
	return this.parent.alpha > 0.25 ? this.shadowColor : CLEAR;
};

// InputSlotTextMorph ///////////////////////////////////////////////

/*
	I am a piece of multi-line text inside an input slot block. I serve as a
	container for sharing typographic attributes among my instances
*/

// InputSlotTextMorph inherits from TextMorph:

InputSlotTextMorph.prototype = new TextMorph();
InputSlotTextMorph.prototype.constructor = InputSlotTextMorph;
InputSlotTextMorph.uber = StringMorph.prototype;

function InputSlotTextMorph(
	text,
	fontSize,
	fontStyle,
	bold,
	italic,
	alignment,
	width,
	fontName,
	shadowOffset,
	shadowColor
) {
	this.init(text,
		fontSize,
		fontStyle,
		bold,
		italic,
		alignment,
		width,
		fontName,
		shadowOffset,
		shadowColor);
}

InputSlotTextMorph.prototype.getRenderColor =
	InputSlotStringMorph.prototype.getRenderColor;

InputSlotTextMorph.prototype.getShadowRenderColor =
	InputSlotStringMorph.prototype.getShadowRenderColor;

// TemplateSlotMorph ///////////////////////////////////////////////////

/*
	I am a reporter block template sitting on a pedestal.
	My block spec is

	%t		- template

	evaluate returns the embedded reporter template's label string
*/

// TemplateSlotMorph inherits from ArgMorph:

TemplateSlotMorph.prototype = new ArgMorph();
TemplateSlotMorph.prototype.constructor = TemplateSlotMorph;
TemplateSlotMorph.uber = ArgMorph.prototype;

// TemplateSlotMorph instance creation:

function TemplateSlotMorph(name) {
	this.init(name);
}

TemplateSlotMorph.prototype.init = function (name) {
	var template = new ReporterBlockMorph();
	template.isDraggable = false;
	template.isTemplate = true;
	template.category = 'Variables';
	template.setSpec('_');
	template.selector = 'v';
	TemplateSlotMorph.uber.init.call(this);
	this.add(template);
	this.setContents('v');
	this.fixLayout();
	this.isDraggable = false;
	this.isStatic = true; // I cannot be exchanged
};

// TemplateSlotMorph accessing:

TemplateSlotMorph.prototype.getSpec = function () {
	return '%t';
};

TemplateSlotMorph.prototype.template = function () {
	return this.children[0];
};

TemplateSlotMorph.prototype.contents = function () {
	return this.template().blockSpec;
};

TemplateSlotMorph.prototype.setContents = function (aString) {
	var tmp = this.template();
	tmp.setSpec(aString instanceof Array? localize(aString[0]) : aString);
	tmp.fixBlockColor(); // fix zebra coloring
	tmp.fixLabelColor();
};

// TemplateSlotMorph evaluating:

TemplateSlotMorph.prototype.evaluate = function () {
	return this.contents();
};

// TemplateSlotMorph layout:

TemplateSlotMorph.prototype.fixLayout = function () {
	var template = this.template();
	this.bounds.setExtent(template.extent().add(this.edge * 2 + 2));
	template.setPosition(this.position().add(this.edge + 1));
	if (this.parent) {
		if (this.parent.fixLayout) {
			this.parent.fixLayout();
		}
	}
};

// TemplateSlotMorph drop behavior:

TemplateSlotMorph.prototype.wantsDropOf = function (aMorph) {
	return aMorph.selector === 'v';
};

TemplateSlotMorph.prototype.reactToDropOf = function (droppedMorph) {
	if (droppedMorph.selector === 'v') {
		droppedMorph.destroy();
	}
};

// TemplateSlotMorph drawing:

TemplateSlotMorph.prototype.render = function (ctx) {
	if (this.parent instanceof Morph) {
		this.color = this.parent.color.copy();
	}
	BlockMorph.prototype.render.call(this, ctx);
};

TemplateSlotMorph.prototype.outlinePath =
	ReporterBlockMorph.prototype.outlinePathOval;

TemplateSlotMorph.prototype.outlinePath =
	ReporterBlockMorph.prototype.outlinePathOval;

TemplateSlotMorph.prototype.drawEdges = ReporterBlockMorph
	.prototype.drawEdgesOval;

TemplateSlotMorph.prototype.isRuleHat = function () {
	return false;
};

TemplateSlotMorph.prototype.cSlots = function () {
	return [];
};

// BooleanSlotMorph ////////////////////////////////////////////////////

/*
	I am a diamond-shaped argument slot.
	My block spec is

	%b			- Boolean
	%boolUE		- Boolean unevaluated

	I can be directly edited. When the user clicks on me I toggle
	between <true>, <false> and <null> values.

	evaluate() returns my value.

	my most important public attributes and accessors are:

	value						- user editable contents (Boolean or null)
	setContents(Boolean/null)	- display the argument (Boolean or null)
*/

// BooleanSlotMorph inherits from ArgMorph:

BooleanSlotMorph.prototype = new ArgMorph();
BooleanSlotMorph.prototype.constructor = BooleanSlotMorph;
BooleanSlotMorph.uber = ArgMorph.prototype;

// BooleanSlotMorph preferences settings

BooleanSlotMorph.prototype.isTernary = false;

// BooleanSlotMorph instance creation:

function BooleanSlotMorph(initialValue) {
	this.init(initialValue);
}

BooleanSlotMorph.prototype.init = function (initialValue) {
	this.value = (typeof initialValue === 'boolean') ? initialValue : null;
	this.isUnevaluated = false;
	this.progress = 0; // for animation state, not persisted
	BooleanSlotMorph.uber.init.call(this);
	this.alpha = 1;
	this.setContents(true);
	this.fixLayout();
};

BooleanSlotMorph.prototype.getSpec = function () {
	return this.isUnevaluated ? '%boolUE' : '%b';
};

BooleanSlotMorph.prototype.isWide = function () {
	return this.isStatic && (
		!(this.parent instanceof BlockMorph) || this.parent?.isPredicate);
};

// BooleanSlotMorph accessing:

BooleanSlotMorph.prototype.evaluate = function () {
	return this.value;
};

BooleanSlotMorph.prototype.isEmptySlot = function () {
	return this.value === null;
};

BooleanSlotMorph.prototype.isBinary = function () {
	return !this.isTernary && !isNil(this.parentThatIsA(ScriptsMorph));
};

BooleanSlotMorph.prototype.setContents = function (boolOrNull) {
	this.value = (typeof boolOrNull === 'boolean') ? boolOrNull
		: (isNil(boolOrNull) ||
			['', ' ', 'null'].includes(boolOrNull) ||
			+boolOrNull < 0 ? null
				: ['true', 'on', 'yes', 'ok', 'y', '+'].includes(boolOrNull) ||
					+boolOrNull > 0);
	this.rerender();
};

BooleanSlotMorph.prototype.toggleValue = function () {
	var block = this.parentThatIsA(BlockMorph);
	this.value = this.nextValue();
	if (block && (block.isCustomBlock)) {
		block.fireSlotEditedEvent(this);
	}
	this.progress = 3;
	this.rerender();
	this.nextSteps ([
		() => {
			this.progress = 2;
			this.rerender();
		},
		() => {
			this.progress = 1;
			this.rerender();
		},
		() => {
			this.progress = 0;
			this.rerender();
		},
	]);
};

BooleanSlotMorph.prototype.nextValue = function () {
	if (this.isStatic || this.isBinary()) {
		return !this.value;
	}
	switch (this.value) {
	case true:
		return false;
	case false:
		return null;
	default:
		return true;
	}
};

// BooleanSlotMorph events:

BooleanSlotMorph.prototype.mouseClickLeft = function () {
	this.toggleValue();
	if (isNil(this.value)) {return; }
	this.reactToSliderEdit();
};

BooleanSlotMorph.prototype.mouseEnter = function () {
	if (this.isWide()) {return; }
	if (this.nextValue() === null) {
		this.progress = -1; // 'fade'
	} else {
		this.progress = 1;
	}
	this.rerender();
};

BooleanSlotMorph.prototype.mouseLeave = function () {
	if (this.isWide()) {return; }
	this.progress = 0;
	this.rerender();
};

// BooleanSlotMorph layout:

BooleanSlotMorph.prototype.fixLayout = function () {
	// determine my extent
	var text, h;
	if (this.isWide()) {
		text = this.textLabelExtent();
		h = text.y + (this.edge * 3);
		this.bounds.setWidth(text.x + (h * 1.5) + (this.edge * 2));
		this.bounds.setHeight(h);
	} else {
		this.bounds.setWidth((this.fontSize + this.edge * 2) * 2);
		this.bounds.setHeight(this.fontSize + this.edge * 2);
	}
};

// BooleanSlotMorph drawing:

BooleanSlotMorph.prototype.render = function (ctx) {
	if (!(this.cachedNormalColor)) { // unless flashing
		this.color = this.parent ?
				this.parent.color : new Color(200, 200, 200);
	}
	this.cachedClr = this.color.toString();
	this.cachedClrBright = this.bright();
	this.cachedClrDark = this.dark();
	this.drawDiamond(ctx, this.progress);
	this.drawLabel(ctx);
	this.drawKnob(ctx, this.progress);
};

BooleanSlotMorph.prototype.drawDiamond = function (ctx, progress) {
	var w = this.width(),
		h = this.height(),
		r = h / 2,
		w2 = w / 2,
		shift = this.edge / 2,
		gradient;

	// draw the 'flat' shape:
	if (this.cachedNormalColor) { // if flashing
		ctx.fillStyle = this.color.toString();
	} else if (progress < 0 ) { // 'fade'
		ctx.fillStyle = this.color.darker(25).toString();
	} else {
		switch (this.value) {
		case true:
			ctx.fillStyle = 'rgb(0, 200, 0)';
			break;
		case false:
			ctx.fillStyle = 'rgb(200, 0, 0)';
			break;
		default:
			ctx.fillStyle = this.color.darker(25).toString();
		}
	}

	if (progress > 0 && !this.isEmptySlot()) {
		// left half:
		ctx.fillStyle = 'rgb(0, 200, 0)';
		ctx.beginPath();
		ctx.moveTo(0, r);
		ctx.lineTo(r, 0);
		ctx.lineTo(w2, 0);
		ctx.lineTo(w2, h);
		ctx.lineTo(r, h);
		ctx.closePath();
		ctx.fill();

		// right half:
		ctx.fillStyle = 'rgb(200, 0, 0)';
		ctx.beginPath();
		ctx.moveTo(w2, 0);
		ctx.lineTo(w - r, 0);
		ctx.lineTo(w, r);
		ctx.lineTo(w - r, h);
		ctx.lineTo(w2, h);
		ctx.closePath();
		ctx.fill();
	} else {
		ctx.beginPath();
		ctx.moveTo(0, r);
		ctx.lineTo(r, 0);
		ctx.lineTo(w - r, 0);
		ctx.lineTo(w, r);
		ctx.lineTo(w - r, h);
		ctx.lineTo(r, h);
		ctx.closePath();
		ctx.fill();
	}
};

BooleanSlotMorph.prototype.drawLabel = function (ctx) {
	var w = this.width(),
		r = this.height() / 2 - this.edge,
		r2 = r / 2,
		shift = this.edge / 2,
		text,
		x,
		y = this.height() / 2;

	if (this.isEmptySlot() || this.progress < 0) {
		return;
	}

	if (this.isWide()) { // draw the full text label
		text = this.textLabelExtent();
		y = this.height() - (this.height() - text.y) / 2;
		if (this.value) {
			x = this.height() / 2;
		} else {
			x = this.width() - (this.height() / 2) - text.x;
		}
		ctx.save();
		ctx.font = new StringMorph(null, this.fontSize, null, true).font();
		ctx.textAlign = 'left';
		ctx.textBaseline = 'bottom';
		ctx.fillStyle = 'rgb(255, 255, 255';
		ctx.fillText(
			localize(this.value ? 'true' : 'false'),
			x,
			y
		);
		ctx.restore();
		return;
	}

	// "tick:"
	x = r + (this.edge * 2) + shift;
	ctx.strokeStyle = 'white';
	ctx.lineWidth = this.edge + shift;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'miter';
	ctx.beginPath();
	ctx.moveTo(x - r2, y);
	ctx.lineTo(x, y + r2);
	ctx.lineTo(x + r2, r2 + this.edge);
	ctx.stroke();

	// "cross:"
	x = w - y - (this.edge * 2);
	ctx.strokeStyle = 'white';
	ctx.lineWidth = this.edge;
	ctx.lineCap = 'butt';
	ctx.beginPath();
	ctx.moveTo(x - r2, y - r2);
	ctx.lineTo(x + r2, y + r2);
	ctx.moveTo(x - r2, y + r2);
	ctx.lineTo(x + r2, y - r2);
	ctx.stroke();
};

BooleanSlotMorph.prototype.drawKnob = function (ctx, progress) {
	var w = this.width(),
		r = this.height() / 2,
		shift = this.edge / 2,
		slideStep = (this.width() - this.height()) / 4 *
			Math.max(0, (progress || 0)),
		gradient,
		x,
		y = r,
		outline = 1,
		outlineColor = new Color(30, 30, 30),
		color = new Color(220, 220, 220),
		contrast = 60,
		topColor = color.lighter(contrast),
		bottomColor = color.darker(contrast);

	// draw the 'flat' shape:
	switch (this.value) {
	case false:
		x = r + slideStep;
		if (progress < 0) {
			ctx.globalAlpha = 0.6;
		}
		break;
	case true:
		x = w - r - slideStep;
		break;
	default:
		if (!progress) {return; }
		x = r;
		ctx.globalAlpha = 0.6;
	}

	ctx.fillStyle = color.toString();
	ctx.beginPath();
	ctx.arc(x, y, r, radians(0), radians(360));
	ctx.closePath();
	ctx.fill();

	ctx.globalAlpha = 1;
};

BooleanSlotMorph.prototype.textLabelExtent = function () {
	var t, f;
	t = new StringMorph(
		localize('true'),
		this.fontSize,
		null,
		true // bold
	);
	f = new StringMorph(
		localize('false'),
		this.fontSize,
		null,
		true // bold
	);
	return new Point(Math.max(t.width(), f.width()), t.height());
};

// ArrowMorph //////////////////////////////////////////////////////////

/*
	I am a triangular arrow shape, for use in drop-down menus etc.
	My orientation is governed by my 'direction' property, which can be
	'down', 'up', 'left' or 'right'.
*/

// ArrowMorph inherits from Morph:

ArrowMorph.prototype = new Morph();
ArrowMorph.prototype.constructor = ArrowMorph;
ArrowMorph.uber = Morph.prototype;

// ArrowMorph instance creation:

function ArrowMorph(direction, size, padding, color, isBlockLabel) {
	this.init(direction, size, padding, color, isBlockLabel);
}

ArrowMorph.prototype.init = function (direction, size, padding, color, isLbl) {
	this.direction = direction || 'down';
	this.size = size || ((size === 0) ? 0 : 50);
	this.padding = padding || 0;
	this.isBlockLabel = isLbl || false;

	ArrowMorph.uber.init.call(this);
	this.color = color || BLACK;
	this.bounds.setWidth(this.size);
	this.bounds.setHeight(this.size);
	this.rerender();
};

ArrowMorph.prototype.setSize = function (size) {
	var min = Math.max(size, 1);
	this.size = size;
	this.changed();
	this.bounds.setWidth(min);
	this.bounds.setHeight(min);
	this.rerender();
};

// ArrowMorph displaying:

ArrowMorph.prototype.render = function (ctx) {
	// initialize my surface property
	var pad = this.padding,
		h = this.height(),
		h2 = h / 2,
		w = this.width(),
		w2 = w / 2;

	ctx.fillStyle = this.getRenderColor().toString();
	ctx.beginPath();
	if (this.direction === 'down') {
		ctx.moveTo(pad, h2);
		ctx.lineTo(w - pad, h2);
		ctx.lineTo(w2, h - pad);
	} else if (this.direction === 'up') {
		ctx.moveTo(pad, h2);
		ctx.lineTo(w - pad, h2);
		ctx.lineTo(w2, pad);
	} else if (this.direction === 'left') {
		ctx.moveTo(pad, h2);
		ctx.lineTo(w2, pad);
		ctx.lineTo(w2, h - pad);
	} else { // 'right'
		ctx.moveTo(w2, pad);
		ctx.lineTo(w - pad, h2);
		ctx.lineTo(w2, h - pad);
	}
	ctx.closePath();
	ctx.fill();
};

ArrowMorph.prototype.getRenderColor = function () {
	if (this.isBlockLabel) {
		return SyntaxElementMorph.prototype.alpha > 0.5 ? this.color : WHITE;
	}
	return this.color;
};

// TextSlotMorph //////////////////////////////////////////////////////

/*
	I am a multi-line input slot, primarily used in Snap's code-mapping
	blocks.
*/

// TextSlotMorph inherits from InputSlotMorph:

TextSlotMorph.prototype = new InputSlotMorph();
TextSlotMorph.prototype.constructor = TextSlotMorph;
TextSlotMorph.uber = InputSlotMorph.prototype;

// TextSlotMorph instance creation:

function TextSlotMorph(text, isNumeric, choiceDict, isReadOnly) {
	this.init(text, isNumeric, choiceDict, isReadOnly);
}

TextSlotMorph.prototype.init = function (
	text,
	isNumeric,
	choiceDict,
	isReadOnly
) {
	var contents = new InputSlotTextMorph(''),
		arrow = new ArrowMorph(
			'down',
			0,
			Math.max(Math.floor(this.fontSize / 6), 1),
			BLACK,
			true
		);

	contents.fontSize = this.fontSize;
	contents.fixLayout();

	this.isUnevaluated = false;
	this.choices = choiceDict || null; // object, function or selector
	this.oldContentsExtent = contents.extent();
	this.isNumeric = isNumeric || false;
	this.isReadOnly = isReadOnly || false;
	this.minWidth = 0; // can be chaged for text-type inputs ("landscape")
	this.constant = null;

	InputSlotMorph.uber.init.call(this, null, null, null, null, true); // sil.
	this.color = WHITE;
	this.add(contents);
	this.add(arrow);
	contents.isEditable = true;
	contents.isDraggable = false;
	contents.enableSelecting();
	this.setContents(''); // MicroBlocks wants a default value

};

// TextSlotMorph accessing:

TextSlotMorph.prototype.getSpec = function () {
	if (this.isNumeric) {
		return '%mlt';
	}
	return '%mlt'; // default
};

TextSlotMorph.prototype.contents = function () {
	return detect(
		this.children,
		child => child instanceof TextMorph
	);
};

// TextSlotMorph events:

TextSlotMorph.prototype.layoutChanged = function () {
	this.fixLayout();
};

// ColorSlotMorph //////////////////////////////////////////////////////

/*
	I am an editable input slot for a color. Users can edit my color by
	clicking on me, in which case a display a color gradient palette
	and let the user select another color. Note that the user isn't
	restricted to selecting a color from the palette, any color from
	anywhere within the World can be chosen.

	my block spec is %clr

	evaluate() returns my color
*/

// ColorSlotMorph inherits from ArgMorph:

ColorSlotMorph.prototype = new ArgMorph();
ColorSlotMorph.prototype.constructor = ColorSlotMorph;
ColorSlotMorph.uber = ArgMorph.prototype;

// ColorSlotMorph instance creation:

function ColorSlotMorph(clr) {
	this.init(clr);
}

ColorSlotMorph.prototype.init = function (clr) {
	ColorSlotMorph.uber.init.call(this);
	this.alpha = 1;
	this.setColor(clr);
	this.fixLayout();
};

ColorSlotMorph.prototype.getSpec = function () {
	return '%clr';
};

ColorSlotMorph.prototype.setContents = function (clr) {
	this.setColor(clr);
};

ColorSlotMorph.prototype.setColor = function (clr) {
	ColorSlotMorph.uber.setColor.call(
		this,
		isString(clr) && clr.length > 10 ? Color.fromString(clr)
			: (clr instanceof Color ? clr : new Color(145, 26, 68))
	);
};

// ColorSlotMorph color sensing:

ColorSlotMorph.prototype.getUserColor = function () {
	var myself = this,
		world = this.world(),
		hand = world.hand,
		posInDocument = getDocumentPositionOf(world.worldCanvas),
		mouseMoveBak = hand.processMouseMove,
		mouseDownBak = hand.processMouseDown,
		mouseUpBak = hand.processMouseUp,
		pal = new ColorPaletteMorph(null, new Point(
			this.fontSize * 16,
			this.fontSize * 10
		)),
		ctx;
	world.add(pal);
	pal.setPosition(this.bottomLeft().add(new Point(0, this.edge)));

	// cache the world surface property (its full image)
	// to prevent memory issues from constantly generating
	// huge canvasses and and reading back pixel data only once
	// note: this optimization makes it hard / impossible for the
	// user to "catch" and sample the color of moving sprites
	// but without it Chrome crashes as of Fall 2023
	ctx = Morph.prototype.fullImage.call(world).getContext('2d');

	hand.processMouseMove = function (event) {
		var pos = hand.position(),
			dta = ctx.getImageData(pos.x, pos.y, 1, 1).data;
		hand.setPosition(new Point(
			event.pageX - posInDocument.x,
			event.pageY - posInDocument.y
		));
		myself.setColor(new Color(dta[0], dta[1], dta[2]));
	};

	hand.processMouseDown = nop;

	hand.processMouseUp = function () {
		pal.destroy();
		hand.processMouseMove = mouseMoveBak;
		hand.processMouseDown = mouseDownBak;
		hand.processMouseUp = mouseUpBak;
	};
};

// ColorSlotMorph events:

ColorSlotMorph.prototype.mouseClickLeft = function () {
	this.getUserColor();
};

// ColorSlotMorph evaluating:

ColorSlotMorph.prototype.evaluate = function () {
	return this.color;
};

// ColorSlotMorph drawing:

ColorSlotMorph.prototype.fixLayout = function () {
	// determine my extent
	var side = this.fontSize + this.edge * 2 + this.typeInPadding * 2;
	this.bounds.setWidth(side);
	this.bounds.setHeight(side);
};

ColorSlotMorph.prototype.render = function (ctx) {
	var borderColor;

	if (this.parent) {
		borderColor = this.parent.color;
	} else {
		borderColor = new Color(120, 120, 120);
	}
	ctx.fillStyle = this.color.toString();

	// cache my border colors
	this.cachedClr = borderColor.toString();
	this.cachedClrBright = borderColor.lighter(this.contrast)
		.toString();
	this.cachedClrDark = borderColor.darker(this.contrast).toString();

	ctx.fillRect(
		this.edge,
		this.edge,
		this.width() - this.edge * 2,
		this.height() - this.edge * 2
	);
};

ColorSlotMorph.prototype.drawRectBorder =
	InputSlotMorph.prototype.drawRectBorder;

// BlockHighlightMorph /////////////////////////////////////////////////

/*
	I am a glowing halo around a block or stack of blocks indicating that
	a script is currently active or has encountered an error.
	I halso have an optional readout that can display a thread count
	if more than one process shares the same script
*/

// BlockHighlightMorph inherits from Morph:

BlockHighlightMorph.prototype = new Morph();
BlockHighlightMorph.prototype.constructor = BlockHighlightMorph;
BlockHighlightMorph.uber = Morph.prototype;

// BlockHighlightMorph instance creation:

function BlockHighlightMorph() {
	this.threadCount = 0;
	this.init();
}

BlockHighlightMorph.prototype.init = function () {
	BlockHighlightMorph.uber.init.call(this);
	this.isCachingImage = true;
};

// BlockHighlightMorph thread count readout

BlockHighlightMorph.prototype.readout = function () {
	return this.children.length ? this.children[0] : null;
};

BlockHighlightMorph.prototype.updateReadout = function () {
	var readout = this.readout(),
		inset = SyntaxElementMorph.prototype.activeBorder * -2;
	if (this.threadCount < 2) {
		if (readout) {
			readout.destroy();
		}
		return;
	}
	if (readout) {
		readout.changed();
		readout.contents = this.threadCount.toString();
		readout.fixLayout();
		readout.rerender();
	} else {
		readout = new SpeechBubbleMorph(
			this.threadCount.toString(),
			this.color, // color,
			null, // edge,
			null, // border,
			this.color.darker(), // borderColor,
			null, // padding,
			1, // isThought - don't draw a hook
			true // no shadow - faster
		);
		this.add(readout);
	}
	readout.setPosition(this.position().add(inset));
};

// MultiArgMorph ///////////////////////////////////////////////////////

/*
	I am an arity controlled list of input slots

	my block specs are

		%mult%x - where x is any single input slot
		%group%x%y - where x and y are any single input slots
		%inputs - for an additional text label 'with inputs'

	evaluation is handles by the interpreter
*/

// MultiArgMorph inherits from ArgMorph:

MultiArgMorph.prototype = new ArgMorph();
MultiArgMorph.prototype.constructor = MultiArgMorph;
MultiArgMorph.uber = ArgMorph.prototype;

// MultiArgMorph instance creation:

function MultiArgMorph(
	slotSpec,
	labelTxt,
	min,
	eSpec,
	arrowColor,
	labelColor,
	shadowColor,
	shadowOffset,
	isTransparent,
	infix,
	collapse,
	defaults,
	group
) {
	this.init(
		slotSpec,
		labelTxt,
		min,
		eSpec,
		arrowColor,
		labelColor,
		shadowColor,
		shadowOffset,
		isTransparent,
		infix,
		collapse,
		defaults,
		group
	);
}

MultiArgMorph.prototype.init = function (
	slotSpec, // string or array of type strings
	labelTxt, // string or array of prefix labels
	min,
	eSpec,
	arrowColor,
	labelColor,
	shadowColor,
	shadowOffset,
	isTransparent,
	infix,
	collapse,
	defaults,
	group
) {
	var label,
		collapseLabel,
		arrows = new FrameMorph(),
		initial = min || 0,
		listSymbol,
		leftArrow,
		rightArrow,
		i;

	this.slotSpec = slotSpec || '%s';
	this.labelText = labelTxt instanceof Array ?
		labelTxt.map(each => localize(each || ''))
		: localize(labelTxt || '');
	this.infix = infix || '';
	this.collapse = localize(collapse || '');
	this.defaultValue = defaults || null;
	this.groupInputs = 1;
	this.initialSlots = isNil(initial) ? 1 : initial ;
	this.minInputs = this.infix ? 0 : initial;
	this.maxInputs = 0;
	this.elementSpec = eSpec || null;
	this.labelColor = labelColor || null;
	this.shadowColor = shadowColor || null;
	this.shadowOffset = shadowOffset || null;

	// in case an input group spec is specified, initialize it
	this.initGroup(group);

	this.canBeEmpty = true;
	MultiArgMorph.uber.init.call(this);

	// MultiArgMorphs are transparent by default b/c of zebra coloring
	this.alpha = isTransparent === false ? 1 : 0;
	arrows.alpha = isTransparent === false ? 1 : 0;

	// collapse label text:
	if (this.collapse) {
		collapseLabel = this.labelPart(this.collapse);
		this.add(collapseLabel);
		collapseLabel.hide();
	}

	// label text:
	if (this.labelText || (this.slotSpec === '%cs')) {
		label = this.labelPart(
			this.labelText instanceof Array ?
				this.labelText[0]
				: this.labelText
		);
		this.add(label);
		label.hide();
	}

	// left arrow:
	leftArrow = new ArrowMorph(
		'left', // direction
		fontHeight(this.fontSize), // size
		Math.max(Math.floor(this.fontSize / 6), 1), // padding
		arrowColor,
		true // isLbl
	);

	// right arrow:
	rightArrow = new ArrowMorph(
		'right', // direction
		fontHeight(this.fontSize), // size
		Math.max(Math.floor(this.fontSize / 6), 1), // padding
		arrowColor,
		true // isLbl
	);

	// list symbol:
	// listSymbol = this.labelPart('$verticalEllipsis-0.98');

	// alternative list symbol designs to contemplate in the future:
	// listSymbol = this.labelPart('$listNarrow-0.9');

	/*
	listSymbol = this.labelPart('$listNarrow-.98');
	listSymbol.backgroundColor = new Color(255, 140, 0); // list color
	*/

	// /*
	// listSymbol = new SymbolMorph('listNarrow', this.fontSize * 0.8);
	// */

	// control panel:
	arrows.add(leftArrow);
	arrows.add(rightArrow);
	arrows.rerender();
	arrows.acceptsDrops = false;

	this.add(arrows);

	// create the initial number of inputs
	for (i = 0; i < initial; i += 1) {
		this.addInput();
	}
};

MultiArgMorph.prototype.initGroup = function (aBlockSpec) {
	var groupSpec,
		words,
		isSlot = word => word.startsWith('%') && word.length > 1,
		labels = [],
		part = [];
	if (aBlockSpec) {
		// translate block spec
		groupSpec = BlockMorph.prototype.localizeBlockSpec(aBlockSpec);
		// determine input slot specs
		words =	 groupSpec.split(' ');
		this.slotSpec = words.filter(word => isSlot(word));
		// determine group size
		this.groupInputs = this.slotSpec.length;
		// determine label texts
		words.forEach(word => {
			if (isSlot(word)) {
				labels.push(part);
				part = [];
			} else {
				part.push(word);
			}
		});
		// only add a postfix if it's non-empty
		if (part.some(any => any.length)) {
			labels.push(part);
		}
		this.labelText = labels.map(arr => arr.join(' '));
	}
};

MultiArgMorph.prototype.collapseLabel = function () {
	return this.collapse ? this.children[0] : null;
};

MultiArgMorph.prototype.label = function () {
	return this.labelText ?
		this.children[this.collapse ? 1 : 0]
		: null;
};

MultiArgMorph.prototype.allLabels = function () {
	// including infix labels
	return this.children.filter(m => m instanceof BlockLabelMorph);
};

MultiArgMorph.prototype.arrows = function () {
	return this.children[this.children.length - 1];
};

MultiArgMorph.prototype.listSymbol = function () {
	return this.arrows().children[2];
};

MultiArgMorph.prototype.getSpec = function () {
	return '%mult' + this.slotSpec;
};

MultiArgMorph.prototype.setIrreplaceable = function (irreplaceable = false) {
	this.isStatic = irreplaceable;
	this.canBeEmpty = !irreplaceable;
	this.fixLayout();
};

MultiArgMorph.prototype.setInfix = function (separator = '') {
	var inps;
	if (this.infix === separator) {
		return;
	}
	inps = this.inputs();
	this.collapseAll();
	this.infix = (separator === '$nl' ? '%br' : separator);
	inps.forEach(slot => this.replaceInput(this.addInput(), slot));
	if (inps.length === 1 && this.infix) { // show at least 2 slots with infix
		this.addInput();
	}
};

MultiArgMorph.prototype.setCollapse = function (collapse = '') {
	var inps, coll, collapseLabel;
	if (this.collapse === collapse) {
		return;
	}
	coll = this.collapseLabel();
	inps = this.inputs();
	this.collapseAll();
	this.collapse = collapse;
	this.removeChild(coll); // shouldn't matter if coll is null
	if (this.collapse) {
		collapseLabel = this.labelPart(this.collapse);
		this.addChildFirst(collapseLabel);
		collapseLabel.hide();
	}
	inps.forEach(slot => this.replaceInput(this.addInput(), slot));
	if (inps.length === 1 && this.infix) { // show at least 2 slots with infix
		this.addInput();
	}
	this.fixLayout();
};

MultiArgMorph.prototype.setExpand = function (expand) {
	var inps, label;

	// parse expansion labels to determine its cardiinality
	function massage(str) {
		var items = (str || '').toString().split('\n').map(line => {
				let dta = line.trim();
				return dta === '$nl' ? '%br'
					: (dta.startsWith('$_') ? localize(dta.slice(2)) : dta);
			}).filter(each => each.length);
		return items.length > 1 ? items : items[0] || null;
	}

	if (this.labelText === expand) {
		return;
	}
	label = this.label();
	inps = this.inputs();
	this.collapseAll();
	this.labelText = massage(expand);
	this.removeChild(label); // shouldn't matter if coll is null
	if (this.labelText) {
		label = this.labelPart(
			this.labelText instanceof Array ?
				this.labelText[0]
				: this.labelText
		);
		this.children.splice(this.collapse ? 1 : 0, null, label);
		label.parent = this;
		label.hide();
	}
	inps.forEach(slot => this.replaceInput(this.addInput(), slot));
	if (inps.length === 1 && this.infix) { // show at least 2 slots with infix
		this.addInput();
	}
	this.fixLayout();
};

MultiArgMorph.prototype.setDefaultValue = function (defaultValue) {

	// parse default values to determine their arity
	function massage(str) {
		var items = (str || '').toString().split('\n')
			.filter(each => each.length).map(each =>
				isString(each) && each.length > 2 && each.startsWith('$_') ?
					localize(each.slice(2))
					: each);
		return items.length > 1 ? items : items[0] || null;
	}

	if (this.defaultValue === defaultValue) {
		return;
	}
	this.defaultValue = massage(defaultValue);
};

MultiArgMorph.prototype.setInitialSlots = function (initialSlots) {
	this.initialSlots = Math.min(initialSlots, 12);
};

MultiArgMorph.prototype.setMinSlots = function (minSlots) {
	this.minInputs = Math.min(minSlots, 12);
};

MultiArgMorph.prototype.setMaxSlots = function (maxSlots) {
	this.maxInputs = +maxSlots;
};

// MultiArgMorph defaults:

MultiArgMorph.prototype.setContents = function (anArray) {
	var inputs = this.inputs(), i;

	if (!(anArray instanceof Array) && this.slotSpec === '%rcv') {
		// special case for migrating former SEND block inputs to
		// newer BROADCAST expansion slots for receivers
		// this can be removed once all SEND blocks have been
		// converted to v7
		anArray = [anArray];
	}

	for (i = 0; i < anArray.length; i += 1) {
		if (anArray[i] !== null && (inputs[i])) {
			inputs[i].setContents(anArray[i]);
		}
	}
};

// MultiArgMorph hiding and showing:

/*
	override the inherited behavior to recursively hide/show all
	children, so that my instances get restored correctly when
	switching back out of app mode.
*/

MultiArgMorph.prototype.hide = function () {
	this.isVisible = false;
	this.changed();
};

MultiArgMorph.prototype.show = function () {
	this.isVisible = true;
	this.changed();
};

// MultiArgMorph coloring:

MultiArgMorph.prototype.setLabelColor = function (
	textColor,
	shadowColor,
	shadowOffset
) {
	this.textColor = textColor;
	this.shadowColor = shadowColor;
	this.shadowOffset = shadowOffset;
	MultiArgMorph.uber.setLabelColor.call(
		this,
		textColor,
		shadowColor,
		shadowOffset
	);
};

// MultiArgMorph layout:

MultiArgMorph.prototype.fixLayout = function () {
	var labels, shadowColor, shadowOffset, block;
	if (this.slotSpec === '%t') {
		this.isStatic = true; // in this case I cannot be exchanged
	}
	if (this.parent) {
		labels = this.allLabels();
		this.color = this.parent.color;
		this.arrows().color = this.color;
		shadowColor = this.shadowColor ||
			this.parent.color.darker(this.labelContrast);
		block = this.parentThatIsA(BlockMorph);
		if (labels.length) {
			labels.forEach(label => {
				shadowOffset = this.shadowOffset ||
					(label ? label.shadowOffset : null);
				if (!label.shadowColor.eq(shadowColor)) {
					label.shadowColor = shadowColor;
					label.shadowOffset = shadowOffset;
					label.fixLayout();
					label.rerender();
				}
			});
		}
	}
	this.fixArrowsLayout();
	MultiArgMorph.uber.fixLayout.call(this);
	if (this.parent) {
		this.parent.fixLayout();
	}
};

MultiArgMorph.prototype.fixArrowsLayout = function () {
	var label = this.label(),
		collapseLabel = this.collapseLabel(),
		arrows = this.arrows(),
		leftArrow = arrows.children[0],
		rightArrow = arrows.children[1],
		listSymbol = arrows.children[2],
		inpCount = this.inputs().length,
		dim = new Point(rightArrow.width() / 2, rightArrow.height()),
		centerList = true;
	leftArrow.show();
	rightArrow.show();
	arrows.setHeight(dim.y);
	if (collapseLabel) {
		collapseLabel.hide();
	}
	if (inpCount < (this.minInputs + 1)) { // hide left arrow
		if (label) {
			label.hide();
		}
		leftArrow.hide();
		if (this.minInputs && this.minInputs === this.maxInputs) {
			rightArrow.hide();
		}
		if (this.isStatic) {
			arrows.setWidth(dim.x);
		} else {
			if (collapseLabel) {
				collapseLabel.show();
			}
			arrows.setWidth(dim.x * 1.3);
			centerList = false;
		}
	} else { // show both arrows
		if (label) {
			label.show();
		}
		arrows.setWidth(dim.x * 2.4);
		if (this.maxInputs && inpCount > this.maxInputs - 1) {
			// hide right arrow
			rightArrow.hide();
			if (this.isStatic) {
				arrows.setWidth(dim.x);
			} else {
				arrows.setWidth(dim.x * 1.3);
				centerList = false;
			}
		}
	}
	leftArrow.setCenter(arrows.center());
	leftArrow.setLeft(arrows.left());
	rightArrow.setCenter(arrows.center());
	rightArrow.setRight(arrows.right());
	arrows.rerender();
};

MultiArgMorph.prototype.fixHolesLayout = function () {
	var pos;
	this.holes = [];
	if (this.slotSpec.includes('%cs')) {
		pos = this.position();
		this.inputs().forEach(slot => {
			if (slot instanceof CSlotMorph) {
				slot.fixHolesLayout();
				this.holes.push(
					slot.holes[0].translateBy(slot.position().subtract(pos))
				);
			}
		});
	}
};

MultiArgMorph.prototype.refresh = function () {
	this.inputs().forEach(input => {
		input.fixLayout();
		input.rerender();
	});
};

// MultiArgMorph deleting & inserting slots:
/*
	caution, only call these methods with "primitive" inputs,
	since they don't preserve embedded blocks (yes, on purpose)
*/

MultiArgMorph.prototype.deleteSlot = function (anInput) {
	var len = this.inputs().length,
		idx = this.children.indexOf(anInput),
		block = this.parentThatIsA(BlockMorph),
		sprite = block.scriptTarget();
	if (len <= this.minInputs) {
		return;
	}
	if (this.infix) {
		if (idx === (this.children.length - 2)) { // b/c arrows
			this.removeChild(this.children[idx - 1]);
		} else {
			this.removeChild(this.children[idx + 1]);
		}
	}
	this.removeChild(anInput);
	this.fixLayout();
	sprite.recordUserEdit(
		'scripts',
		'poly slot',
		'delete',
		block.abstractBlockSpec()
	);
	if (block.isCustomBlock) {
		block.fireSlotEditedEvent(this);
	}
};

MultiArgMorph.prototype.insertNewInputBefore = function (anInput, contents) {
	var idx = this.children.indexOf(anInput),
		newPart = this.labelPart(this.slotSpec),
		block = this.parentThatIsA(BlockMorph),
		infix;

	if (this.maxInputs && (this.inputs().length >= this.maxInputs)) {
		return;
	}
	if (contents) {
		newPart.setContents(contents);
	}
	newPart.parent = this;
	if (this.infix) {
		infix = this.labelPart(localize(this.infix));
		infix.parent = this;
		this.children.splice(idx, 0, newPart, infix);
	} else {
		this.children.splice(idx, 0, newPart);
	}
	newPart.fixLayout();
	if (this.parent instanceof BlockMorph) {
		this.parent.fixLabelColor();
	}
	this.fixLayout();
	return newPart;
};

// MultiArgMorph arity control:

MultiArgMorph.prototype.addInput = function (contents) {
	var len = this.inputs().length,
		newPart = this.labelPart(this.slotSpecFor(len)),
		value = isNil(contents) ? this.defaultValueFor(len) : contents,
		i, name, idx;

	this.addInfix();
	idx = this.children.length - 1;
	if (value !== '' && !isNil(value)) {
		newPart.setContents(value);
	} else if (this.elementSpec === '%scriptVars' ||
			this.elementSpec === '%blockVars') {
		name = '';
		i = idx;
		if (this.elementSpec === '%scriptVars') {
			// compensate for missing label element
			i += 1;
		}
		while (i > 0) {
			name = String.fromCharCode(97 + (i - 1) % 26) + name;
			i = Math.floor((i - 1) / 26);
		}
		newPart.setContents(name);
	} else if (this.elementSpec === '%message') {
		newPart.setContents(localize('data'));
	} else if (this.elementSpec === '%keyName') {
		newPart.setContents(localize('key'));
	}
	newPart.parent = this;
	this.children.splice(idx, 0, newPart);
	this.addPostfix();
	newPart.fixLayout();
	if (this.parent instanceof BlockMorph) {
		this.parent.fixLabelColor();
	}
	this.fixLayout();
	return newPart;
};

MultiArgMorph.prototype.addInfix = function () {
	var infix,
		len = this.inputs().length,
		label = this.infix ? localize(this.infix)
		: (this.labelText instanceof Array ?
			(this.slotSpec instanceof Array ?
				this.labelText[len % this.slotSpec.length]
				: this.labelText[len % this.labelText.length])
			: '');

	if (label === '' || !len || this.children.length < 2) {return; }
	infix = this.labelPart(label);
	infix.parent = this;
	this.children.splice(this.children.length - 1, 0, infix);
};

MultiArgMorph.prototype.addPostfix = function () {
	var postfix;
	if (this.labelText instanceof Array &&
		this.slotSpec instanceof Array &&
		this.inputs().length % this.slotSpec.length === 0 &&
		this.labelText.length === (this.slotSpec.length + 1)
	) {
		postfix = this.labelPart(this.labelText[this.slotSpec.length]);
		postfix.parent = this;
		this.children.splice(this.children.length - 1, 0, postfix);
	}
};

MultiArgMorph.prototype.removePostfix = function (idx) {
	if (this.labelText instanceof Array &&
		idx % this.slotSpec.length === 0 &&
		this.labelText.length === (this.slotSpec.length + 1)
	) {
		this.removeChild(this.children[this.children.length - 2]);
	}
};

MultiArgMorph.prototype.removeInput = function () {
	var len = this.inputs().length,
		oldPart, scripts;
	if (len > 0) {
		this.removePostfix(len);
		oldPart = this.inputs()[len - 1];
		this.removeChild(oldPart);
		if (oldPart instanceof CSlotMorph) {
			oldPart = oldPart.nestedBlock();
		}
		if (oldPart instanceof BlockMorph && !oldPart.contents()) {
			scripts = this.parentThatIsA(ScriptsMorph);
			if (scripts) {
				oldPart.moveBy(10);
				scripts.add(oldPart);
			}
		}
	}
	if (this.infix ||
		(this.labelText instanceof Array && this.inputs().length)
	) {
		if (this.children.length > (this.collapse ? 2 : 1) &&
				!(this.labelText instanceof Array &&
					this.labelText[this.inputs().length % this.slotSpec.length]
						=== '')
		) {
			this.removeChild(this.children[this.children.length - 2]);
		}
	}
	this.fixLayout();
};

MultiArgMorph.prototype.collapseAll = function () {
	var len = this.inputs().length,
		i;
	for (i = 0; i < len; i += 1) {
		this.removeInput();
	}
};

MultiArgMorph.prototype.expandTo = function (arity = 0) {
	// experimental in v10.2
	var len = this.inputs().length,
		i;

	arity = Math.max(arity, this.minInputs);
	if (this.maxInputs > 0) {
		arity = Math.min(arity, this.maxInputs);
	}
	if (arity > len) {
		for (i = len; i < arity; i += 1) {
			this.addInput();
		}
	} else if (arity < len) {
		for (i = len; i > arity; i -= 1) {
			this.removeInput();
		}
	}
};

MultiArgMorph.prototype.slotSpecFor = function (index) {
	return this.slotSpec instanceof Array ?
		this.slotSpec[index % this.slotSpec.length]
		: this.slotSpec;
};

MultiArgMorph.prototype.defaultValueFor = function (index) {
	var dta = this.defaultValueDataFor(index);
	return this.parentThatIsA(BlockMorph)?.definition?.selector ?
		localize(dta) : dta;
};

MultiArgMorph.prototype.defaultValueDataFor = function (index) {
	// private - answer the raw untranslated data
	// repeat & wrap default values inside label groups
	if (!this.parent || this.groupInputs > 1) {
		return this.defaultValue instanceof Array ?
			this.defaultValue[index % this.defaultValue.length]
			: this.defaultValue;
	}

	// otherwise use them just once each
	if (this.defaultValue instanceof Array) {
		return this.defaultValue[index] || '';
	}
	return index ? '' : this.defaultValue;
};

// MultiArgMorph events:

MultiArgMorph.prototype.mouseClickLeft = function (pos) {
	// prevent expansion in the palette
	// (because it can be hard or impossible to collapse again)
	var block = this.parentThatIsA(BlockMorph);
	if (!this.parentThatIsA(ScriptsMorph)) {
		this.escalateEvent('mouseClickLeft', pos);
		return;
	}
	// if the <shift> key is pressed, repeat action 3 times
	var arrows = this.arrows(),
		leftArrow = arrows.children[0],
		rightArrow = arrows.children[1],
		arrowsBounds = this.arrows().bounds.expandBy(this.fontSize / 3),
		arrowsCenter = arrows.center().x,
		isExpansionClick,
		repetition = this.groupInputs *
			(this.world().currentKey === 16 ? 3 : 1),
		i;

	if (arrowsBounds.containsPoint(pos)) {
		if (leftArrow.isVisible && rightArrow.isVisible) {
			isExpansionClick = pos.x >= arrowsCenter;
		} else {
			isExpansionClick = rightArrow.isVisible;
		}
		if (isExpansionClick) { // right arrow
			if (this.infix && !this.inputs().length) {
				repetition = Math.max(repetition, 2);
			}
			for (i = 0; i < repetition; i += 1) {
				if (rightArrow.isVisible) {
					this.addInput();
				}
			}
		} else { // left arrow
			if (this.infix && this.inputs().length < 3) {
				repetition = 2;
			}
			for (i = 0; i < repetition; i += 1) {
				if (leftArrow.isVisible) {
					this.removeInput();
				}
			}
		}
		if (block.isCustomBlock) {
			block.fireSlotEditedEvent(this);
		}
	} else {
		this.escalateEvent('mouseClickLeft', pos);
	}
};

// MultiArgMorph menu:

MultiArgMorph.prototype.userMenu = function () {
	var menu = new MenuMorph(this),
		block = this.parentThatIsA(BlockMorph),
		key = '';
	if (!StageMorph.prototype.enableCodeMapping) {
		return this.parent.userMenu();
	}
	if (block) {
		if (block.selector === 'doDeclareVariables') {
			key = 'tempvars_';
		}
	}
	menu.addItem(
		'code list mapping...',
		() => this.mapCodeList(key)
	);
	menu.addItem(
		'code item mapping...',
		() => this.mapCodeItem(key)
	);
	menu.addItem(
		'code delimiter mapping...',
		() => this.mapCodeDelimiter(key)
	);
	return menu;
};

// MultiArgMorph arity evaluating:

MultiArgMorph.prototype.evaluate = function () {
	// this is usually overridden by the interpreter. This method is only
	// called (and needed) for the variables menu.

	var result = [];
	this.inputs().forEach(slot =>
		result.push(slot.evaluate())
	);
	return result;
};

MultiArgMorph.prototype.isEmptySlot = function () {
	return this.canBeEmpty ? this.inputs().length === 0 : false;
};

// MultiArgMorph op-sequence analysis

MultiArgMorph.prototype.unwind = BlockMorph.prototype.unwind;
MultiArgMorph.prototype.unwindAfter = BlockMorph.prototype.unwindAfter;

// ArgLabelMorph ///////////////////////////////////////////////////////

/*
	I am a label string that is wrapped around an ArgMorph, usually
	a MultiArgMorph, so to indicate that it has been replaced entirely
	for an embedded reporter block

	I don't have a block spec, I get embedded automatically by the parent
	block's argument replacement mechanism

	My evaluation method is the identity function, i.e. I simply pass my
	input's value along.
*/

// ArgLabelMorph inherits from ArgMorph:

ArgLabelMorph.prototype = new ArgMorph();
ArgLabelMorph.prototype.constructor = ArgLabelMorph;
ArgLabelMorph.uber = ArgMorph.prototype;

// MultiArgMorph instance creation:

function ArgLabelMorph(argMorph, labelTxt) {
	this.init(argMorph, labelTxt);
}

ArgLabelMorph.prototype.init = function (argMorph, labelTxt) {
	var label;

	this.labelText = localize(labelTxt || 'input list:');
	ArgLabelMorph.uber.init.call(this);

	this.isStatic = true; // I cannot be exchanged

	// ArgLabelMorphs are transparent
	this.alpha = 0;

	// label text:
	label = this.labelPart(this.labelText);
	this.add(label);

	// argMorph
	this.add(argMorph);
};

ArgLabelMorph.prototype.label = function () {
	return this.children[0];
};

ArgLabelMorph.prototype.argMorph = function () {
	return this.children[1];
};

// ArgLabelMorph layout:

ArgLabelMorph.prototype.fixLayout = function () {
	var label = this.label(),
		shadowColor,
		shadowOffset;

	if (this.parent) {
		this.color = this.parent.color;
		shadowOffset = label.shadowOffset || ZERO;

		// determine the shadow color for zebra coloring:
		if (shadowOffset.x < 0) {
			shadowColor = this.parent.color.darker(this.labelContrast);
		} else {
			shadowColor = this.parent.color.lighter(this.labelContrast);
		}

		if (this.labelText !== '') {
			if (!label.shadowColor.eq(shadowColor)) {
				label.shadowColor = shadowColor;
				label.shadowOffset = shadowOffset;
				label.rerender();
			}
		}
	}
	ArgLabelMorph.uber.fixLayout.call(this);
	if (this.parent) {
		this.parent.fixLayout();
	}
};

ArgLabelMorph.prototype.refresh = function () {
	this.inputs().forEach(input => {
		input.fixLayout();
		input.rerender();
	});
};

// ArgLabelMorph label color:

ArgLabelMorph.prototype.setLabelColor = function (
	textColor,
	shadowColor,
	shadowOffset
) {
	if (this.labelText !== '') {
		var label = this.label();
		label.color = textColor;
		label.shadowColor = shadowColor;
		label.shadowOffset = shadowOffset;
		label.rerender();
	}
};

// ArgLabelMorph events:

ArgLabelMorph.prototype.reactToGrabOf = function () {
	if (this.parent instanceof SyntaxElementMorph) {
		this.parent.revertToDefaultInput(this);
	}
};

// ArgLabelMorph evaluating:

ArgLabelMorph.prototype.evaluate = function () {
	// this is usually overridden by the interpreter. This method is only
	// called (and needed) for the variables menu.

	return this.argMorph().evaluate();
};

ArgLabelMorph.prototype.isEmptySlot = function () {
	return false;
};

// ScriptFocusMorph //////////////////////////////////////////////////////////

/*
	I offer keyboard navigation for syntax elements, blocks and scripts:

	activate:
	  - shift + click on a scripting pane's background
	  - shift + click on any block
	  - shift + enter in the IDE's edit mode

	stop editing:
	  - left-click on scripting pane's background
	  - esc

	navigate among scripts:
	  - tab: next script
	  - backtab (shift + tab): last script

	start editing a new script:
	  - shift + enter

	navigate among commands within a script:
	  - down arrow: next command
	  - up arrow: last command

	navigate among all elements within a script:
	  - right arrow: next element (block or input)
	  - left arrow: last element

	move the currently edited script (stack of blocks):
	  - shift + arrow keys (left, right, up, down)

	editing scripts:

	  - backspace:
		* delete currently focused reporter
		* delete command above current insertion mark (blinking)
		* collapse currently focused variadic input by one element

	  - enter:
		* edit currently focused input slot
		* expand currently focused variadic input by one element

	  - space:
		* activate currently focused input slot's pull-down menu, if any
		* show a menu of reachable variables for the focused input or reporter

	  - any other key:
		start searching for insertable matching blocks

	  - in menus triggered by this feature:
		* navigate with up / down arrow keys
		* trigger selection with enter
		* cancel menu with esc

	  - in the search bar triggered b this feature:
		* keep typing / deleting to narrow and update matches
		* navigate among shown matches with up / down arrow keys
		* insert selected match at the focus' position with enter
		* cancel searching and inserting with esc

	running the currently edited script:
		* shift+ctrl+enter simulates clicking the edited script with the mouse
*/

// ScriptFocusMorph inherits from BoxMorph:

ScriptFocusMorph.prototype = new BoxMorph();
ScriptFocusMorph.prototype.constructor = ScriptFocusMorph;
ScriptFocusMorph.uber = BoxMorph.prototype;

// ScriptFocusMorph instance creation:

function ScriptFocusMorph(editor, initialElement, position) {
	this.init(editor, initialElement, position);
}

ScriptFocusMorph.prototype.init = function (
	editor,
	initialElement,
	position
) {
	this.editor = editor; // a ScriptsMorph
	this.element = initialElement;
	this.atEnd = false;
	ScriptFocusMorph.uber.init.call(this);
	if (this.element instanceof ScriptsMorph) {
		this.setPosition(position);
	}
};

// ScriptFocusMorph keyboard focus:

ScriptFocusMorph.prototype.getFocus = function (world) {
	if (!world) {world = this.world(); }
	if (world && world.keyboardFocus !== this) {
		world.stopEditing();
	}
	world.keyboardFocus = this;
	this.fixLayout();
	this.editor.updateToolbar();
};

// ScriptFocusMorph layout:

ScriptFocusMorph.prototype.fixLayout = function () {
	this.changed();
	if (this.element instanceof CommandBlockMorph ||
			this.element instanceof CommandSlotMorph ||
			this.element instanceof ScriptsMorph) {
		this.manifestStatement();
	} else {
		this.manifestExpression();
	}
	this.editor.add(this); // come to front
	this.scrollIntoView();
	this.changed();
};

ScriptFocusMorph.prototype.manifestStatement = function () {
	var newScript = this.element instanceof ScriptsMorph,
		y = this.element.top();
	this.border = 0;
	this.edge = 0;
	this.alpha = 1;
	this.color = this.editor.feedbackColor;
	this.bounds.setExtent(new Point(
		newScript ?
				SyntaxElementMorph.prototype.hatWidth : this.element.width(),
		Math.max(
			SyntaxElementMorph.prototype.corner,
			SyntaxElementMorph.prototype.feedbackMinHeight
		)
	));
	if (this.element instanceof CommandSlotMorph) {
		y += SyntaxElementMorph.prototype.corner;
	} else if (this.atEnd) {
		y = this.element.bottom();
	}
	if (!newScript) {
		this.setPosition(new Point(
			this.element.left(),
			y
		));
	}
	this.fps = 2;
	this.show();
	this.step = function () {
		this.toggleVisibility();
	};
};

ScriptFocusMorph.prototype.manifestExpression = function () {
	this.edge = SyntaxElementMorph.prototype.rounding;
	this.border = Math.max(
		SyntaxElementMorph.prototype.edge,
		3
	);
	this.color = this.editor.feedbackColor.copy();
	this.color.a = 0.5;
	this.borderColor = this.editor.feedbackColor;

	this.bounds = this.element.fullBounds()
		.expandBy(Math.max(
			SyntaxElementMorph.prototype.edge * 2,
			SyntaxElementMorph.prototype.reporterDropFeedbackPadding
		));
	this.rerender();
	delete this.fps;
	delete this.step;
	this.show();
};

// ScriptFocusMorph editing

ScriptFocusMorph.prototype.trigger = function () {
	var current = this.element,
		i;
	if (current instanceof MultiArgMorph) {
		for (i = 0; i < current.groupInputs; i += 1) {
			if (current.arrows().children[1].isVisible) {
				current.addInput();
				this.fixLayout();
			}
		}
		return;
	}
	if (current.parent instanceof TemplateSlotMorph) {
		current.mouseClickLeft();
		return;
	}
	if (current instanceof BooleanSlotMorph) {
		current.toggleValue();
		return;
	}
	if (current instanceof InputSlotMorph) {
		if (!current.isReadOnly) {
			delete this.fps;
			delete this.step;
			this.hide();
			this.world().onNextStep = () => {
				current.contents().edit();
				current.contents().selectAll();
			};
		} else if (current.choices) {
			current.dropDownMenu(true);
			delete this.fps;
			delete this.step;
			this.hide();
		}
	}
};

ScriptFocusMorph.prototype.menu = function () {
	var current = this.element;
	if (current instanceof InputSlotMorph && current.choices) {
		current.dropDownMenu(true);
		delete this.fps;
		delete this.step;
		this.hide();
	} else {
		this.insertVariableGetter();
	}
};

ScriptFocusMorph.prototype.deleteLastElement = function () {
	var current = this.element,
		i;
	if (current.parent instanceof ScriptsMorph) {
		if (this.atEnd || current instanceof ReporterBlockMorph) {
			current.destroy();
			this.element = this.editor;
			this.atEnd = false;
		}
	} else if (current instanceof MultiArgMorph) {
		for (i = 0; i < current.groupInputs; i += 1) {
			if (current.arrows().children[0].isVisible) {
				current.removeInput();
			}
		}
	} else if (current instanceof BooleanSlotMorph) {
		if (!current.isStatic) {
			current.setContents(null);
		}
	} else if (current instanceof ReporterBlockMorph) {
		if (!current.isTemplate) {
			this.lastElement();
			current.prepareToBeGrabbed();
			current.destroy();
		}
	} else if (current instanceof CommandBlockMorph) {
		if (this.atEnd) {
			this.element = current.parent;
			current.userDestroy();
		} else {
			if (current.parent instanceof CommandBlockMorph) {
				current.parent.userDestroy();
			}
		}
	}
	this.editor.adjustBounds();
	this.fixLayout();
};

ScriptFocusMorph.prototype.insertBlock = function (block) {
	// insert the block after a short gliding animation
	this.world().add(block);
	block.glideTo(
		this.position(),
		null,
		null,
		() => this.fillInBlock(block)
	);
};

ScriptFocusMorph.prototype.fillInBlock = function (block) {
	var pb, stage, ide, rcvr;
	block.isTemplate = false;
	block.isDraggable = true;

	if (block.snapSound) {
		block.snapSound.play();
	}

	if (this.element instanceof ScriptsMorph) {
		this.editor.add(block);
		this.element = block;
		if (block instanceof CommandBlockMorph) {
			block.setLeft(this.left());
			if (block.isStop()) {
				block.setTop(this.top());
			} else {
				block.setBottom(this.top());
				this.atEnd = true;
			}
		} else {
			block.setCenter(this.center());
			block.setLeft(this.left());
		}
	} else if (this.element instanceof CommandBlockMorph) {
		if (this.atEnd) {
			this.element.nextBlock(block);
			this.element = block;
			this.fixLayout();
		} else {
			// to be done: special case if block.isStop()
			pb = this.element.parent;
			if (pb instanceof ScriptsMorph) { // top block
				block.setLeft(this.element.left());
				block.setBottom(this.element.top() + this.element.corner);
				this.editor.add(block);
				block.nextBlock(this.element);
				this.fixLayout();
			} else if (pb instanceof CommandSlotMorph) {
				pb.nestedBlock(block);
			} else if (pb instanceof CommandBlockMorph) {
				pb.nextBlock(block);
			}
		}
	} else if (this.element instanceof CommandSlotMorph) {
		// to be done: special case if block.isStop()
		this.element.nestedBlock(block);
		this.element = block;
		this.atEnd = true;
	} else {
		pb = this.element.parent;
		if (pb instanceof ScriptsMorph) {
			this.editor.add(block);
			block.setPosition(this.element.position());
			this.element.destroy();
		} else {
			pb.replaceInput(this.element, block);
		}
		this.element = block;
	}
	block.fixBlockColor();
	this.editor.adjustBounds();
	// block.scrollIntoView();
	this.fixLayout();

	// experimental: if the inserted block has inputs, go to the first one
	if (block.inputs && block.inputs().length) {
		this.element = block;
		this.atEnd = false;
		this.nextElement();
	}
};

ScriptFocusMorph.prototype.insertVariableGetter = function () {
	var types = this.blockTypes(),
		vars,
		menu = new MenuMorph();
	if (!types || !contains(types, 'reporter')) {
		return;
	}
	vars = InputSlotMorph.prototype.getVarNamesDict.call(this.element);
	Object.keys(vars).forEach(vName => {
		var block = SpriteMorph.prototype.variableBlock(vName);
		block.addShadow(new Point(3, 3));
		menu.addItem(
			block,
			() => {
				block.removeShadow();
				this.insertBlock(block);
			}
		);
	});
	if (menu.items.length > 0) {
		menu.popup(this.world(), this.element.bottomLeft());
		menu.getFocus();
	}
};

ScriptFocusMorph.prototype.stopEditing = function () {
	this.editor.focus = null;
	this.editor.updateToolbar();
	this.world().keyboardFocus = null;
	this.destroy();
};

// ScriptFocusMorph navigation

ScriptFocusMorph.prototype.lastElement = function () {
	var items = this.items(),
		idx;
	if (!items.length) {
		this.shiftScript(new Point(-50, 0));
		return;
	}
	if (this.atEnd) {
		this.element = items[items.length - 1];
		this.atEnd = false;
	} else {
		idx = items.indexOf(this.element) - 1;
		if (idx < 0) {idx = items.length - 1; }
		this.element = items[idx];
	}
	if (this.element instanceof CommandSlotMorph &&
			this.element.nestedBlock()) {
		this.lastElement();
	} else if (this.element instanceof HatBlockMorph) {
		if (items.length > 1) {
			this.lastElement();
		} else {
			this.atEnd = true;
		}
	}
	this.fixLayout();
};

ScriptFocusMorph.prototype.nextElement = function () {
	var items = this.items(), idx, nb;
	if (!items.length) {
		this.shiftScript(new Point(50, 0));
		return;
	}
	idx = items.indexOf(this.element) + 1;
	if (idx >= items.length) {
		idx = 0;
	}
	this.atEnd = false;
	this.element = items[idx];
	if (this.element instanceof CommandSlotMorph) {
		nb = this.element.nestedBlock();
		if (nb) {this.element = nb; }
	} else if (this.element instanceof HatBlockMorph) {
		if (items.length === 1) {
			this.atEnd = true;
		} else {
			this.nextElement();
		}
	}
	this.fixLayout();
};

ScriptFocusMorph.prototype.lastCommand = function () {
	var cm = this.element.parentThatIsA(CommandBlockMorph),
		pb;
	if (!cm) {
		if (this.element instanceof ScriptsMorph) {
			this.shiftScript(new Point(0, -50));
		}
		return;
	}
	if (this.element instanceof CommandBlockMorph) {
		if (this.atEnd) {
			this.atEnd = false;
		} else {
			pb = cm.parent.parentThatIsA(CommandBlockMorph);
			if (pb) {
				this.element = pb;
			} else {
				pb = cm.topBlock().bottomBlock();
				if (pb) {
					this.element = pb;
					this.atEnd = true;
				}
			}
		}
	} else {
		this.element = cm;
		this.atEnd = false;
	}
	if (this.element instanceof HatBlockMorph && !this.atEnd) {
		this.lastCommand();
	}
	this.fixLayout();
};

ScriptFocusMorph.prototype.nextCommand = function () {
	var cm = this.element,
		tb,
		nb,
		cs;
	if (cm instanceof ScriptsMorph) {
		this.shiftScript(new Point(0, 50));
		return;
	}
	while (!(cm instanceof CommandBlockMorph)) {
		cm = cm.parent;
		if (cm instanceof ScriptsMorph) {
			return;
		}
	}
	if (this.atEnd) {
		cs = cm.parentThatIsA(CommandSlotMorph);
		if (cs) {
			this.element = cs.parentThatIsA(CommandBlockMorph);
			this.atEnd = false;
			this.nextCommand();
		} else {
			tb = cm.topBlock().parentThatIsA(CommandBlockMorph);
			if (tb) {
				this.element = tb;
				this.atEnd = false;
				if (this.element instanceof HatBlockMorph) {
					this.nextCommand();
				}
			}
		}
	} else {
		nb = cm.nextBlock();
		if (nb) {
			this.element = nb;
		} else {
			this.element = cm;
			this.atEnd = true;
		}
	}
	this.fixLayout();
};

ScriptFocusMorph.prototype.nextScript = function () {
	var scripts = this.sortedScripts(),
		idx;
	if (scripts.length < 1) {return; }
	if (this.element instanceof ScriptsMorph) {
		this.element = scripts[0];
	}
	idx = scripts.indexOf(this.element.topBlock()) + 1;
	if (idx >= scripts.length) {idx = 0; }
	this.element = scripts[idx];
	this.element.scrollIntoView();
	this.atEnd = false;
	if (this.element instanceof HatBlockMorph) {
		return this.nextElement();
	}
	this.fixLayout();
};

ScriptFocusMorph.prototype.lastScript = function () {
	var scripts = this.sortedScripts(),
		idx;
	if (scripts.length < 1) {return; }
	if (this.element instanceof ScriptsMorph) {
		this.element = scripts[0];
	}
	idx = scripts.indexOf(this.element.topBlock()) - 1;
	if (idx < 0) {idx = scripts.length - 1; }
	this.element = scripts[idx];
	this.element.scrollIntoView();
	this.atEnd = false;
	if (this.element instanceof HatBlockMorph) {
		return this.nextElement();
	}
	this.fixLayout();
};

ScriptFocusMorph.prototype.shiftScript = function (deltaPoint) {
	var tb;
	if (this.element instanceof ScriptsMorph) {
		this.moveBy(deltaPoint);
	} else {
		tb = this.element.topBlock();
		if (tb && !(tb instanceof PrototypeHatBlockMorph)) {
			tb.moveBy(deltaPoint);
		}
	}
	this.editor.adjustBounds();
	this.fixLayout();
};

ScriptFocusMorph.prototype.newScript = function () {
	var pos = this.position();
	if (!(this.element instanceof ScriptsMorph)) {
		pos = this.element.topBlock().fullBounds().bottomLeft().add(
			new Point(0, 50)
		);
	}
	this.setPosition(pos);
	this.element = this.editor;
	this.editor.adjustBounds();
	this.fixLayout();
};

ScriptFocusMorph.prototype.runScript = function () {
	if (this.element instanceof ScriptsMorph) {return; }
	this.element.topBlock().mouseClickLeft();
};

ScriptFocusMorph.prototype.items = function () {
	if (this.element instanceof ScriptsMorph) {return []; }
	var script = this.element.topBlock();
	return script.allChildren().filter(each =>
		each instanceof SyntaxElementMorph &&
			!(each instanceof TemplateSlotMorph) &&
				(!each.isStatic ||
					each.choices ||
					each instanceof BooleanSlotMorph ||
					each instanceof MultiArgMorph ||
					each instanceof CommandSlotMorph
				)
	);
};

ScriptFocusMorph.prototype.sortedScripts = function () {
	var scripts = this.editor.children.filter(each =>
		each instanceof BlockMorph
	);
	scripts.sort((a, b) =>
		// make sure the prototype hat block always stays on top
		a instanceof PrototypeHatBlockMorph ? 0 : a.top() - b.top()
	);
	return scripts;
};

// ScriptFocusMorph undo / redo

ScriptFocusMorph.prototype.undrop = function () {
	this.editor.undrop();
};

ScriptFocusMorph.prototype.redrop = function () {
	this.editor.redrop();
};

// ScriptFocusMorph block types

ScriptFocusMorph.prototype.blockTypes = function () {
	// answer an array of possible block types that fit into
	// the current situation, NULL if no block can be inserted

	if (this.element.isTemplate) {return null; }
	if (this.element instanceof ScriptsMorph) {
		return ['hat', 'command', 'reporter', 'predicate'];
	}
	if (this.element instanceof HatBlockMorph ||
			this.element instanceof CommandSlotMorph) {
		return ['command'];
	}
	if (this.element instanceof CommandBlockMorph) {
		if (this.atEnd && this.element.isStop()) {
			return null;
		}
		if (this.element.parent instanceof ScriptsMorph) {
			return ['hat', 'command'];
		}
		return ['command'];
	}
	if (this.element instanceof ReporterBlockMorph) {
		if (this.element.getSlotSpec() === '%n') {
			return ['reporter'];
		}
		return ['reporter', 'predicate'];
	}
	if (this.element.getSpec() === '%n') {
		return ['reporter'];
	}
	if (this.element.isStatic) {
		return null;
	}
	return ['reporter', 'predicate'];
};


// ScriptFocusMorph keyboard events

ScriptFocusMorph.prototype.processKeyDown = function (event) {
	this.processKeyEvent(
		event,
		this.reactToKeyEvent
	);
};

ScriptFocusMorph.prototype.processKeyUp = function (event) {
	nop(event);
};

ScriptFocusMorph.prototype.processKeyPress = function (event) {
	nop(event);
};


ScriptFocusMorph.prototype.processKeyEvent = function (event, action) {
	var keyName, ctrl, shift;

	//console.log(event.keyCode);
	this.world().hand.destroyTemporaries(); // remove result bubbles, if any
	switch (event.keyCode) {
	case 8:
		keyName = 'backspace';
		break;
	case 9:
		keyName = 'tab';
		break;
	case 13:
		keyName = 'enter';
		break;
	case 16:
	case 17:
	case 18:
		return;
	case 27:
		keyName = 'esc';
		break;
	case 32:
		keyName = 'space';
		break;
	case 37:
		keyName = 'left arrow';
		break;
	case 39:
		keyName = 'right arrow';
		break;
	case 38:
		keyName = 'up arrow';
		break;
	case 40:
		keyName = 'down arrow';
		break;
	default:
		keyName = String.fromCharCode(event.keyCode || event.charCode);
	}
	ctrl = (event.ctrlKey || event.metaKey) ? 'ctrl ' : '';
	shift = event.shiftKey ? 'shift ' : '';
	keyName = ctrl + shift + keyName;
	action.call(this, keyName);
};

ScriptFocusMorph.prototype.reactToKeyEvent = function (key) {
	var evt = key.toLowerCase(),
		shift = 50,
		types,
		vNames;

	// console.log(evt);
	switch (evt) {
	case 'esc':
		return this.stopEditing();
	case 'enter':
		return this.trigger();
	case 'shift enter':
		return this.newScript();
	case 'ctrl shift enter':
		return this.runScript();
	case 'space':
		return this.menu();
	case 'left arrow':
		return this.lastElement();
	case 'shift left arrow':
		return this.shiftScript(new Point(-shift, 0));
	case 'right arrow':
		return this.nextElement();
	case 'shift right arrow':
		return this.shiftScript(new Point(shift, 0));
	case 'up arrow':
		return this.lastCommand();
	case 'shift up arrow':
		return this.shiftScript(new Point(0, -shift));
	case 'down arrow':
		return this.nextCommand();
	case 'shift down arrow':
		return this.shiftScript(new Point(0, shift));
	case 'tab':
		return this.nextScript();
	case 'shift tab':
		return this.lastScript();
	case 'backspace':
		return this.deleteLastElement();
	case 'ctrl z':
		return this.undrop();
	case 'ctrl y':
	case 'ctrl shift z':
		return this.redrop();
	case 'ctrl [': // ignore the first press of the Mac cmd key
		return;
	default:
		types = this.blockTypes();
		if (!(this.element instanceof ScriptsMorph) &&
				types && contains(types, 'reporter')) {
			vNames = Object.keys(this.element.getVarNamesDict());
		}
		if (types) {
			delete this.fps;
			delete this.step;
			this.show();
			this.editor.scriptTarget().searchBlocks(
				key,
				types,
				vNames,
				this
			);
		}
	}
};
