
const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('path')

const appMenuTemplate = require('./app-menu')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit()
}

const createWindow = () => {
  // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 600,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        width: 800,
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

//   ipcMain.handle('dark-mode:toggle', () => {
//     if (nativeTheme.shouldUseDarkColors) {
//       nativeTheme.themeSource = 'light'
//     } else {
//       nativeTheme.themeSource = 'dark'
//     }
//     return nativeTheme.shouldUseDarkColors
//   })

//   ipcMain.handle('dark-mode:system', () => {
//     nativeTheme.themeSource = 'system'
//   })

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.on('main-menu-select', (message) => {
        mainWindow.webContents.send('main-menu-select', message)
    })

    mainWindow.on('main-menu-view', (message) => {
        mainWindow.webContents.send('main-menu-view', message)
    })

    mainWindow.on('main-menu-tools', (message) => {
        mainWindow.webContents.send('main-menu-tools', message)
    })

};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('get-paths', async (event) => {
    return {
        userData: app.getPath('userData')
    }
})


// main
// ipcMain.on('show-context-menu', (event) => {
// //     const template = [
// //         {
// //             label: 'Menu Item 1',
// //             click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
// //         },
// //         { type: 'separator' },
// //         { label: 'Menu Item 2', type: 'checkbox', checked: true }
// //     ]
//     const menu = Menu.buildFromTemplate(appMenuTemplate)
//     // // menu.popup(BrowserWindow.fromWebContents(event.sender))
//     Menu.setApplicationMenu(menu)

// })
