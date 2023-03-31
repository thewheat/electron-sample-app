# Sample Electron app

https://www.electronjs.org

## Features
- Global shortcut to toggle window
- Tray icon with menu
- Storing simple data
- Ability to enable/disable tray and dock icons
- [Preload scripts](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload) to allow frontend Javascript code to access backend Node.js features
- [Inter-Process Communication](https://www.electronjs.org/docs/latest/tutorial/ipc) between Electron backend Node.js process in `main.js` and web front end code in `index-renderer.js` / `settings-renderer.js` to pass data


## File Breakdown
- `main.js`
   - backend Electron process that runs Node.js and can access OS level functions
- `index.html`
   - main app that opens on start up (this page) runs regular web code i.e. HTML, CSS, Javscript
- `index-renderer.js`
   - Javascript for main app (can be shared with a traditional web app)
- `index-preload.js`
   - Bridging functions to allow frontend Javscript `index-renderer.js` and backend `main.js` to interact through Inter-Process Communication
- `settings.html`
   - settings page
- `settings-renderer.js`
   - Javascript for settings page
- `settings-preload.js`
   - Bridging functions to allow frontend Javscript `settings-renderer.js` and backend `main.js` to interact through Inter-Process Communication
- `assets/appIcon.png`
   - icon to for the app in the app switcher and dock
- `assets/trayIcon.png`
   - icon to show in the system tray
