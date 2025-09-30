const { app, ipcMain, BrowserWindow, Menu, MenuItem } = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}

async function showConnectionMenu(portList, callback) {
	function usbSelected(menuItem, window, event) {
		console.log("selected", menuItem.label, menuItem.id);
		callback(menuItem.id);
	}

console.log("portlist", portList);
	const myMenu = new Menu();
	for (var i = 0; i < portList.length; i++) {
		var fullName = portList[i].displayName + ' (' + portList[i].portName + ')';
		myMenu.append(new MenuItem({label: fullName, click: usbSelected, id: portList[i].portId}));
	}
	myMenu.popup();
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true, // to allow require
			//contextIsolation: false, // allow use with Electron 12+
			preload: path.join(__dirname, 'preload.js'),
		}
	});

	mainWindow.webContents.session.setPermissionCheckHandler(
		(webContents, permission, requestingOrigin, details) => {
			return (permission === 'serial');
		}
	);

	mainWindow.webContents.session.setDevicePermissionHandler((details) => {
		return (details.deviceType === 'serial');
	});

	// Force-quit electron when window is closed (needed on MacOS).
	mainWindow.on('close', (e) => {
		app.exit();
	});

	mainWindow.webContents.session.on(
		'select-serial-port',
		(event, portList, webContents, callback) => {
			event.preventDefault();
			showConnectionMenu(portList, callback);
	});

	let selectBluetoothCallback;

	mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
		event.preventDefault();
		selectBluetoothCallback = callback;
		showConnectionMenu(deviceList, callback);
	});

	ipcMain.on('cancel-bluetooth-request', (event) => {
		selectBluetoothCallback('');
	});

	// open devTools when in dev mode
	if (!app.isPackaged) { mainWindow.webContents.openDevTools(); }

	mainWindow.loadFile(path.join(__dirname, '../../chromeApp/webapp/microblocks.html'));
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
