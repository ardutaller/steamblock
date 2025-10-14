const MB_EOF = {}; // Unique object used to mark the end of a string being parsed.

class MB_Parser {
	constructor(srcString, fileName = '<string>') {
		// Start parsing the given string. Read scripts until MB_EOF by calling nextScript().

		this.buf = Array.from(srcString);
		this.bufSize = this.buf.length;
		this.bufPos = 0;
		this.fileName = fileName;
		this.lineNumber = 1;
		this.complete = false;
		this.inString = false;
	}

	// Public methods

	nextScript() {
		// Return the next reporter, command, or command list in the string being parsed
		// or MB_EOF when all items have been read.

		this.complete = true;
		this.inString = false;

		skipWhiteSpace();
		if (this.bufPos >= this.bufSize) return MB_EOF;

		let script = readCmdList();

		if (this.inString) {
			this.parseError('Missing closing string quote');
			return MB_EOF;
		}
		if (!this.complete) {
			this.parseError('Missing closing bracket or parenthesis');
			return MB_EOF;
		}
		return script;
	}

	atEnd() {
		// Return true when all items have been read.

		return this.bufPos >= this.bufSize;
	}

	firstChar() {
		// Return the first non-whitespace character in the string to be parsed or MB_EOF.

		skipWhiteSpace();
		return this.peek();
	}

	// Private methods

	// ***** Command Parsing *****

	readCmdList() {
		// Read a list of commands, either with or without and initial '{'.

		let hadOpenBracket = false;

		this.skipWhiteSpace();
		if ('{' == this.peek()) {
			this.skip(1);
			hadOpenBracket = true;
		}

		let firstCmd = null;
		let lastCmd = null;
		let c;
		while (true) {
			this.skipWhiteSpace();
			c = this.peek();
			if ((MB_EOF == c) || ('}' == c)) break;
			let cmdOrValue = this.readCmd(false);
			if (cmdOrValue instanceof CommandBlockMorph) {
				if (!firstCmd) firstCmd = cmdOrValue;
				if (lastCmd) lastCmd.nextBlock(cmdOrValue);
				lastCmd = cmdOrValue;
			} else {
				if (!hadOpenBracket && !firstCmd) return cmdOrValue; // not a cmd list; return it
			}
			if (';' == this.peek()) {
				this.skip(1);
				continue; // multiple commands on the same line
			}
			if (!hadOpenBracket) break;
		}

		if (hadOpenBracket) {
			if ('}' == c) {
				this.skip(1);
			} else {
				this.complete = false;
			}
		} else if ('}' == c) {
			this.parseError('Unexpected "}" encountered');
			this.skip(1);
		}
		return firstCmd;
	}

	readCmd(isReporter) {
		// Read a command or reporter. Terminate at close paren, close bracket, end of line, or end of file.

		let buf = [];
		if (isReporter && ('(' == this.peek())) {
			this.skip(1);
		}

		let c;
		while (true) { // collect selector and arguments
			if (isReporter) {
				this.skipWhiteSpace();
			} else {
				this.skipSpacesAndTabs(); // reporters can span lines
			}
			c = this.peek();
			if ((MB_EOF == c) || (this.isNewLine(c))) break;
			if ((')' == c) || (';' == c) || ('}' == c)) break;
			buf.push(this.readToken());
		}

		if (isReporter) {
			if (')' == c) {
				this.skip(1);
			} else {
				this.complete = false;
				if ((';' == c) || ('}' == c)) {
					this.parseError("Missing ')'");
					this.skipRestOfLine();
				}
				return null;
			}
		} else {
			if (')' == c) {
				this.parseError("Unexpected ')' encountered");
				this.skip(1);
			}
		}

		if (buf.length == 0) {
			this.parseError('Empty command or reporter');
			return null;
		}

		if ((buf.length == 3) && this.isInfixOp(buf[1]) && !this.isCallOp(buf[0])) {
			// Convert infix to prefix order (unless the command is 'call' or 'callWith')
			let tmp = buf[0];
			buf[0] = buf[1];
			buf[1] = tmp;
		}

		if (buf.length == 1) {
			if (((typeof buf[0]) != 'string') || (buf[0][0] == "'")) {
				return buf[0]; // constant (number, quoted string, or special value)
			}
		}

		let selector = buf[0];
		if ((typeof selector) != 'string') {
			parseError('Selector must be a string; missing parentheses around a subexpression?');
			return null;
		} else if (selector[0] == "'") {
			selector = selector.slice(1, -1); // remove quotes
			buf[0] = selector;
		}

		return this.makeBlock(buf, isReporter);
	}

	makeBlock(buf, isReporter) {
		let selector = buf[0];
		let args = buf.slice(1);
		let spec = this.makeSpec(selector, args);
		let b;
		if (isReporter) {
			b = newBlock('r', '', spec);
			b.selector = selector;
		} else {
			b = newBlock(' ', '', spec);
			b.selector = selector;
		}
		let inputs = b.inputs();
		let count = Math.min(args.length, inputs.length);
		for (let i = 0; i < count; i++) {
			if (args[i] instanceof BlockMorph) {
				b.replaceInput(inputs[i], args[i]);
				args[i].fixBlockColor();
			} else {
				inputs[i].setContents(args[i]);
			}
		}
		b.fixBlockColor();
		return b;
	}

	makeSpec(selector, args) {
		let result = (selector + ' ');
		for (let i = 0; i < args.length; i++) {
			let arg = args[i];
			if ((typeof arg) == 'number') {
				result += '%n';
			} else if (((typeof arg) == 'string') || (arg == null)) {
				result += '%s';
			} else if ((arg == true) || (arg == false)) {
				result += '%bool';
			} else if (arg instanceof CommandBlockMorph) {
				result += '%c';
			} else {
				result += '%ns';
			}
			if (i < (args.length - 1)) {
				result += ' ';
			}
		}
		return result;
	}

	// ***** Command Parsing Support *****

	isInfixOp(op) {
		let infixOps = [
			'=', '+=',
			'+', '-', '*', '/', '%',
			'<', '<=', '==', '!=', '>=', '>', '===',
			'&', '|', '^', '<<', '>>', '>>>',
		];
		return infixOps.includes(op);
	}

	isCallOp(op) {
		return (('call' == op) || ('callWith' == op));
	}

	isProperName(op, index, argCount) {
		// Return true if the given operation uses the argument at the given index as a proper name such as
		// a variable or function name. Proper names are treated as strings, not variable references.

		let quoteAll = ['to', 'defineClass', 'method'];
		if (quoteAll.includes(op)) return true;

		let quoteFirstArg = ['v', '=', '+=', 'local', 'for', 'help', 'classComment'];
		if ((index == 1) && (quoteFirstArg.includes(op))) return true;

		if (('function' == op) && (index < argCount)) return true;
		return false;
	}

	argOrVarRef(arg, op, index, argCount, lineNum) {
		// If arg is an unquoted string and the arg at the given index is not used
		// as a proper name by the given operator, create a variable reference.
		// Otherwise, just return arg, without the quotes if it was quoted.

		if (arg[0] == "'") {
			// quoted string constant; remove the quotes
			arg = arg.slice(1, -1);
		} else { // arg is an unquoted string, so it could be a variable reference
			if (!isProperName(op, index, argCount) && !isInfixOp(arg)) {
				// return a variable reporter block
				// to do: how do we represent a variable reporter in Snap?
				let b = newBlock('r', '', 'v %s');
				b.selector = 'v';
				b.inputs()[0].setContents(spec);
				return b;
				return ['v', arg];
			}
		}
		return arg;
	}

	// ***** Tokenizing *****

	readToken() {
		// Read and return the next number, quoted string, command, or command list.

		this.skipWhiteSpace();
		let c = this.peek();
		if (MB_EOF == c) {
			this.complete = false;
			return MB_EOF;
		}
		if (this.isDigit(c)) return this.readNumber();
		else if ((('-' == c) || ('.' == c)) && this.isDigit(this.peek2())) return this.readNumber();
		else if ('\'' == c) return this.readString();
		else if ('(' == c) return this.readCmd(true);
		else if ('{' == c) return this.readCmdList();
		else return this.readSymbol();
	}

	readNumber() {
		// Read and return the next integer or floating point number.

		let numBuf = '';
		let isFloat = false;
		while (true) {
			let c = this.peek();
			if (this.isDigit(c) || ('-' == c)) {
				numBuf += this.next();
			} else if ('.' == c) {
				numBuf += this.next();
				isFloat = true;
			} else if (('e' == c) || ('E' == c)) {
				numBuf += this.next();
				c = this.peek();
				if (('+' == c) || ('-' == c)) {
					numBuf += this.next();
				}
				isFloat = true;
			} else {
				break;
			}
		}
		return Number(numBuf);
	}

	isDigit(c) {
		return ('0' <= c) && (c <= '9');
	}

	readString() {
		// Read a string that starting and ending with a single quote characters.

		let strBuf = '';
		strBuf += this.next(); // initial quote character
		this.inString = true;
		while (true) {
			let c = this.next();
			if (MB_EOF == c) {
				this.parseError('No closing quote');
				this.complete = false;
				break;
			}
			if ('\'' == c) {
				if ('\'' == this.peek()) {
					this.skip(1); // quoted quote character
				} else {
					strBuf += '\'';
					break; // skip ending quote character
				}
			}
			strBuf += c;
			if (this.isNewLine(c)) {
				this.lineNumber++;
				// For lines ending in both cr and lf, consume both chars to avoid incrementing the line number twice.
				if ((c == '\n') && (this.peek() == '\r')) strBuf += this.next();
				if ((c == '\r') && (this.peek() == '\n')) strBuf += this.next();
			}
		}
		this.inString = false;
		return strBuf;
	}

	readSymbol() {
		// Read an unquoted string or one of the special values: true, false, or nil.

		let symbol = [];
		while (true) {
			let c = this.peek();
			if ((c <= ' ') || (')' == c) || ('}' == c) || (';' == c) || (MB_EOF == c)) {
				break;
			}
			symbol += this.next();
		}
		if ('true' == symbol) return true;
		if ('false' == symbol) return false;
		if ('nil' == symbol) return null;
		return symbol;
	}

	// ***** Stream Operations *****

	peek() {
		// Return the next character without advancing bufPos.

		return (this.bufPos < this.bufSize) ? (this.buf)[this.bufPos] : MB_EOF;
	}

	peek2() {
		// Return the character after the next one without advancing bufPos.

		return ((this.bufPos + 1) < this.bufSize) ? (this.buf)[this.bufPos + 1] : MB_EOF;
	}

	next() {
		// Return the next character and advance bufPos or MB_EOF if at end.

		return (this.bufPos < this.bufSize) ? (this.buf)[this.bufPos++] : MB_EOF;
	}

	skip(skipCount) {
		// Skip the given number of characters.

		this.bufPos += skipCount;
		if (this.bufPos < 0) this.bufPos = 0;
		if (this.bufPos > this.bufSize) this.bufPos = this.bufSize;
	}

	isNewLine(c) {
		// Return true if c is a newline or carriage return character.

		return (('\n' == c) || ('\r' == c));
	}

	skipNewLine() {
		// Consume a line ending and increment lineNumber. Assume stream is
		// positioned at a newline ('\n') or carriage return ('\r') character.
		// Handle lines ending with both '\r' and '\n' in either order.

		let c = this.next();
		if (('\n' == c) && ('\r' == this.peek())) {
			this.skip(1);
		} else if (('\r' == c) && ('\n' == this.peek())) {
			this.skip(1);
		}
		this.lineNumber++;
	}

	// ***** Skipping Whitespace and Comments *****

	skipWhiteSpace() {
		// Skip whitespace, including comments and newlines.
		// Stop at the first printable character or MB_EOF.
		// Comments begin with a double slash (//) and extend to the end of the line.

		let c;
		while ((c = this.next()) != MB_EOF) {
			if (('/' == c) && ('/' == this.peek())) {
				this.skipRestOfLine();
				this.skipNewLine();
			} else if (this.isNewLine(c)) {
				this.skip(-1);
				this.skipNewLine();
			} else if (c > ' ') {
				this.skip(-1);
				return;
			}
		}
	}

	skipSpacesAndTabs() {
		// Skip spaces, tabs, and comments within one line. Do not consume the line ending.
		// Comments begin with a double slash (//) and extend to the end of the line.

		let c;
		while ((c = this.next()) != MB_EOF) {
			if (('/' == c) && ('/' == this.peek())) {
				this.skipRestOfLine();
				return;
			}
			if ((' ' != c) && ('\t' != c)) {
				this.skip(-1);
				return;
			}
		}
	}

	skipRestOfLine() {
		// Skip the remainder of the line, but do not consume the line ending.

		let c;
		while ((c = this.peek()) != MB_EOF) {
			if (this.isNewLine(c)) return;
			this.skip(1);
		}
	}

	// ***** Error Reporting *****

	parseError(problem) {
		console.log('MicroBlocks syntax error:', (this.fileName + ':' + this.lineNumber), problem);
	}

} // end of class MB_Parser

// Parser Tests

function parser_test1() {
	let p = new MB_Parser("33 1 2 3 foo 'bar' nil true false\n -1 -3.14 -314e-1 -314E-2");
	while (!p.atEnd()) {
		p.skipWhiteSpace();
		let v = p.readToken();
		if (v != MB_EOF) console.log(v);
	}
}

function parser_test2() {
	let p = new MB_Parser("'xxx");
	p.skipWhiteSpace();
	let v = p.readToken(); // gives error - no closing string quote
}

function parser_test3() {
	let p = new MB_Parser("  'foo'  ");
	console.log(p.readCmd(false));
}

function parser_test4() {
	let p = new MB_Parser("  { stop; go }  ");
	let b = p.readCmd(false);
	console.log(b);
	addBlockToScripts(b);
}

function parser_test5() {
	let p = new MB_Parser("  print ((1 + 2) * 3) { stop }  ");
	let b = p.readCmd(false);
	console.log(b);
	addBlockToScripts(b);
}

function randomBetween(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addBlockToScripts(b) {
	let scripts = world.childThatIsA(ScriptsMorph); // assume palette is the last child of world
	b.setPosition(new Point(randomBetween(200, 1000), randomBetween(10, 500)));
	scripts.add(b);
	scripts.changed();
}
