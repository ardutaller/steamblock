const { app, dialog, ipcMain, BrowserWindow, Menu, MenuItem } = require('electron');
const path = require('node:path');
const fs = require('fs');

app.commandLine.appendSwitch('enable-experimental-web-platform-features', true);
app.commandLine.appendSwitch('gtk-version', '3');

let bleStartMSecs;
let bleMenu;

function bleSelectMenu(portList, callback) {
	function itemSelected(menuItem, window, event) {
		bleStartMSecs = undefined;
		bleMenu = undefined;
		callback(menuItem.id);
	}
	function bleMenuClosed() {
		if (bleMenu) callback('');
		bleStartMSecs = undefined;
		bleMenu = undefined;
	}

	if (bleMenu) return; // already showing menu

	if (bleStartMSecs === undefined) bleStartMSecs = Date.now(); // first call
	if ((Date.now() - bleStartMSecs) < 500) return; // wait a bit to collect BLE devices

	bleMenu = new Menu();
	for (var i = 0; i < portList.length; i++) {
		var item = portList[i];
		bleMenu.append(new MenuItem({label: item.deviceName, click: itemSelected, id: item.deviceId}));
	}
	bleMenu.append(new MenuItem({type: 'separator'}));
	bleMenu.append(new MenuItem({label: 'cancel', click: bleMenuClosed}));
	bleMenu.popup({callback: bleMenuClosed});
}

function serialSelectMenu(portList, callback) {
	function serialPortSelected(menuItem, window, event) {
		callback(menuItem.id);
	}

	const myMenu = new Menu();
	for (var i = 0; i < portList.length; i++) {
		var item = portList[i];
		var fullName = item.displayName + ' (' + item.portName + ')';
		myMenu.append(new MenuItem({label: fullName, click: serialPortSelected, id: item.portId}));
	}
	myMenu.append(new MenuItem({type: 'separator'}));
	myMenu.append(new MenuItem({label: 'cancel'}));
	myMenu.popup();
}

function usbSelectMenu(deviceList, callback) {
	function itemSelected(menuItem, window, event) {
		callback(menuItem.id);
	}

	let usbMenu = new Menu();
	for (var i = 0; i < deviceList.length; i++) {
		var item = deviceList[i];
		usbMenu.append(new MenuItem({label: item.productName, click: itemSelected, id: item.deviceId}));
	}
	usbMenu.append(new MenuItem({type: 'separator'}));
	usbMenu.append(new MenuItem({label: 'cancel'}));
	usbMenu.popup();
}

// File Open and Save Dialogs

ipcMain.handle('dialog:openFile', async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog();
	if (!canceled && filePaths.length > 0) {
		// Read the file natively using Node's fs module
		const data = fs.readFileSync(filePaths[0]);
		return { filePath: filePaths[0], content: data };
	}
	return null;
});

ipcMain.handle('dialog:saveFile', async (event, suggestedName, isBinary, data) => {
	const { canceled, filePath } = await dialog.showSaveDialog({ defaultPath: suggestedName });
	if (!canceled && filePath) {
		if (isBinary) {
			await fs.writeFileSync(filePath, data); // to write binary not pass a third parameter
		} else {
			await fs.writeFileSync(filePath, data, 'utf8');
		}
		return filePath;
	}
	return null;
});

// main window

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		icon: path.join(__dirname, 'MicroBlocks.png'),
		width: 1024,
		height: 768,
		autoHideMenuBar: true,
		minWidth: 640,
		minHeight: 480,
		webPreferences: {
			nodeIntegration: true, // to allow require
			//contextIsolation: false, // allow use with Electron 12+
			preload: path.join(__dirname, 'preload.js'),
		}
	});

	mainWindow.webContents.session.setPermissionCheckHandler(
		(webContents, permission, requestingOrigin, details) => {
			return (permission === 'serial' || permission === 'usb');
		}
	);

	mainWindow.webContents.session.setDevicePermissionHandler((details) => {
		return (details.deviceType === 'serial' || details.deviceType === 'usb');
	});

	// Force-quit electron when window is closed (needed on MacOS).
	mainWindow.on('close', (e) => { app.exit(); });

	mainWindow.webContents.session.on(
		'select-serial-port',
		(event, portList, webContents, callback) => {
			event.preventDefault();
			serialSelectMenu(portList, callback);
	});

	mainWindow.webContents.session.on(
		'select-usb-device',
		(event, details, callback) => {
			event.preventDefault();
			usbSelectMenu(details.deviceList, callback);
	});

	mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
		// When the user requests a BLE connection, this function is called repeatedly
		// until the callback function is called. The number devices in the device list
		// grows over time as additional devices are discovered. The current strategy is to
		// wait a little, then present a menu of the devices that have been discovered
		// up to that point.

		event.preventDefault();
		bleSelectMenu(deviceList, callback);
	});

	// open devTools when in dev mode
	if (!app.isPackaged) { mainWindow.webContents.openDevTools(); }

	mainWindow.loadFile(
		app.isPackaged ?
			path.join(process.resourcesPath, '/webapp/microblocks.html') :
			path.join(__dirname, '../chromeApp/webapp/microblocks.html')
	);
};

app.whenReady().then(() => {
	createWindow();

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
