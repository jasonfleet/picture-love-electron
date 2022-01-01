// import { contextBridge, ipcRenderer } from 'electron'
const { contextBridge, ipcRenderer } = require('electron')
const { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } = require('fs');
const { readdir } = require('fs/promises')
const path = require('path');
const { contextIsolated, electron } = require('process');
const sharp = require('sharp');

const settings = {
    albumsFolder: '/albums',
    appFolder: '__pl',
    indexFolder: 'index',
    extensions: [ 'avif', 'dzi', 'jpg', 'jpeg', 'nef', 'png', 'webp', 'tiff' ],
    rootFolder: '/home/jason/Pictures', // '/home/jason/Documents/demo-images',
    thumbsFolder: '/thumbs',
}

const folders = {
    app: path.join(settings.appFolder),
    albums: path.join(settings.appFolder, settings.albumsFolder),
    index: path.join(settings.appFolder, settings.indexFolder),
    thumbs: path.join(settings.appFolder, settings.thumbsFolder),
}

const paths = {
    index: path.join(folders.index, '__index.json'),
    thumb: path.join(folders.index, '__thumbs.json'),
}

const exists = (p) => {
    return existsSync(path.join(settings.rootFolder, p))
}

const fetchFileList = async (root, folder) => {
    if (!folder.endsWith(settings.appFolder)) {
        const rootFolderPath = path.join(root, folder)
        const result = await readdir(rootFolderPath, { withFileTypes: true })

        const files = result.filter(dirent => dirent.isFile()).filter(file => { return settings.extensions.includes(file.name.split('.').pop().toLowerCase()) }).map(file =>
            {
                let stats = statSync(path.join(rootFolderPath, file.name))
                let filenameParts = file.name.split('.')

                return {
                    c: Math.floor(stats.birthtime.getTime() / 1000),    // created (seconds)
                    e: filenameParts.pop(),                             // file extension
                    n: filenameParts.join('.'),                         // name
                    p: folder,                                          // path - relative to root
                    s: stats.size,                                      // size
                    u: Math.floor(stats.ctime.getTime() / 1000),        // last update (seconds)
                }
            }
        )

        const subFolders = result.filter(dirent => dirent.isDirectory()).map(subFolder => path.join(folder, subFolder.name))

        for (let subFolder of subFolders) {
            files.push(await fetchFileList(root, subFolder))
        }

        return files.flat()
    }

    return []
}

const makeFolder = (p) => {
    if (!exists(p)) {
        console.log('makeFolder', p)
        mkdirSync(path.join(settings.rootFolder, p), { recursive: true})
        console.log('makeFolder2', p)
    }
}

const makeFolders = () => {
    Object.values(folders).forEach(folder => {
        makeFolder(folder)
    })
}

const makeIndexes = () => {
    Object.values(paths).forEach(p => {
        if (!exists(p)) {
            let time = Math.floor(new Date().getTime() / 1000)
            writeFile(p, JSON.stringify({ created: time, files: [], updated: time}, { flag: 'w' }))
        }
    })
}

const readFile = (p, enc) => {
    return readFileSync(path.join(settings.rootFolder, p), { encoding: enc || 'utf8' })
}

const registerWindowEvent = (channel, func) => {
    // ipcRenderer.removeAllListeners(channel)
    ipcRenderer.on(channel, (e, message) => func(message))
}

const writeFile = (p, data) => {
    writeFileSync(path.join(settings.rootFolder, p), data)
}

contextBridge.exposeInMainWorld(
    'electron',
    {
        // TODO: validate index
        fetchIndex: async () => {
            return JSON.parse(readFile(paths.index))
        },

        fetchFileList: async (folderPath) => {
            const result = await fetchFileList(settings.rootFolder, folderPath)
            return result
        },

        fetchThumbList: async () => {
            const result = await fetchFileList(path.join(settings.rootFolder, folders.thumbs), '')
            return result
        },

        fetchImage: async (path) => {
            return readFile(path).string('base64')
        },

        fetchThumbImage: async (file) => {
            return readFile(path.join(folders.thumbs, file.p, file.n + '.jpg'), 'base64')
        },

        getRootFolder: () => {
            return settings.rootFolder
        },

        initialize: async () => {
            if (exists('')) {
                makeFolders()
                makeIndexes()
            }

            return true
        },

        makeAlbum: async (name) => {
            let p = path.join(folders.albums, name + '.json')
            let time = Math.floor(new Date().getTime() / 1000)

            writeFile(p, JSON.stringify({ created: time, files: [], name: name, updated: time}, { flag: 'w' }))

            return JSON.parse(readFile(p, { encoding: 'utf8' }))
        },

        makeThumb: async (file) => {
            makeFolder(path.join(folders.thumbs, file.p))

            let source = path.join(settings.rootFolder, file.p, file.n + '.' + file.e)
            let target = path.join(settings.rootFolder, folders.thumbs, file.p, file.n + '.jpg')

            sharp(source)
            .resize({ height: 256, width: 256, fit: 'inside'})
            .jpeg({
                quality: 60,
            })
            .toFile(target, function(err) {
                // Extract a region, resize, then extract from the resized image
                // console.log()
            });

            return target
        },

        hasAlbumsFolder: async () => {
            return exists(folders.albums)
        },

        hasAppFolder: async () => {
            return exists(folders.app)
        },

        hasIndex: async () => {
            return exists(paths.index)
        },

        hasThumbsFolder: async () => {
            return exists(folders.thumbs)
        },

        hasRootFolder: async () => {
            return exists('')
        },

        onSelect: (func) => {
            registerWindowEvent('main-menu-select', func)
        },

        onThumb: (func) =>  {
            registerWindowEvent('main-menu-thumb', func)
        },

        onView: (func) => {
            registerWindowEvent('main-menu-view', func)
        },

        // toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
        // system: () => ipcRenderer.invoke('dark-mode:system')
    }
)
