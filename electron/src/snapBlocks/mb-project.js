// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//
// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

/*
	MB_Project - MicroBlocks project and library operations.

	A MicroBlocks project consists of a main MB_Module objects containing the
	top-level scripts and function definitions and zero or more MB_Modules for
	the libraries it uses.
*/

class MB_Project {
	constructor() {
		this.main = new MB_Module('main');
		this.libraries = [];
		this.blockSpecs = new Map();
		this.needsRecompilation = false;
	}

	choicesFor(selector) {
		let result = this.main.choices.get(selector);
		if (result) return result;

		for (const lib of this.libraries) {
			result = lib.choices.get(selector);
			if (result) return result;
		}
		return []; // not found; return empty choices list
	}

	hasUserCode() {
		if (!main) return false;
		return (
			(main.scripts.length > 0) ||
			(main.functions.length > 0) ||
			(main.variables.length > 0));
	}

	// Block Specs

	recordBlockSpec(opName, spec) {
		this.blockSpecs.set(opName, spec);
	}

	deleteBlockSpecFor (functionName) {
		this.blockSpecs.delete(functionName);
	}

	// Libraries

	libraryNamed(name) {
		for (const lib of this.libraries) {
			if (lib.moduleName == name) return lib;
		}
		return null;
	}

	addLibrary(aMicroBlocksModule) {
// 		libName = (moduleName aMicroBlocksModule)
// 		oldLib = (at libraries libName)
// 		if (notNil oldLib) {
// 			updatingLibrary oldLib aMicroBlocksModule
// 		}
// 		remove libraries libName
// 		if (not (isImplementationLib aMicroBlocksModule)) {
// 			atPut libraries libName aMicroBlocksModule
// 		}
//
// 		// the functions in this new library supersede all earlier versions of those functions
// 		newFunctionNames = (dictionary)
// 		for f (functions aMicroBlocksModule) { add newFunctionNames (functionName f) }
// 		removeSupercededFunctions main newFunctionNames
// 		for lib (values libraries) {
// 			if (lib != aMicroBlocksModule) { removeSupercededFunctions lib newFunctionNames }
// 		}
//
// 		// update block specs
// 		newSpecs = (blockSpecs aMicroBlocksModule)
// 		for k (keys newSpecs) {
// 			atPut blockSpecs k (at newSpecs k)
// 		}
	}

	updatingLibrary(newerModule) {
		// Called when updating an existing library (the receiver) to a newer version.
		// Update the block specs of existing functions that are being updated.
		// Retain the block specs for any functions that are being removed
		// and add "obsolete" to their labels to allow them to be identified
		// in any scripts in which they appear.

	// 	newSpecs = (blockSpecs newerModule)
	// 	projectSpecs = (blockSpecs (project (findProjectEditor)))
	// 	for oldSpec (values (blockSpecs this)) { // for each spec in this module
	// 		op = (blockOp oldSpec)
	// 		if (contains newSpecs op) {
	// 			// update exising spec for op
	// 			atPut projectSpecs op (at newSpecs op)
	// 		} else {
	// 			// mark old function as obsolete and append to module
	// 			obsoletedLabel = (join 'obsolete ' (first (specs oldSpec)))
	// 			atPut (specs oldSpec) 1 obsoletedLabel
	// 			atPut projectSpecs op oldSpec
	// 			add (blockList newerModule) op
	// 		}
	// 	}
	}

	removeLibraryNamed(libName) {
		const lib = this.libraryNamed(libName);
		if (!lib) return;
		libraries = this.libraries.filter(m => m.moduleName != libName);
		for (const f of lib.functions) {
			this.blockSpecs.delete(f.functionName);
		}
	}

	categoryForOp(op) {
		// Return the category for the give op if it is in one of my libraries.

		if (('-' == op) || ('advanced' == op)) return null; // ignore spacers and 'advanced'
		for (const lib of this.libraries) {
			if (lib.blockList.includes(op)) return lib.moduleCategory;
		}
		return null;
	}

	// Functions

	allFunctions() {
		let result = this.main.functions.slice();
		for (const lib of this.libraries) {
			result = result.concat(lib.functions);
		}
		return result;
	}

	functionNamed(functionName) {
		return this.allFunctions.find(f => (f.functionName == functionName));
	}

	libForFunction(aFunc) {
		const f = this.functionNamed(aFunc.funcName);
		return f ? f.moduleName : '';
	}

	// Variables

	allVariableNames() {
		// Return a sorted array of all global variables. Use case-insensitive sort.

		result = main.variableNames.slice();
		for (const lib of this.libraries) {
			result = result.concat(lib.variableNames);
		}
		return result.sort(
			(m1, m2) => m1.toLowerCase() < m2.toLowerCase
		);
	}

	addVariable(newVar) {
		this.main.addVariable(newVar);
	}

	deleteVariable(varName) {
		this.main.variables.delete(varName);
		for (const lib of this.libraries) {
			lib.deleteVariable(varName);
		}
	}

	// Broadcasts

	forAllBlocks(topBlock, f) {
		// Call the given function on all command and reporter blocks in this script.
		// Todo: move this to BlockMorph

		if (!topBlock) return;

		let todo = [topBlock];
		while (todo.length > 0) {
			let cmd = todo.pop();
			f(cmd);
			if (cmd instanceof CommandBlockMorph) {
				if (cmd.nextBlock()) todo.push(cmd.nextBlock());
			}
			for (const arg of cmd.inputs()) {
				if (arg instanceof BlockMorph) todo.push(arg);
			}
		}
	}

	allBroadcasts() {
		let result = new Set();
		for (const entry of main.scripts) {
			this.forAllBlocks(entry[2], cmd => {
				if (['sendBroadcast', 'whenBroadcastReceived'].includes(cmd.selector)) {
					result.push(cmd.inputValues()[0]);
				}
			});
		}
		return Array.from(result).sort();
	}

	// Loading

	loadFromString(s, updateLibraries) {
		// Load project from a string in .ubp format. Keep libraries (modules) together.

		let cmdList = MB_Parser.parse(s);
		let moduleCmdLists = this.splitCmdListIntoModules(cmdList);

		this.main.loadFromCmds(moduleCmdLists.shift());
		for (const cmdsForModule of moduleCmdLists) {
			let library = new MB_Module().loadFromCmds(cmdsForModule);
			this.libraries.push(library);
		}
// 		if (updateLibraries || true) {
// 			this.checkForNewerLibraryVersions();
// 		}
// 		this.fixFunctionLocals();
	}
// 		initialize this
// 		cmdList = (parse s)
// 		if (and (notEmpty cmdList) ('projectName' == (primName (first cmdList)))) {
// 			// skip projectName line, if any
// 			cmdList = (copyFromTo cmdList 2)
// 		}
// 		loadSpecs this cmdList
// 		cmdsByModule = (splitCmdListIntoModules this cmdList)
// 		isFirst = true
// 		for cmdList cmdsByModule {
// 			if isFirst { // main module
// 				loadFromCmds main cmdList
// 				isFirst = false
// 			} else { // library
// 				lib = (loadFromCmds (newMicroBlocksModule) cmdList true)
// 				atPut libraries (moduleName lib) lib
// 			}
// 		}
// 		if (isNil updateLibraries) { updateLibraries = true }
// 		if updateLibraries { checkForNewerLibraryVersions this }
// 		fixFunctionLocals this
// 		return this

	splitCmdListIntoModules(cmdList) {
		// Split the list of commands into a list of command lists for each module of the project.
		// Each module after the first (main) module begins with a 'module' command.

		let result = [];
		let thisModule = [];
		for (const cmd of cmdList) {
			if ('module' == cmd[0]) {
				if (thisModule.length > 0) result.push(thisModule);
				thisModule = [];
			}
			thisModule.push(cmd);
		}
		if (thisModule.length > 0) result.push(thisModule); // add final module
		return result;
	}


	addLibraryFromString(s, libName, fileName) {
		// Load a library from a string.

// 		cmdList = (parse s)
// 		loadSpecs this cmdList
// 		cmdsByModule = (splitCmdListIntoModules this cmdList)
// 		for cmdList cmdsByModule {
// 			lib = (loadFromCmds (newMicroBlocksModule) cmdList)
// 			if (isNil (moduleName lib)) {
// 				setModuleName lib libName
// 			}
// 			if (beginsWith fileName '//Libraries/') {
// 				setPath lib (withoutExtension (substring fileName ((count '//Libraries/') + 1)))
// 			} (beginsWith fileName 'http://') {
// 				setPath lib fileName
// 			} (beginsWith fileName (join (gpFolder) '/Libraries')) {
// 				setPath lib (withoutExtension (substring fileName ((count (join (gpFolder) '/Libraries')) + 1)))
// 			} else {
// 				// Local files sourced from places other than the MicroBlocks folder
// 				// are unsupported as dependencies.
// 				setPath lib nil
// 			}
// 			fixFunctionLocals this
//
// 			moduleName = (moduleName lib)
// 			if (notNil (libraryNamed this moduleName)) {
// 				// updating an existing library: just replace it and don't import dependencies
// 				removeLibraryNamed this moduleName
// 			} else {
// 				importDependencies lib (scripter (smallRuntime))
// 			}
// 			addLibrary this lib
// 		}
// 		return this
	}

	// Saving

	codeString() {
		// Return a string representing this project in .ubp format.

		// sort libraries by name (this canonicalizes their order)
		const sortedLibs = this.libraries.slice().sort(
			(m1, m2) => m1.moduleName.toLowerCase() < m2.moduleName.toLowerCase()
		);

		let result = [this.main.codeString(this)];
		for (const lib of sortedLibs) {
			result.push('\n');
			result.push(lib.codeString(this));
		}
		return result.join('\n');
	}

	// Post-load processing

	fixFunctionLocals() {
		// Remove global variables from function locals.

// 		projectVars = (allVariableNames this)
// 		for f (allFunctions this) { removeFieldsFromLocals f projectVars }
	}

	// save/load test

	saveLoadTest() {
		// Verify that this project can be saved and reloaded.

// 		s1 = (codeString this)
// 		p2 = (loadFromString (newMicroBlocksProject) s1)
// 		s2 = (codeString p2)
// 		if (s1 != s2) { print 'second codeString does not match first'; return false }
// 		if (not (equal this p2)) { print 'second project does not match first'; return false }
// 		return true
	}

	// equality

	equal(proj) {
		// Return true if the given project has the same contents as this one.

// 		if (not (equal main (main proj))) { return false }
// 		for lib (values libraries) {
// 			if (not (equal lib (libraryNamed proj (moduleName lib)))) {
// 				print '	libs not equal:' (moduleName lib)
// 				return false
// 			}
// 		}
// 		sortedKeys = (sorted (keys blockSpecs))
// 		if (sortedKeys != (sorted (keys (blockSpecs proj)))) {
// 			print '	spec keys mismatch'
// 			return false;
// 		}
// 		for k sortedKeys {
// 			s1 = (specDefinitionString (at blockSpecs k))
// 			s2 = (specDefinitionString (at (blockSpecs proj) k))
// 			if (s1 != s2) {
// 				print '	spec mismatch' k
// 				return false
// 			}
// 		}
// 		return true
	}
}

class MB_Module {
	constructor(moduleName) {
		this.moduleName = moduleName || 'main';
		this.moduleCategory = '';
		this.dependencies = [];
		this.version = [1, 0];
		this.author = 'unknown';
		this.description = '';
		this.tags = [];
		this.isImplementation = false;
		this.path = '';
		this.choices = new Map();
		this.variableNames = [];
		this.blockList = [];
		this.blockSpecs = new Map();
		this.functions = [];
		this.scripts = []; // an array of [x, y, BlockMorph]
		this.translationSources = new Map();
	}

	setModuleName(modName) {
		this.moduleName = modName;
	}

	version() {
		return this.version.slice();
	}

	tags() {
		return this.tags.slice();
	}

	dependencies() {
		return this.dependencies.slice();
	}

	beImplementation() {
		this.isImplementation = true;
	}

	setDependencies(deps) {
		this.dependencies = deps.slice();
	}

	setVersion(versionArray) {
		this.version = versionArray.slice();
	}

	setTags(tagList) {
		this.args = tagList.slice();
	}

	// functions

	functionNamed(functionName) {
		for (const f of functions) {
			if (f.functionName == functionName) return f;
		}
		return null;
	}

	addFunction(aFunction) {
		this.removeFunction(aFunction);
		aFunction.module = this;
		functions.push(aFunction);
		MB_Project.needsRecompilation = true;
	}

	removeFunction(aFunction) {
		functions = functions.filter(f => f !== aFunction);
		MB_Project.needsRecompilation = true;
	}

	removeSupercededFunctions(superceded) {
	// 	for f (copy functions) {
	// 		if (contains superceded (functionName f)) {
	// 			removeFunction this f
	// 		}
	// 	}
	// 	newBlockList = (list)
	// 	for op blockList {
	// 		if (not (contains superceded op)) { add newBlockList op }
	// 	}
	}

	// variables

	variableNames() {
		return this.variableNames.slice();
	}

	removeAllVariables() {
		this.variableNames = [];
	}

	addVariable(newVar) {
		if (!this.variableNames.includes(newVar)) {
			this.variableNames.push(newVar);
		}
	}

	deleteVariable(varName) {
		this.variableNames = this.variableNames.filter(v => v != varName);
	}

	// saving

	fixEmbeddedQuotes(s) {
		if (!s.includes('\'')) return s;
		return s.replaceAll('\'', '\'\''); // double embedded single quotes
	}

	codeString(owningProject, exportedLibName) {
		// Return a string containing the code for this MB_Module.
		// If exportedLibName is not nil, this module is being exported as a library.

		let result = [];

		let moduleLine = [exportedLibName ? exportedLibName : this.moduleName];
		if (this.moduleCategory != '') {
			moduleLine.push(this.quoteIfNeeded(this.moduleCategory));
		}
		this.addDeclaration('module', moduleLine, result);
		result.push('author ' + this.quoteIfNeeded(this.author));
		result.push('version ' + this.version[0] + ' ' + this.version[1]);
		this.addDeclaration('depends', this.dependencies, result);
		this.addDeclaration('tags', this.tags, result);
		for (const [menuName, menuItems] of this.choices) {
			this.addDeclaration('choices', [menuName].concat(menuItems), result);
		}
		if (this.description) {
			result.push('description \'' + this.fixEmbeddedQuotes(this.description) + '\'');
		}
		if (this.variableNames.length > 0) {
			this.addDeclaration('variables', this.variableNames, result);
			result.push(''); // add blank line after variables
		}

		if (this.blockList.length > 0) result.push(this.specsString());
		if (this.functions.length > 0) result.push(this.functionsString());
		if (!exportedLibName) { // add scripts if not exporting as a library
			result.push(this.scriptsString());
		}

		return result.join('\n');
	}

	addDeclaration(title, items, result) {
		if (items.length == 0) return;

		let line = [title];
		for (const word of items) {
			line.push(this.quoteIfNeeded(word));
		}
		result.push(line.join(' '));
	}

	quoteIfNeeded(s) {
		// Return a quoted version of the given string if necessary for parsing.
		// Otherwise, return the original string.

		return this.needsQuotes(s) ? ('\'' + s + '\'') : s;
	}

// 	quoted(s) {
// 		return '\'' + s + '\'';
// 	}

	specsString() {
		let result = [];
		for (const entry of this.blockList) {
			if ('-' == entry) {
				result.push('  space');
			} else if ('advanced' == entry) {
				result.push('  advanced');
			} else {
				let specLine = ['  spec'];
				specLine.push('\'' + entry[0] + '\'');
				specLine.push('\'' + entry[1] + '\'');
				specLine.push('\'' + entry[2] + '\'');
				if (entry.length > 3) {
					specLine.push('\'' + entry[3] + '\'');
					for (let i = 4; i < entry.length; i++) {
						const v = entry[i];
						if (typeof v  === 'string') {
							specLine.push('\'' + v + '\'');
						} else {
							specLine.push(v);
						}
					}
				}
				result.push(specLine.join(' '));
//console.log(entry);
			}
		}
		result.push(''); // empty line after specs
		return result.join('\n');
	}
	// 	projectSpecs = (blockSpecs owningProject)
	// 	processed = (dictionary)
	//
	// 	for op blockList {
	// 		if ('-' == op) {
	// 			add result (join '  space' (newline))
	// 		} ('advanced' == op) {
	// 			add result (join '  advanced' (newline))
	// 		} else {
	// 			spec = (at projectSpecs op)
	// 			if (notNil spec) {
	// 				add result (join '  ' (specDefinitionString spec) (newline))
	// 				add processed op
	// 			}
	// 		}
	// 	}
	//

	functionsString() {
		if (this.functions.length == 0) return '';

		// sort functions by name
		const sortedScripts = this.functions.slice().sort( (a, b) => {
			return a.functionName < b.functionName;
		});

		let result = [];
		for (const f of this.functions) {
			result.push(f.codeString());
		}
		return result.join('\n');
	}
	// 	if (not (isEmpty functions)) {
	// 		// sort functions by name (this canonicalizes function order)
	// 		sortedFunctions = (sorted
	// 			functions
	// 			(function a b {return ((functionName a) < (functionName b))})
	// 		)
	// 		// add function block specs
	// 		for func sortedFunctions {
	// 			op = (functionName func)
	// 			if (not (contains processed op)) {
	// 				spec = (at projectSpecs op)
	// 				if (notNil spec) {
	// 					add result (join '  ' (specDefinitionString spec) (newline))
	// 					add processed op
	// 				}
	// 			}
	// 		}
	// 		add result (newline)
	//
	// 		// add function definitions
	// 		pp = (new 'PrettyPrinter')
	// 		for func sortedFunctions {
	// 			add result (prettyPrintFunction pp func)
	// 			add result (newline)
	// 		}
	// 	}

	scriptsString() {
		if (this.scripts.length == 0) return '';

		// sort scripts by position so the scriptsString does not depend on z-ordering of scripts
		const sortedScripts = this.scripts.slice().sort( (a, b) => {
			if (a[1] == b[1]) {
				return a[0] < b[0]; // y's are equal, sort by x
			} else {
				return a[1] < b[1]; // sort by y
			}
		});

		let result = ['']; // start with an empty line
		for (const entry of sortedScripts) {
			const script = entry[2];
			if (script instanceof ReporterBlockMorph) {
				result.push(
					'script ' + entry[0] + ' ' + entry[1] + ' ' + script.codeString() + '\n');
			} else {
				result.push(
					'script ' + entry[0] + ' ' + entry[1] + ' {\n' + script.codeString() + '}\n');
			}
		}
		return result.join('\n');
	}

	needsQuotes(s) {
		// Return true if the given string needs to be quoted in order to be parsed as
		// a variable or function name.

		if (typeof s === 'number') return false;
		if (('true' == s) || ('false' == s) || ('' == s)) return true;
		if ('-.0123456789'.includes(s[0])) return true;
		if (!/[a-zA-Z_]/.test(s[0])) return true; // does not start with letter or underscore
		for (const ch of s) {
			if (!/[a-zA-Z0-9_]/.test(ch)) return true; // contains non-alphanumeric
		}
		return false;
	}

	// loading

	unquoted(s) {
		if ((typeof s) != 'string') return s;
		if ((s.length > 1) && (s[0] == '\'') && (s.at(-1) == '\'')) {
			return s.slice(1, -1); // remove quotes
		}
		return s;
	}

	loadFromCmds(cmdList) {
		for (const cmd of cmdList) {
			if (cmd.length > 1) {
				switch (cmd[0].toLowerCase()) {
				case 'module':
					this.loadModuleNameAndCategory(cmd);
				case 'version':
					this.loadVersion(cmd);
					break;
				case 'author':
					this.author = this.unquoted(cmd[1]);
					break;
				case 'depends':
					this.loadDependencies(cmd);
					break;
				case 'description':
					this.description = this.unquoted(cmd[1]);
					break;
				case 'tags':
					this.loadTags(cmd);
					break;
				case 'choices':
					this.loadChoices(cmd);
					break;
				case 'variables':
					this.loadVariables(cmd);
					break;
				}
			}
		}
		this.loadSpecs(cmdList);
		this.loadFunctions(cmdList);
		this.loadScripts(cmdList);
		return this
	}

	loadModuleNameAndCategory(cmd) {
		this.moduleName = this.unquoted(cmd[1]);
		if (cmd.length > 2) {
			this.moduleCategory = this.unquoted(cmd[2]);
		}
	}

	loadVersion(cmd) {
		if (cmd.length > 2) {
			this.version = [cmd[1], cmd[2]];
		}
	}

	loadDependencies(cmd) {
		this.dependencies = [];
		for (let i = 1; i < cmd.length; i++) {
			this.dependencies.push(this.unquoted(cmd[i]));
		}
	}

	loadTags(cmd) {
		this.tags = [];
		for (let i = 1; i < cmd.length; i++) {
			this.tags.push(this.unquoted(cmd[i]));
		}
	}

	loadChoices(cmd) {
		if (cmd.length < 2) return;
		let choiceList = [];
		for (let i = 2; i < cmd.length; i++) {
			choiceList.push(this.unquoted(String(cmd[i])));
		}
		this.choices.set(this.unquoted(cmd[1]), choiceList);
	}

	loadVariables(cmd) {
		this.variableNames = [];
		for (let i = 1; i < cmd.length; i++) {
			this.variableNames.push(this.unquoted(cmd[i]));
		}
	}

	loadSpecs(cmdList) {
		// Store the specs and blocks list for this module.
		// The specs are stored in a Map keyed by selector.
		// The blockList is a list of blocks for the module's palette in order
		// of appearance. The 'space' keyword
		// can be used to add some space between groups of blocks.

		this.blockList = [];
		this.blockSpecs = new Map();
		for (const cmd of cmdList) {
			switch(cmd[0]) {
			case 'spec':
				let spec = cmd.slice(1).map(s => this.unquoted(s));
				this.blockSpecs.set(spec[1], spec); // spec[1] is the selector
				this.blockList.push(spec);
				break;
			case 'space':
				this.blockList.push('-'); // spacer
				break;
			case 'advanced':
				this.blockList.push('advanced');
				break;
			}
		}
	}

	unquoted(s) {
		if ((typeof s) != 'string') return s;
		if ((s.length > 1) && (s[0] == '\'') && (s.at(-1) == '\'')) {
			return s.slice(1, -1); // remove quotes
		}
		return s;
	}

	checkForNewerLibraryVersions(autoConfirm) {
		// Check for newer versions of libraries used in this project.
		// If true is passed to the optional autoConfirm parameter, update old
		// libraries without asking. Otherwise ask the user for confirmation.

// 		if (isNil autoConfirm) { autoConfirm = false }
//
// 		for libName (keys libraries) {
// 			newVersion = (getNewerVersion (at libraries libName))
// 			if (notNil newVersion) {
// 				if (or
// 					autoConfirm
// 					(confirm (global 'page') nil (join
// 						(localized 'Found a newer version of %1.' libName) (newline)
// 						(localized 'Do you want me to update the one in the project?')))
// 				) {
// 					addLibrary this newVersion
// 				}
// 			}
// 		}
	}

	getNewerVersion() {
		// Return the embedded library with the same name and a newer version or nil if none found.

	// 	if (moduleName == 'main') { return nil }
	//
	// 	embeddedFiles = (browserEmbeddedLibs this)
	//
	// 	// Find the embedded lib path
	// 	moduleFileName = (join moduleName '.ubl')
	// 	v1 = version // current version
	// 	for filePath embeddedFiles {
	// 		if ((filePart filePath) == moduleFileName) {
	// 			cmdList = (parse (readEmbeddedFile filePath))
	// 			candidate = (newMicroBlocksModule moduleName)
	// 			loadFromCmds candidate cmdList
	// 			v2 = (version candidate)
	// 			if (or
	// 				((at v2 1) > (at v1 1))
	// 				(and ((at v1 1) == (at v2 1)) ((at v2 2) > (at v1 2)))
	// 			) {
	// 				return candidate
	// 			}
	// 		}
	// 	}
	// 	return nil
	}

	browserEmbeddedLibs() {
	// 	result = (list)
	// 	todo = (list 'Libraries')
	// 	while (notEmpty todo) {
	// 		libpath = (removeFirst todo)
	// 		for dirName (listEmbeddedFiles libpath true) {
	// 			add todo (join libpath '/' dirName)
	// 		}
	// 		for fName (listEmbeddedFiles libpath false) {
	// 			if (endsWith fName '.ubl') {
	// 				add result (join libpath '/' fName)
	// 			}
	// 		}
	// 	}
	// 	return result
	}

	importDependencies(scripter) {
	// 	project = (project scripter)
	// 	for dependency dependencies {
	// 		if (isNil (libraryNamed project dependency)) {
	// 			// don't import a dependent library if it is already loaded
	// 			importDependency this dependency scripter
	// 		}
	// 	}
	}

	importDependency(lib, scripter) {
		// dependencies look like either:
		// LibName						- Fetch from embedded FS
		// /LibName						- Fetch from ~/MicroBlocks/Libraries
		// http://url/LibName.ubp		- Fetch from server

		// Additionally, one can define version requirements like this:
		// LibName#>1.4					- Needs at least version 1.4
		// /LibName#=2.7				- Needs exactly version 2.7
		// http://url/LibName.ubp#>1.1	- Needs at least version 1.1

	// 	// find version requirements
	// 	vPosition = (findLast lib '#')
	// 	vRequirement = ''
	// 	reqVersion = (array 1 0)
	// 	if (vPosition > 0) {
	// 		vPosition = (vPosition + 1)
	// 		vRequirement = (substring lib vPosition vPosition)
	// 		atPut reqVersion 1 (toInteger (substring lib (vPosition + 1) ((findLast lib '.') - 1)))
	// 		atPut reqVersion 2 (toInteger ((findLast lib '.') + 1))
	// 		lib = (substring lib 1 (vPosition - 2))
	// 	}
	//
	// 	// TODO Make sure we comply with version requirement (ex. >2.3, =1.5)
	//
	// 	if (beginsWith lib 'http') {
	// 		// fetch library from remote URL
	// 		importLibraryFromUrl scripter lib
	// 	} (beginsWith lib '/') {
	// 		// fetch library from [MicroBlocksFolder]/Library
	// 		importLibraryFromFile scripter (join (gpFolder) '/Libraries' lib '.ubl')
	// 	} else {
	// 		// load embedded library
	// 		importEmbeddedLibrary scripter lib
	// 	}
	}

	loadFunctions(cmdList) {
		this.functions = [];
		for (const entry of cmdList) {
			if ((entry.length > 2) && (entry[0] == 'to')) {
functionCount++;
				const funcName = entry[1];
				const funcArgs = entry.slice(2, -1);
				const funcCmds = entry.at(-1);
				let funcBody = (funcCmds.length > 0) ? MB_Parser.blockFor(funcCmds) : null;
				this.functions.push(new MB_Function(funcName, funcArgs, funcBody, this.moduleName));
			}
		}
		MB_Project.needsRecompilation = true;
	}

	loadScripts(cmdList) {
		this.scripts = [];
		for (const entry of cmdList) {
			if ((entry.length == 4) && (entry[0] == 'script')) {
scriptCount++;
				const scriptCmds = entry[3];
				if ((scriptCmds.length > 0) &&
					(scriptCmds[0].length == 3) &&
					(scriptCmds[0][0] == 'to')) {
						// todo: figure out how to represent function references
						// for now, don't add them to scripting area
//						console.log('function ref:', scriptCmds[0][1]);
				} else {
					this.scripts.push([
						entry[1], // x position
						entry[2], // y position
						MB_Parser.blockFor(scriptCmds) // script blocks
					]);
				}
			}
		}
	}

	// equality

	equal(otherMod) {
		// Return true if the given module has the same content as this one.

	// 	if (moduleName != (moduleName otherMod)) { return false }
	// 	if (variableNames != (variableNames otherMod)) { return false }
	// 	if ((count functions) != (count (functions otherMod))) { return false }
	// 	if ((count scripts) != (count (scripts otherMod))) { return false }
	//
	// 	for i (count functions) {
	// 		if (not (functionsEqual this (at functions i) (at (functions otherMod) i))) {
	// 			print 'function mismatch:' (functionName (at functions i))
	// 			return false
	// 		}
	// 	}
	//
	// 	// sort script entries by position
	// 	scriptSortFunc = (function e1 e2 {
	// 		if ((at e1 2) == (at e2 2)) {
	// 			return ((at e1 1) < (at e2 1)) // y's equal, sort by x
	// 		} else {
	// 			return ((at e1 2) < (at e2 2)) // sort by y
	// 		}
	// 	})
	// 	sortedScripts1 = (sorted scripts scriptSortFunc)
	// 	sortedScripts2 = (sorted (scripts otherMod) scriptSortFunc)
	//
	// 	for i (count sortedScripts1) {
	// 		e1 = (at sortedScripts1 i)
	// 		e2 = (at sortedScripts2 i)
	// 		if (not (and ((at e1 1) == (at e2 1))
	// 					((at e1 2) == (at e2 2))
	// 					((at e1 3) == (at e2 3))
	// 				)
	// 		) {
	// 			print 'script mismatch' e1 e2
	// 			return false
	// 		}
	// 	}
	// 	return true
	}

	// translation template export

	templateStringForLibrary(libName) {
		// setClipboard (templateStringForLibrary 'CoCube Sengo1')

	// 	project = (project (first (allInstances 'MicroBlocksEditor')))
	// 	lib = (libraryNamed project libName)
	// 	if (isNil lib) { return '' }
	// 	return (join (choiceTemplates lib) (newline) (blockTemplates lib))
	}

	choiceTemplates() {
	// 	seen = (dictionary) // used to avoid duplicate entries
	// 	result = (list)
	// 	for pair (sortedPairs choices true) {
	// 		choiceList = (at pair 2)
	// 		for c choiceList {
	// 			if (not (or (representsAnInteger c) (contains seen c))) {
	// 				add seen c
	// 				add result (join '#. ' moduleName ' library choice')
	// 				add result (join 'msgid "' c '"')
	// 				add result 'msgstr ""'
	// 				add result ''
	// 			}
	// 		}
	// 	}
	// 	return (joinStrings result (newline))
	}

	blockTemplates() {
	// 	seen = (dictionary) // used to avoid duplicate entries
	// 	result = (list)
	// 	for pair (sortedPairs blockSpecs true) {
	// 		spec = (at pair 2)
	// 		blockLabel = (first (specs spec))
	// 		if (not (or (beginsWith blockLabel '_') (contains seen blockLabel))) {
	// 			add seen blockLabel
	// 			add result (join '#. ' moduleName ' library block')
	// 			add result (join 'msgid "' blockLabel '"')
	// 			add result 'msgstr ""'
	// 			add result ''
	// 		}
	// 	}
	// 	return (joinStrings result (newline))
	}

	// localization

	setTranslations(aMap) {
		this.translationSources = aMap;
	}

	getTranslationSources(langCode) {
		return this.translationSources.get(langCode);
	}

	hasTranslationFor (langCode) {
		return this.translationSources.includes(langCode);
	}
}

// Testing...

function testLoad() {
	function loadFile(fileName, contents) {
		let project = new MB_Project();
		scriptCount = functionCount = 0;
		let startT = Date.now();
		project.loadFromString(contents);
		let msecs = Date.now() - startT;
		console.log(fileName, functionCount, 'functions', scriptCount, 'scripts', msecs, 'msecs');
		MB_GUI.removeAllScripts();
		project.main.scripts.forEach( (entry) => {
			let x = entry[0], y = entry[1], script = entry[2];
			MB_GUI.addBlockToScriptsAt(script, x, y);
		});
	}
	MB_GUI.importLocalFile(loadFile);
}

function testShow() {
	let codeString =
		"whenButtonPressed 'A'\n" +
		"[display:mbDisplay] 15237450\n" +
		"waitMillis 1000\n" +
		"[display:mbDisplayOff]\n";
	let parseTree = MB_Parser.parse(codeString);
	let b = MB_Parser.blockFor(parseTree);
	MB_GUI.addBlockToScripts(b);
}

function testPerf() {
	let a = Array.from({ length: 10000000 }, (v, i) => i + 1 );

	let result = 0;
	let startT = Date.now();
	for (let i = 0; i < a.length; i++) { result += a[i]; }
	console.log('loop', Date.now() - startT, 'msecs', 'result = ', result);

	result = 0;
	startT = Date.now();
	for (const n of a) { result += n; }
	console.log('forOf', Date.now() - startT, 'msecs', 'result = ', result);

	result = 0;
	startT = Date.now();
	a.forEach(n => result += n);
	console.log('forEach', Date.now() - startT, 'msecs', 'result = ', result);

	startT = Date.now();
	result = a.map(n => 2 * n);
	console.log('map', Date.now() - startT, 'msecs', result.length, 'result = ', result);

	startT = Date.now();
	result = a.find(n => n == 10000000);
	console.log('findA', Date.now() - startT, 'msecs', 'result = ', result);

	result = 0;
	startT = Date.now();
	for (let i = 0; i < a.length; i++) { result += a[i]; if (a[i] == 5000000) break; }
	console.log('loopWithBreak', Date.now() - startT, 'msecs', 'result = ', result);

	result = 0;
	startT = Date.now();
	for (const n of a) { result += n; if (n == 5000000) break; }
	console.log('forOfWithBreak', Date.now() - startT, 'msecs', 'result = ', result);
}

function testLoad2() {
	function loadFile(fileName, contents) {
		let project = new MB_Project();
		project.loadFromString(contents);
		console.log(project.codeString());
	}
	MB_GUI.importLocalFile(loadFile);
}

async function testLoadExamples() {
	for (const fileName of MB_Files.allFilesIn('Examples')) {
		let data = await MB_Files.readFile(fileName);

		scriptCount = functionCount = 0;
		let startT = Date.now();
		let project = new MB_Project();
		project.loadFromString(data);
		let msecs = Date.now() - startT;
		console.log(fileName, functionCount, 'functions', scriptCount, 'scripts', msecs, 'msecs');
	}
}
