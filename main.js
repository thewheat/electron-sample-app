const { app, BrowserWindow } = require('electron')
const { clipboard } = require('electron')

const { Menu, Tray } = require('electron')
const path = require('path')

const { screen } = require('electron')
const { ipcMain } = require('electron')
const { globalShortcut } = require('electron')

const SETTINGS_KEY = "SETTINGS";
const Store = require('electron-store');
const store = new Store();

let appIcon = null
let currentWindow = null;
let settingsWindow = null;

function createWindow() {
  const win = new BrowserWindow({
    icon: getAppIcon(),
    x: screen.x/2,
    y: screen.y/2,
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'index-preload.js')
    }
  })

  win.loadFile('index.html')
  currentWindow = win;
  setTimeout(function(){
    currentWindow.send('message-from-main', "Window created. Initial data to send over from main.js to index")
  }, 300);

  win.on('close', function(){
    currentWindow = null;
  })
}

function createSettingsWindow () {
  if (settingsWindow != null){
    settingsWindow.show();
    return;
  }
  const win = new BrowserWindow({
    icon: getAppIcon(),
    modal: true,
    parent: currentWindow,
    minWidth: 100,
    minHeight: 100,
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'settings-preload.js')
    }
  })

  win.loadFile('settings.html')
  settingsWindow = win;
  win.on('close', function(){
    settingsWindow = null;
  })
}

app.whenReady().then(() => {
  let settings = getSavedSettings();
  createWindow();
  createTrayIcon(settings);
  createDockIcon(settings);
  registerShortcuts(settings);


  // Mac specific https://www.electronjs.org/docs/latest/api/app#event-activate-macos
  // if window closed, open app on clicking dock icon 
  app.on('activate', function () {
    if (currentWindow == null) createWindow();
  })
  // Mac specific https://www.electronjs.org/docs/latest/api/app#event-did-become-active-macos
  // if window closed, open app on switching to app via app switcher
  app.on('did-become-active', function () {
    if (currentWindow == null) createWindow();
  })
})

function getAppIcon(){
  const iconName = 'assets/appIcon.png'
  return path.join(__dirname, iconName)
}

function createDockIcon(settings){
  if(!app.dock) return;

  app.dock.setIcon(getAppIcon());
  if(settings['hide-dock-icon']) app.dock.hide(); 
}

function createTrayIcon(settings) {
  if(settings['hide-tray-icon']) return;

  const iconName = 'assets/trayIcon.png'
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)

  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        toggleWindowBasedOnFocus(true);
      }
    },
    {
      label: 'Settings',
      click: () => {
        createSettingsWindow();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ])

  appIcon.setToolTip('Electron Demo in the tray.')
  appIcon.setContextMenu(contextMenu)
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  if (appIcon) appIcon.destroy()
  unregisterShortcuts();
})

function registerShortcuts(settings){
  try{
    if (settings['shortcut-toggle']) {
      globalShortcut.register(settings['shortcut-toggle'], () => {
        toggleWindowBasedOnFocus();
      })
    }
    return true;
  }catch(err){
    console.log("err", err);
    return false;
  }
}

function unregisterShortcuts(){
  globalShortcut.unregisterAll();
}

function refreshShortcuts(){
  unregisterShortcuts();
  return registerShortcuts(getSavedSettings());
}

function getSavedSettings(){
  let rawSettings = store.get(SETTINGS_KEY);
  let jsonSettings;
  try{
    jsonSettings = JSON.parse(rawSettings);
  }
  catch(err){
    jsonSettings = {};
  }
  return jsonSettings;
}

function saveSettings(settings){
  store.set(SETTINGS_KEY, settings);
}

ipcMain.on('settings-get', (event) => {
  event.returnValue = getSavedSettings();
});

ipcMain.on('settings-set', (event, settings) => {
  saveSettings(settings);
});

ipcMain.on('settings-close', (event, settings) => {
  settingsWindow.close();
});

ipcMain.on('settings-set-and-refresh-shortcuts', (event, settings) => {
  saveSettings(settings);
  refreshShortcuts();
});

function toggleWindowBasedOnFocus(show){
  if (currentWindow == null) {
    createWindow();
    return;
  }

  if(typeof(show) === "undefined" || show == null)
  {
    if(!currentWindow.isFocused()) {
      currentWindow.show();
      currentWindow.send('message-from-main', "Window brought back to focus")
    }
    else{
      currentWindow.hide();
    }    
  }
  else {
    if(show) {
      if(!currentWindow.isFocused())
        currentWindow.send('message-from-main', "Window brought back to focus")
      else
        currentWindow.send('message-from-main', "Window forced to show")
      currentWindow.show();
    }
    else {
      currentWindow.hide();
    }
  }

}

ipcMain.on('app-window-hide', (event) => {
  toggleWindowBasedOnFocus(false);
});

ipcMain.on('app-window-show', (event) => {
  toggleWindowBasedOnFocus(true);
});

ipcMain.on('app-window-showSettings', (event) => {
  createSettingsWindow();
});

ipcMain.on('app-sending-data', (event, value) => {
  currentWindow.send('data-from-main', {"text": "main.js received data: ", "data": value});
});
