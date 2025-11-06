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
		for (const cmd of this.allVariableCmds()) {
			let sel = cmd.selector;
			if ((sel == 'local') || (sel == 'for')) {
				result.add(cmd.inputs()[0].evaluate());
			}
		}
		for (const arg of this.argNames) result.delete(arg);
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
			for (const arg of cmd.inputs()) {
				if (arg instanceof BlockMorph) todo.push(arg);
			}
		}
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

	globalVars() {
		// Return a list of all global variables used by this function.

		let result = new Set(this.allVars());
		for (const arg of this.argNames) result.delete(arg);
		for (const cmd of this.allVariableCmds()) {
			let sel = cmd.selector;
			if ((sel == 'local') || (sel == 'for')) {
				let localName = cmd.inputs()[0].evaluate();
				result.delete(localName);
			}
		}
		return Array.from(result);
	}

	allVars() {
		// Return a list of all parameter and variable names used in this function.

		let result = new Set();
		for (const cmd of this.allVariableCmds()) {
			if (cmd.selector == 'v') {
				result.add(cmd.blockSpec);
			} else {
				result.add(cmd.inputs()[0].evaluate());
			}
		}
		return Array.from(result);
	}

	refsOfVariable(varName) {
		// Return a list of all commands and reporters that reference the given variable.

		return this.allVariableCmds().filter(cmd => {
			return (cmd.selector == 'v') ?
				(cmd.blockSpec == varName) :
				(cmd.inputs()[0].evaluate() == varName);
		});
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
		for (const w of keywords) result.delete(w);

		return Array.from(result);
	}

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
