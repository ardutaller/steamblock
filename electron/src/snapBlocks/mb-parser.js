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

	readValue() {
		// Read and return the next number, quoted string, command, or command list.

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
					strBuf += '\''; // ending quote character
					break;
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
		let v = p.readValue();
		if (v != MB_EOF) console.log(v);
	}
}

function parser_test2() {
	let p = new MB_Parser("'xxx");
	p.skipWhiteSpace();
	let v = p.readValue(); // gives error - no closing string quote
}
