class MB_Project {
	constructor() {
		this.main = new MicroBlocksModule('main');
		this.libraries = new Map();
		this.blockSpecs = new Map();
	}

	choicesFor (selector) {
// 		if (contains (choices main) selector) {
// 			return (at (choices main) selector)
// 		}
// 		for lib (values libraries) {
// 			libChoices = (choices lib)
// 			if (contains libChoices selector) { return (at libChoices selector) }
// 		}
// 		return nil // not found; return empty choices list
	}

	hasUserCode () {
// 		if (isNil main) { return false }
// 		if (and (isEmpty (scripts main)) (isEmpty (functions main)) (isEmpty (variableNames main))) {
// 			return false
// 		}
// 		return true
	}

	// Block Specs

	recordBlockSpec (opName, spec) {
// 		atPut blockSpecs opName spec
	}

	deleteBlockSpecFor (functionName) {
// 		remove blockSpecs functionName
	}

	// Libraries

	libraryNamed (name) {
// 		return (at libraries name)
	}

	addLibrary (aMicroBlocksModule) {
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

	removeLibraryNamed (libName) {
// 		lib = (at libraries libName)
// 		if (isNil lib) { return }
// 		remove libraries libName
// 		for f (functions lib) {
// 			remove blockSpecs (functionName f)
// 		}
	}

	categoryForOp (op) {
		// Return the category for the give op if it is in one of my libraries.

// 		if ('-' == op) { return nil } // ignore dash used as a spacer in library block lists
//
// 		for lib (values libraries) {
// 			if (contains (blockList lib) op) { return (moduleCategory lib) }
// 		}
// 		return nil
	}

	checkForNewerLibraryVersions (autoConfirm) {
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

	// Functions

	allFunctions () {
// 		result = (list)
// 		addAll result (functions main)
// 		for lib (values libraries) {
// 			addAll result (functions lib)
// 		}
// 		return result
	}

	functionNamed (functionName) {
// 		f = (functionNamed main functionName)
// 		if (notNil f) { return f }
// 		for lib (values libraries) {
// 			f = (functionNamed lib functionName)
// 			if (notNil f) { return f }
// 		}
// 		return nil
	}

	libForFunction (aFunc) {
// 		funcName = (functionName aFunc)
// 		for lib (values libraries) {
// 			if (notNil (functionNamed lib funcName)) {
// 				return (moduleName lib)
// 			}
// 		}
// 		return ''
	}

	metaInfoForFunction (aFunc) {
		// Return a tab-delimited block spec string for the given function:
		//	blockType specString argTypes

// 		funcName = (functionName aFunc)
// 		spec = (at blockSpecs funcName)
// 		if (isNil spec) { // no spec (very unlikely), so create one
// 			specString = funcName
// 			typeString = ''
// 			for argName (argNames aFunc) {
// 				specString = (join specString ' _')
// 				typeString = (join typeString ' auto')
// 			}
// 			defaults = (list)
// 			spec = (blockSpecFromStrings funcName ' ' specString typeString defaults)
// 		}
//
// 		parts = (toList (argList (first (parse (specDefinitionString spec)))))
// 		// parts is a list of: blockType functionName specString argTypes [defaultValues...]
// 		if ((count parts) < 4) {
// 			add parts '' // add empty arg types string for a parmeterless function
// 		} else {
// 			parts = (copyFromTo parts 1 4) // remove any default arg values
// 		}
// 		// parts is now a list of: blockType functionName specString argTypes
// 		removeAt parts 2 // remove the function name
// 		// parts is now a list of: blockType specString argTypes
//
// 		// join the blockType, specString, and argType strings with tab delimiters
// 		return (joinStrings parts (string 9))
	}

	// Variables

	allVariableNames () {
		// Return a sorted array of all global variables. Use case-insensitive sort.

// 		result = (dictionary)
// 		addAll result (variableNames main)
// 		for lib (values libraries) {
// 			addAll result (variableNames lib)
// 		}
// 		return (sorted
// 			(keys result)
// 			(function s1 s2 { return ((toUpperCase s1) < (toUpperCase s2)) }))
	}

	addVariable (newVar) {
// 		addVariable main newVar
	}

	deleteVariable (varName) {
// 		for lib (values libraries) {
// 			deleteVariable lib varName
// 		}
	}

	// Variables

	allBroadcasts () {
// 		result = (dictionary)
// 		for entry (scripts main) {
// 			for b (allBlocks (last entry)) {
// 				if (isOneOf (primName b) 'sendBroadcast' 'whenBroadcastReceived') {
// 					add result (first (argList b))
// 				}
// 			}
// 		}
// 		return (toList (sorted (keys result)))
	}

	// Loading

	loadFromOldProjectClassAndSpecs (aClass, specList) {
		// Used when reading projects in the old .gpp format.

// 		initialize this
// 		for f (functions (module aClass)) { addFunction main f }
// 		for v (variableNames (module aClass)) { addVariable main v }
// 		for k (keys specList) { atPut blockSpecs k (at specList k) }
// 		setScripts main (copy (scripts aClass))
// 		updatePrimitives this
// 		fixFunctionLocals this
// 		return this
	}

	loadFromString (s, updateLibraries) {
		// Load project from a string in .ubp format. Keep libraries (modules) together.

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
// 		updatePrimitives this
// 		fixFunctionLocals this
// 		return this
	}

	addLibraryFromString (s, libName, fileName) {
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
// 			updatePrimitives lib
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

	parsedSpecs (cmdList) {
// 		specs = (dictionary)
// 		for cmd cmdList {
// 			if ('spec' == (primName cmd)) {
// 				args = (argList cmd)
// 				blockType = (at args 1)
// 				op = (at args 2)
// 				specString = (at args 3)
// 				slotTypes = ''
// 				if ((count args) > 3) { slotTypes = (at args 4) }
// 				slotDefaults = (array)
// 				if ((count args) > 4) { slotDefaults = (copyArray args ((count args) - 4) 5) }
// 				spec = (blockSpecFromStrings op blockType specString slotTypes slotDefaults)
// 				atPut specs op spec
// 			}
// 		}
// 		return specs
	}

	loadSpecs (cmdList) {
// 		specs = (parsedSpecs this cmdList)
// 		for k (keys specs) {
// 			atPut blockSpecs k (at specs k)
// 		}
	}

	splitCmdListIntoModules (cmdList) {
		// Split the list of commands into a list of command lists for each module of the project.
		// Each module after the first (main) module begins with a 'module' command.

// 		result = (list)
// 		m = (list)
// 		for cmd cmdList {
// 			if ('module' == (primName cmd)) {
// 				if (not (isEmpty m)) { add result m }
// 				m = (list)
// 			}
// 			add m cmd
// 		}
// 		add result m // add final module
// 		return result
	}

	// Saving

	codeString () {
		// Return a string representing this project in the new .ubp format.

// 		// sort libraries by name (this canonicalizes their order)
// 		sortedLibs = (sorted
// 			(values libraries)
// 			(function a b {return ((moduleName a) < (moduleName b))}))
//
// 		result = (list)
// 		add result (codeString main this)
// 		for lib sortedLibs {
// 			add result (newline)
// 			add result (codeString lib this)
// 		}
// 		return (joinStrings result)
	}

	// Post-load processing

	fixFunctionLocals () {
		// Remove project variables for function locals.

// 		projectVars = (allVariableNames this)
// 		for f (allFunctions this) { removeFieldsFromLocals f projectVars }
	}

	updatePrimitives () {
		// Update primitives that have been replaced with newer versions.

// 		updatePrimitives main
// 		for lib (values libraries) { updatePrimitives lib }
	}

	// save/load test

	saveLoadTest () {
		// Verify that this project can be saved and reloaded.

// 		s1 = (codeString this)
// 		p2 = (loadFromString (newMicroBlocksProject) s1)
// 		s2 = (codeString p2)
// 		if (s1 != s2) { print 'second codeString does not match first'; return false }
// 		if (not (equal this p2)) { print 'second project does not match first'; return false }
// 		return true
	}

	// equality

	equal (proj) {
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

class MicroBlocksModule {
	constructor(moduleName) {
		this.moduleName = moduleName;
		this.moduleCategory = 'Library';
		this.dependencies = [];
		this.version = [1, 0];
		this.author = 'unknown';
		this.description = '';
		this.tags = [];
		this.path = '';
		this.choices = new Map();
		this.variableNames = [];
		this.blockList = [];
		this.blockSpecs = new Map();
		this.functions = [];
		this.scripts = [];
		this.translationSources = new Map();
		this.isImplementation = false;
	}
}
