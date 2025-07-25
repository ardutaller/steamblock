/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// sdCardPrims.c - SD Card file system.
// John Maloney, July 2025

#include "mem.h"
#include "interp.h"

#if defined(SD_CARD)

#if defined(ARDUINO_BBC_MICROBIT_V2)
	#define SS 16
#endif

#include <SdFat.h>

SdFat SD;

#define SPI_SPEED SD_SCK_MHZ(16)

#if defined(ARDUINO_ARCH_RP2040)
	#define DEFAULT_CS_PIN PIN_SPI0_SS
#else
	#define DEFAULT_CS_PIN SS
#endif

// Variables

// Current chip select pin; -1 if not yet initialized
static int sdCardCSPin = -1;
static char fullPath[32]; // used to prefix "/" to file names

typedef struct {
	char fileName[32];
	FsFile file;
} FileEntry;

#define FILE_ENTRIES 8
static FileEntry fileEntry[FILE_ENTRIES]; // fileEntry[] records open files

// Helper functions

static void initSDCard(int chipSelectPin) {
	if (sdCardCSPin != chipSelectPin) {
		if (sdCardCSPin != -1) SD.end();
		if (chipSelectPin < 0) chipSelectPin = DEFAULT_CS_PIN;
		int ok = SD.begin(chipSelectPin, SD_SCK_MHZ(16));
		if (!ok) {
			outputString("Could not open SD Card.");
			outputString("Check wiring, chip select pin, and that card is inserted.");
			sdCardCSPin = -1;
			return;
		}
		outputString("SD Card opened");
		sdCardCSPin = chipSelectPin;
	}
}

static char *extractFilename(OBJ obj) {
	fullPath[0] = '\0';
	if (IS_TYPE(obj, StringType)) {
		char *fileName = obj2str(obj);
		if (strcmp(fileName, "ublockscode") == 0) return fullPath;
		if ('/' == fileName[0]) return fileName; // fileName already had a leading "/"
		snprintf(fullPath, 31, "/%s", fileName);
	} else {
		fail(needsStringError);
	}
	return fullPath;
}

static int entryFor(char *fileName) {
	// Return the index of a file entry for the file with the given path.
	// Return -1 if fileName doesn't match any entry.

	if (sdCardCSPin < 0) initSDCard(DEFAULT_CS_PIN);
	if (!fileName[0]) return -1; // empty string is not a valid file name
	for (int i = 0; i < FILE_ENTRIES; i++) {
		if (0 == strcmp(fileName, fileEntry[i].fileName)) return i;
	}
	return -1;
}

static int freeEntry() {
	// Return the index of an unused file entry or -1 if there isn't one.

	for (int i = 0; i < FILE_ENTRIES; i++) {
		if (!fileEntry[i].file) return i;
	}
	return -1; // no free entry
}

static void closeIfOpen(char *fileName) {
	// Called from fileTransfer.cpp.

	int i = entryFor(fileName);
	if (i >= 0) {
		fileEntry[i].fileName[0] = '\0';
		fileEntry[i].file.close();
	}
}

static void closeAndDeleteFile(char *fileName) {
	// Called from fileTransfer.cpp.

	closeIfOpen(fileName);
	SD.remove(fileName);
}

// Initialize

static OBJ primInit(int argCount, OBJ *args) {
	int csPin = ((argCount > 0) && isInt(args[0])) ? obj2int(args[0]) : -1;
	initSDCard(csPin);
	return falseObj;
}

// Open, Close, Delete

static OBJ primOpen(int argCount, OBJ *args) {
	if (argCount < 1) return fail(notEnoughArguments);
	char *fileName = extractFilename(args[0]);
	if (!fileName[0]) return falseObj;

	int i = entryFor(fileName);
	if (i >= 0) { // use the existing entry
		fileEntry[i].file.seekSet(0); // read from start of file
		return falseObj;
	}

	if (sdCardCSPin < 0) initSDCard(DEFAULT_CS_PIN);
	i = freeEntry();
	if (i >= 0) { // initialize new entry
		fileEntry[i].fileName[0] = '\0';
		strncat(fileEntry[i].fileName, fileName, 31);
		fileEntry[i].file = SD.open(fileName, O_APPEND);
		fileEntry[i].file.seekSet(0); // read from start of file
	}
	return falseObj;
}

static OBJ primClose(int argCount, OBJ *args) {
	if (argCount < 1) return fail(notEnoughArguments);
	char *fileName = extractFilename(args[0]);

	closeIfOpen(fileName);
	return falseObj;
}

static OBJ primDelete(int argCount, OBJ *args) {
	if (argCount < 1) return fail(notEnoughArguments);
	char *fileName = extractFilename(args[0]);
	if (!fileName[0]) return falseObj;

	closeAndDeleteFile(fileName);
	return falseObj;
}

// Reading

static OBJ primEndOfFile(int argCount, OBJ *args) {
	if (argCount < 1) return fail(notEnoughArguments);
	char *fileName = extractFilename(args[0]);

	int i = entryFor(fileName);
	if (i < 0) return trueObj;

	return (!fileEntry[i].file.available()) ? trueObj : falseObj;
}

static OBJ primReadLine(int argCount, OBJ *args) {
	if (argCount < 1) return fail(notEnoughArguments);
	char *fileName = extractFilename(args[0]);

	int i = entryFor(fileName);
	if (i < 0) return newString(0);

	char buf[800];
	uint32 byteCount = 0;
	while ((byteCount < sizeof(buf)) && fileEntry[i].file.available()) {
		int ch = fileEntry[i].file.read();
		if ((10 == ch) || (13 == ch)) {
			if ((10 == ch) && (13 == fileEntry[i].file.peek())) fileEntry[i].file.read(); // lf-cr ending
			if ((13 == ch) && (10 == fileEntry[i].file.peek())) fileEntry[i].file.read(); // cr-lf ending
			break;
		}
		buf[byteCount++] = ch;
	}
	OBJ result = newString(byteCount);
	if (result) {
		memcpy(obj2str(result), buf, byteCount);
	}
	return result;
}

static OBJ primReadBytes(int argCount, OBJ *args) {
	if (argCount < 2) return fail(notEnoughArguments);
	if (!isInt(args[0])) return fail(needsIntegerError);
	uint32 byteCount = obj2int(args[0]);
	char *fileName = extractFilename(args[1]);

	int i = entryFor(fileName);
	if (i >= 0) {
		uint8 buf[800];
		if (byteCount > sizeof(buf)) byteCount = sizeof(buf);
		if ((argCount > 2) && isInt(args[2])) {
			fileEntry[i].file.seekSet(obj2int(args[2]));
		}
		byteCount = fileEntry[i].file.read(buf, byteCount);
		if (!byteCount && fileEntry[i].file.available()) {
			// workaround for rare read error -- skip to the next block
			int pos = fileEntry[i].file.position();
			reportNum("skipping bad file block at", pos);
			fileEntry[i].file.seekSet(pos + 256);
			byteCount = fileEntry[i].file.read(buf, byteCount);
		}
		int wordCount = (byteCount + 3) / 4;
		OBJ result = newObj(ByteArrayType, wordCount, falseObj);
		if (result) {
			setByteCountAdjust(result, byteCount);
			memcpy(&FIELD(result, 0), buf, byteCount);
			return result;
		}
	}
	return newObj(ByteArrayType, 0, falseObj); // empty byte array
}

static OBJ primReadInto(int argCount, OBJ *args) {
	if (argCount < 2) return fail(notEnoughArguments);
	OBJ buf = args[0];
	char *fileName = extractFilename(args[1]);
	if (ByteArrayType != objType(buf)) return fail(needsByteArray);

	int i = entryFor(fileName);
	if (i < 0) return zeroObj; // file not found

	int bytesRead = fileEntry[i].file.read((uint8 *) &FIELD(buf, 0), BYTES(buf));
	return int2obj(bytesRead);
}

// Read positioning

static OBJ primReadPosition(int argCount, OBJ *args) {
	if (argCount < 1) return fail(notEnoughArguments);
	if (!IS_TYPE(args[0], StringType)) return fail(needsStringError);
	char *fileName = extractFilename(args[0]);

	int result = 0;
	int i = entryFor(fileName);
	if (i >= 0) {
		result = fileEntry[i].file.position();
	}
	return int2obj(result);
}

static OBJ primSetReadPosition(int argCount, OBJ *args) {
	if (argCount < 2) return fail(notEnoughArguments);
	if (!IS_TYPE(args[1], StringType)) return fail(needsStringError);
	char *fileName = extractFilename(args[1]);
	int newPosition = evalInt(args[0]);
	if (newPosition < 0) newPosition = 0;

	int i = entryFor(fileName);
	if (i >= 0) {
		int fileSize = fileEntry[i].file.size();
		if (newPosition > fileSize) newPosition = fileSize;
		fileEntry[i].file.seekSet(newPosition);
	}
	return falseObj;
}

// Writing

static OBJ primAppendLine(int argCount, OBJ *args) {
	// Append a String to a file followed by a newline.

	if (argCount < 2) return fail(notEnoughArguments);
	if (!IS_TYPE(args[1], StringType)) return fail(needsStringError);
	char *fileName = extractFilename(args[1]);
	OBJ arg = args[0];

	int i = entryFor(fileName);
	if (i >= 0) {
		int oldPos = fileEntry[i].file.position();
		int oldSize = fileEntry[i].file.size();
		if (oldPos != oldSize) fileEntry[i].file.seekEnd(); // seek to current end
		if (IS_TYPE(arg, StringType)) {
			fileEntry[i].file.print(obj2str(arg));
		} else if (isInt(arg)) {
			fileEntry[i].file.print(obj2int(arg));
		} else if (isBoolean(arg)) {
			fileEntry[i].file.print((trueObj == arg) ? "true" : "false");
		} else if (IS_TYPE(arg, ListType)) {
			// print list items separated by spaces
			int count = obj2int(FIELD(arg, 0));
			for (int j = 1; j <= count; j++) {
				OBJ item = FIELD(arg, j);
				if (IS_TYPE(item, StringType)) {
					fileEntry[i].file.print(obj2str(item));
				} else if (isInt(item)) {
					fileEntry[i].file.print(obj2int(item));
				} else if (isBoolean(item)) {
					fileEntry[i].file.print((trueObj == item) ? "true" : "false");
				}
				if (j < count) fileEntry[i].file.write(32); // space
			}
		}
		fileEntry[i].file.write(10); // newline
		fileEntry[i].file.flush();
		if (oldPos != oldSize) fileEntry[i].file.seekSet(oldPos); // reset position for reading
	}
	processMessage();
	return falseObj;
}

static OBJ primAppendBytes(int argCount, OBJ *args) {
	// Append a ByteArray or String to a file. No newline is added.

	if (argCount < 2) return fail(notEnoughArguments);
	OBJ data = args[0];
	char *fileName = extractFilename(args[1]);

	int i = entryFor(fileName);
	if (i < 0) return falseObj;

	if (IS_TYPE(data, ByteArrayType)) {
		fileEntry[i].file.write((uint8 *) &FIELD(data, 0), BYTES(data));
	} else if (IS_TYPE(data, StringType)) {
		char *s = obj2str(data);
		fileEntry[i].file.write((uint8 *) s, strlen(s));
	}
	fileEntry[i].file.flush();
	processMessage();
	return falseObj;
}

// File list

static FsFile listDir;

static OBJ primStartFileList(int argCount, OBJ *args) {
	if (sdCardCSPin < 0) initSDCard(DEFAULT_CS_PIN);
	listDir = SD.open("/");
	return falseObj;
}

static OBJ primNextFileInList(int argCount, OBJ *args) {
	char fileName[100];
	FsFile file = listDir.openNextFile();
	while (file && file.isDir()) {
		file = listDir.openNextFile();
	}
	file.getName(fileName, sizeof(fileName) - 1);
	char *s = fileName;
	if ('/' == s[0]) s++; // skip leading slash
	return newStringFromBytes(s, strlen(s));
}

// File info

static OBJ primFileSize(int argCount, OBJ *args) {
	if (argCount < 1) return fail(notEnoughArguments);
	char *fileName = extractFilename(args[0]);
	if (!fileName[0]) return int2obj(-1);

	if (sdCardCSPin < 0) initSDCard(DEFAULT_CS_PIN);
	FsFile file = SD.open(fileName, O_RDONLY);
	if (!file) return int2obj(-1);
	int size = file.size();
	file.close();
	return int2obj(size);
}

// System info

static OBJ primSystemInfo(int argCount, OBJ *args) {
	if (sdCardCSPin < 0) initSDCard(DEFAULT_CS_PIN);
	size_t totalBytes = SD.clusterCount() * SD.bytesPerCluster();
	size_t usedBytes = totalBytes - (SD.freeClusterCount() * SD.bytesPerCluster());

	char result[100];
	sprintf(result, "%u kbytes used of %u kbytes", usedBytes / 1024, totalBytes / 1024);
	return newStringFromBytes(result, strlen(result));
}

#endif

// Primitives

static PrimEntry entries[] = {
	#if defined(SD_CARD)
		{"init", primInit},
		{"open", primOpen},
		{"close", primClose},
		{"delete", primDelete},
		{"endOfFile", primEndOfFile},
		{"readLine", primReadLine},
		{"readBytes", primReadBytes},
		{"readInto", primReadInto},
		{"readPosition", primReadPosition},
		{"setReadPosition", primSetReadPosition},
		{"appendLine", primAppendLine},
		{"appendBytes", primAppendBytes},
		{"fileSize", primFileSize},
		{"startList", primStartFileList},
		{"nextInList", primNextFileInList},
		{"systemInfo", primSystemInfo},
	#endif
};

void addSDCardPrims() {
	addPrimitiveSet(SDCardPrims, "sd", sizeof(entries) / sizeof(PrimEntry), entries);
}
