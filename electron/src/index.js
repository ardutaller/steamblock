const { app, BrowserWindow } = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	mainWindow.webContents.session.setPermissionCheckHandler(
		(webContents, permission, requestingOrigin, details) => {
			return (permission === 'serial');
		}
	);

	mainWindow.webContents.session.setDevicePermissionHandler((details) => {
		return (details.deviceType === 'serial');
	});
	

	mainWindow.webContents.session.on(
		'select-serial-port',
		(event, portList, webContents, callback) => {
			event.preventDefault();
			console.log(portList);
			const selectedPort = portList.find((device) => {
				return device;
			})
			if (!selectedPort) {
				callback('');
			} else {
				callback(selectedPort.portId);
			}
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
