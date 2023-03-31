const { contextBridge } = require('electron')
const { ipcRenderer } = require('electron');
 
contextBridge.exposeInMainWorld('appWindow', {
  hide: () => {
    ipcRenderer.send('app-window-hide');
  },
  showSettings: () => {
    ipcRenderer.send('app-window-showSettings');
  },
  sendData: (value) => {
    ipcRenderer.send('app-sending-data', value);
  },
  receiveDataString: (value) => {
    ipcRenderer.on('message-from-main', value);
  },
  receiveData: (value) => {
    ipcRenderer.on('data-from-main', value);
  },
})