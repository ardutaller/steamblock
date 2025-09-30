# GP API

This API is meant to allow the JS/HTML world to get into the GP world.

The way to call an API endpoint from JS is:

```
GP.apiCall(endpointSelector, [...params], callback);
```

Where `endpointSelector` is one of the entries listed in the following section,
`params` is an array of parameters to pass to the API endpoint, and `callback`
is a JS function that optionally gets a parameter from the GP world.

Read on to see what endpoints exist and how to work with their return params.

## API endpoints

### IDE

#### ide.showAboutBox

Pop up the About MicroBlocks dialog box.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('ide.showAboutBox');`

#### ide.isAdvancedMode

Check whether the IDE is in advanced mode.

- **params:** none
- **returns:** (boolean) isAdvancedMode
- **example:**
```
	GP.apiCall(
		'ide.isAdvancedMode',
		[],
		(flag) => {
			console.log('The IDE is' + (flag ? ' ' : ' not ') + 'in advanced mode')
		}
	);
```

#### ide.isDarkMode

Check whether the IDE is in dark mode.

- **params:** none
- **returns:** (boolean) isDarkMode
- **example:**
```
	GP.apiCall(
		'ide.isDarkMode',
		[],
		(flag) => {
			console.log('The IDE is' + (flag ? ' ' : ' not ') + 'in dark mode')
		}
	);
```

### Project

#### project.save

Pop up the save project dialog window.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('project.save');`

#### project.new

Ask the IDE to create a new MicroBlocks project. Will pop up a confirmation
dialog prompt if a non-empty project is currently loaded.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('project.new');`

#### project.open

Asks the IDE to pop up the open project dialog window.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('project.open');`

#### project.copyURL

Copy the currently loaded project into the clipboard as a URL.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('project.copyURL');`

#### project.exportBlocksLibrary

Pop up a save file dialog to export the custom blocks in the current project as
a MicroBlocks library.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('project.exportBlocksLibrary');`

### Board

#### board.installVM

Triggers the process to install a VM into the currently plugged in board.
- **params:**
	- (boolean) wipeFlash: Wipe the board's flash memory before installing the VM.
	- (boolean) downloadFromServer: Retrieve a list of precompiled VMs from the MicroBlocks server.
- **returns:** nothing
- **example:** `GP.apiCall('board.installVM', [false, true]);`

#### board.uploadFile

Pops up a file dialog for the user to pick a file to upload to the board's file
system. Only available for Espressif boards.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('board.uploadFile');`

#### board.downloadFile

Pops up a menu for the user to pick a file from the board's file system to
retrieve. Only available for Espressif boards.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('board.downloadFile');`

#### board.retrieveProject

Tries to retrieve a MicroBlocks project that's been previously loaded into a
board. Will ask the user to plug in the board and connect to it.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('board.retrieveProject');`

#### board.canDoBLE

Checks whether the currently connected board supports programming over BLE.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('board.installVM', [false, true]);`
```
	GP.apiCall(
		'board.canDoBLE',
		[],
		(flag) => {
			console.log(
				'The board' + (flag ? ' supports ' : ' does not support ') + 'BLE'
			);
		}
	);
```
#### board.hasFS

Checks whether the currently connected board has a file system that can be read
and written from MicroBlocks.

- **params:** none
- **returns:** nothing
- **example:** `GP.apiCall('board.installVM', [false, true]);`
```
	GP.apiCall(
		'board.hasFS',
		[],
		(flag) => {
			console.log(
				'The board' +
					(flag ? ' has ' : ' does not have ') +
					'file system support'
			);
		}
	);
```

### Localization

#### locale.getLanguageList

Asks for the list of available languages to localize to.

- **params:** none
- **returns:** (array of strings) languages
- **example:** `GP.apiCall('locale.getLanguageList', [], (list) => console.log(list));`

