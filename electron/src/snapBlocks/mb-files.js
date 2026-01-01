// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//
// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

/*
	MB_Files - MicroBlocks server-based file system.
*/

MB_Files = {
	fileNames: null
}

MB_Files.initialize = async function () {
	// Return a set of all local variables used in this function.

	if (this.fileNames) return; // already initialized

	this.fileNames = [];
	let s = await this.readFileFromServer('files.txt');
	if (!s) return; // could not read files.txt from server; empty file system

	this.fileNames = s.split('\n');
}

MB_Files.readFileFromServer = async function (url) {
	if (!url) return undefined;
	try {
		const response = await fetch(url);
		if (!response.ok) return undefined;
		return response.text();
	} catch (error) {
		console.error("Could not read:", url, error);
	}
}

MB_Files.listFiles = function (dir) {
	// Return an array of files with the given directory prefix. Do not include subfolders.

	const prefixEnd = dir.length + 1;
	let result = [];
	for (const path of this.fileNames) {
		if (path.startsWith(dir) && (path.indexOf('/', prefixEnd) == -1)) {
			result.push(path);
		}
	}
	return result;
}

MB_Files.listFolders = function (dir) {
	const prefixEnd = dir.length;
	let result = [];
	for (const path of this.fileNames) {
		if (path.startsWith(dir) && (path.indexOf('/', prefixEnd) >= 0)) {
			result.push(path);
		}
	}
	return result;
}

MB_Files.initialize();
