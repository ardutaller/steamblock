const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
	cancelBluetoothRequest: () => ipcRenderer.send('cancel-bluetooth-request'),
	bluetoothPairingRequest: (callback) => ipcRenderer.on('bluetooth-pairing-request', () => callback()),
	bluetoothPairingResponse: (response) => ipcRenderer.send('bluetooth-pairing-response', response),
	openFile: () => ipcRenderer.invoke('dialog:openFile'),
	saveFile: (suggestedName, isBinary, data) => ipcRenderer.invoke('dialog:saveFile', suggestedName, isBinary, data)
})
