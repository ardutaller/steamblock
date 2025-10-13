const EOF = -1;

class MB_Parser {
	constructor() {
		this.buf = '';
		this.bufSize = 0;
		this.bufPos = 0;
		this.fileName = '';
		this.complete = false;
		this.inString = false;
	}

	parse_setSourceString(fileName, srcString, byteCount) {
		// Start parsing the given string. Scripts are enumerated by calling parse_nextScript().
		this.buf = srcString;
		this.bufSize = srcString.length;
		this.bufPos = 0;
		this.fileName = fileName;
		this.complete = false;
		this.inString = false;
	}

	parse_nextScript(fromPrompt) {
	}

	parse_atEnd() {
	}

	parse_firstChar() {
		// Return the first non-whitespace character in the string to be parsed.

		skipWhiteSpace(p);
		return peek(p);
	}

	// ***** Stream Operations *****

	peek() {
		return (this.bufPos < this.bufSize) ? (this.buf)[this.bufPos] : EOF;
	}

	peek2() {
		return ((this.bufPos + 1) < this.bufSize) ? (this.buf)[this.bufPos + 1] : EOF;
	}

	next() {
		return (this.bufPos < this.bufSize) ? (this.buf)[this.bufPos++] : EOF;
	}

	skip(offset) {
		this.bufPos += offset;
		if (this.bufPos < 0) this.bufPos = 0;
		if (this.bufPos > this.bufSize) this.bufPos = this.bufSize;
	}

	isNewLine(c) {
		return (('\n' == c) || ('\r' == c));
	}

	skipNewLine() {
		// Consume a line ending and increment lineNumber. Assume stream is
		// positioned at a newline ('\n') or carriage return ('\r') character.
		// Handle lines ending with both '\r' and '\n' in either order.

		let c = this.next(p);
		if (('\n' == c) && ('\r' == this.peek(p))) {
			this.skip(p, 1);
		} else if (('\r' == c) && ('\n' == this.peek(p))) {
			this.skip(p, 1);
		}
		this.lineNumber++;
	}

	// ***** Skipping Whitespace and Comments (private methods) *****

	skipWhiteSpace() {
		let c;
		while ((c = this.next(p)) != EOF) {
			if (('/' == c) && ('/' == this.peek(p))) {
				this.skipRestOfLine(p);
				this.skipNewLine(p);
			} else if (this.isNewLine(c)) {
				skip(p, -1);
				this.skipNewLine(p);
			} else if (c > ' ') {
				this.skip(p, -1);
				return;
			}
		}
	}

	skipSpacesAndTabs() {
		let c;
		while ((c = this.next(p)) != EOF) {
			if (('/' == c) && ('/' == peek(p))) {
				this.skipRestOfLine(p);
				return;
			}
			if ((' ' != c) && ('\t' != c)) {
				this.skip(p, -1);
				return;
			}
		}
	}

	skipRestOfLine() {
		// Skip the remainder of the line, but do not consume the line ending.

		let c;
		while ((c = this.peek(p)) != EOF) {
			if (this.isNewLine(c)) return;
			this.skip(p, 1);
		}
	}

	// ***** Error Reporting *****

	parseError(problem) {
		console.log((this.fileName + ':' + this.lineNumber), problem);
	}

}
