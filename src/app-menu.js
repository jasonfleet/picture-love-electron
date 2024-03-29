const { app, Menu } = require('electron')

const isMac = false // process.platform === 'darwin'

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
        { type: 'separator' },
        ...(isMac ? [
            { role: 'pasteAndMatchStyle' },
            { label: 'Select All', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-select', 'all') },
            { type: 'separator' },
            { label: 'Select None', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-select', 'none') },
            {
            label: 'Speech',
            submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
            ]
            }
        ] : [
            { label: 'Select All', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-select', 'all') },
            { label: 'Select None', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-select', 'none') },
        ])
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { label: 'All', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-view', 'all') },
            { label: 'Selected', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-view', 'selected') },
            { label: 'Un Selected', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-view', 'unselected') },
            { type: 'separator' },
            {
                label: 'Filter',
                submenu: [
                    { label: 'Sans Thumbs', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-view', 'sans-thumb') }
                ]
            },

            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { label: 'Gallery', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-view', 'gallery') },
            { label: 'Settings', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-view', 'settings') },
            { type: 'separator' },
            { role: 'togglefullscreen' },
            { type: 'separator' },
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
        ]
    },


    {
        label: 'Tools',
        submenu: [
            { label: 'Generate Thumbs', click: (menuItem, browserWindow, event) => browserWindow.emit('main-menu-tools', 'generate-thumbs') },
        ]
    },

    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
        ] : [
            { role: 'close' }
        ])
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://electronjs.org')
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
