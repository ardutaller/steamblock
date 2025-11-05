class MB_Function {
	constructor(functionName, argNames, cmdList, module = '') {
		this.functionName = functionName;
		this.argNames = argNames;
		this.cmdList = cmdList;
		this.module = module;
		this.localVars = this.collectLocalVars(cmdList);
	}

	collectLocalVars(cmdOrReporter) {
		// Return a set of all local variables used in this function.

		let result = new Set();
		for (let cmd of this.allVariableCmds()) {
			let sel = cmd.selector;
			if ((sel == 'local') || (sel == 'for')) {
				result.add(cmd.inputs()[0].evaluate());
			}
		}
		for (let arg of this.argNames) result.delete(arg);
		return Array.from(result);
	}

	forAllBlocks(f) {
		// Call the given function on all command and reporter blocks in this function.

		if (!this.cmdList) return;

		let todo = [this.cmdList];
		while (todo.length > 0) {
			let cmd = todo.pop();
			f(cmd);
			if (cmd instanceof CommandBlockMorph) {
				if (cmd.nextBlock()) todo.push(cmd.nextBlock());
			}
			for (let arg of cmd.inputs()) {
				if (arg instanceof BlockMorph) todo.push(arg);
			}
		}
	}

	allCalls() {
		// Return an array with the names of all functions called by this one.

		let result = new Set();
		this.forAllBlocks(cmd => {
			result.add(cmd.selector);
		});

		// remove selectors for control structure and variable blocks
		let keywords = [
			'if', 'forever', 'repeat', 'for', 'repeatUntil', 'waitUntil', 'exitLoop',
			'v', 'local', '=', '+=', 'return'];
		for (let w of keywords) result.delete(w);

		return Array.from(result);
	}

	globalVars() {
		// Return a list of all global variables used by this function.

		let result = new Set(this.allVars());
		for (let arg of this.argNames) result.delete(arg);
		for (let cmd of this.allVariableCmds()) {
			let sel = cmd.selector;
			if ((sel == 'local') || (sel == 'for')) {
				let localName = cmd.inputs()[0].evaluate();
				result.delete(localName);
			}
		}
		return Array.from(result);
	}
// 		result = (toList (allVars this))
// 		removeAll result argNames
//
// 		varNameIndex = ((fieldNameCount (class 'Command')) + 1)
// 		for ref (allVariableCmds this) {
// 			if (isOneOf (primName ref) 'local' 'for') {
// 				remove result (getField ref varNameIndex)
// 			}
// 		}
// 		return result

	allVars() {
		// Return a list of all parameter and variable names used in this function.

		let result = [];
		for (let cmd of this.allVariableCmds()) {
			let sel = cmd.selector;
			if ((sel == 'local') || (sel == 'for')) {
				let localName = cmd.inputs()[0].evaluate();
				result.push(localName);
			} else if (sel == 'v') {
				result.push(cmd.blockSpec);
			}
		}
		return result;
	}
// 		varNameIndex = ((fieldNameCount (class 'Command')) + 1)
// 		vars = (dictionary)
// 		for ref (allVariableCmds this) {
// 			add vars (getField ref varNameIndex)
// 		}
// 		return (keys vars)

	refsOfVariable(varName) {
		// Return a list of all commands and reporters that reference the given variable.

		return this.allVariableCmds().filter(cmd => {
			return (cmd.selector == 'v') ?
				(cmd.blockSpec == varName) :
				(cmd.inputs()[0].evaluate() == varName);
		});
// 		varNameIndex = ((fieldNameCount (class 'Command')) + 1)
// 		result = (list)
// 		for ref (allVariableCmds this) {
// 			if ((getField ref varNameIndex) == varName) { add result ref }
// 		}
// 		return result
	}

	allVariableCmds() {
		// Return an array of all commands and reporters that reference variables.

		let result = [];
		this.forAllBlocks(cmd => {
			let sel = cmd.selector;
			if (['v', '=', '+=', 'local', 'for'].includes(cmd.selector)) {
				result.push(cmd);
			}
		});
		return result;
	}
// 		result = (list)
// 		if (isNil cmdList) { return result }
// 		todo = (list cmdList)
// 		while ((count todo) > 0) {
// 			cmd = (removeFirst todo)
// 			op = (primName cmd)
// 			args = (argList cmd)
// 			if (isOneOf op 'v' '=' '+=' 'local' 'for') { add result cmd }
// 			for i (count args) {
// 				arg = (at args i)
// 				if (isClass arg 'Command') { add todo arg }
// 				if (isClass arg 'Reporter') { add todo arg }
// 			}
// 			if (notNil (nextBlock cmd)) { add todo (nextBlock cmd) }
// 		}
// 		return result

	returnsValue() {
		// Return true if this function contains a return statement with an argument.

		let result = false;
		this.forAllBlocks(cmd => {
			if ((cmd.selector == 'return') && (cmd.inputs().length == 1)) {
 				result = true;
			}
		});
		return result;
	}
// 		if (isNil cmdList) { return false }
// 		todo = (list cmdList)
// 		while ((count todo) > 0) {
// 			cmd = (removeFirst todo)
// 			if (and ('return' == (primName cmd)) ((count (argList cmd)) > 0)) {
// 				return true
// 			}
// 			args = (argList cmd)
// 			for i (count args) {
// 				arg = (at args i)
// 				if (isClass arg 'Command') { add todo arg }
// 				if (isClass arg 'Reporter') { add todo arg }
// 			}
// 			if (notNil (nextBlock cmd)) { add todo (nextBlock cmd) }
// 		}
// 		return false

	updateCmdList(newCmdList) {
		// Update the command list of this function or method after editing.
		// If the list of local variables used in the command list has
		// changed, update localVars.

// 		for b (allBlocks cmdList) { clearCache b }
// 		if (isNil newCmdList) {
// 			localVars = (array)
// 			cmdList = nil
// 			return
// 		}
// 		if (isClass newCmdList 'Reporter') {
// 			newCmdList = (toCommand newCmdList)
// 		}
// 		cmdList = newCmdList
// 		newLocals = (collectLocalVars cmdList)
// 		removeAll newLocals argNames
// 		newLocals = (sorted (keys newLocals))
// 		if (newLocals != (sorted localVars)) {
// 			localVars = newLocals
// 		}
// 		for b (allBlocks cmdList) { clearCache b }
	}

}

function functest() {
	let cmds = MB_Parser.parse('to test a { local b 10 \n return (+ (foo a) c) }');
	let b = MB_Parser.blockFor(cmds[0]);
	let nameAndArgs = b.inputValues();
	let funcName = nameAndArgs[0];
	let argNames = nameAndArgs.slice(1);
	let f = new MB_Function(funcName, argNames, b.nextBlock());
	console.log(f);
	console.log('calls:', f.allCalls());
	console.log('all vars:', f.allVars());
	console.log('locals:', f.localVars);
	console.log('globals:', f.globalVars());
	console.log('refs of a', f.refsOfVariable('a'));
}
