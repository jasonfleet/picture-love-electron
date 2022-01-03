// import { contextBridge, ipcRenderer } from 'electron'
const { createHash } = require('crypto');
const { contextBridge, ipcRenderer } = require('electron')
const { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } = require('fs');
const { readdir } = require('fs/promises')
const path = require('path');
const sharp = require('sharp');

let appPaths = { userData: '' }

const settings = {
    albumsFolder: '/albums',
    appFolder: '__pl',
    indexFolder: 'index',
    extensions: [ 'avif', 'dzi', 'jpg', 'jpeg', 'nef', 'png', 'webp', 'tiff' ],
    rootFolder: '/home/jason/Pictures',
    // rootFolder: '/home/jason/Documents/demo-images',
    thumbsFolder: '/thumbs',
}

const folders = {
    app: path.join(settings.appFolder),
    albums: path.join(settings.appFolder, settings.albumsFolder),
    index: path.join(settings.appFolder, settings.indexFolder),
    thumbs: path.join(settings.appFolder, settings.thumbsFolder),
}

const hash = createHash('md5')

const indexPaths = {
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
                return makeFileObject(file, folder, rootFolderPath)
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

const makeConfig = () => {
    const configPath = path.join(appPaths.userData, 'user.settings.json')

    if (!existsSync(configPath)) {
        let time = Math.floor(new Date().getTime() / 1000)

        writeFileSync(configPath, JSON.stringify({
            created: time, files: [], updated: time,
            thumbs: {
                showProperties: true,
                size: '100x100'
            }
        }), { flag: 'w' })
    }
}

const makeFileObject = (file, folder, rootFolderPath) => {
    let stats = statSync(path.join(rootFolderPath, file.name))
    let filenameParts = file.name.split('.')

    let ext = filenameParts.pop()
    let filename = filenameParts.join('.')

    let md5 = hash.copy().update(folder + '/' + filename).digest('hex')

    return {
        _: md5,
        c: Math.floor(stats.birthtime.getTime() / 1000),    // created (seconds)
        e: ext,                                             // file extension
        n: filename,                                        // name
        p: folder,                                          // path - relative to root
        s: stats.size,                                      // size
        u: Math.floor(stats.ctime.getTime() / 1000),        // last update (seconds)
    }
}

const makeFolder = (p) => {
    if (!exists(p)) {
        mkdirSync(path.join(settings.rootFolder, p), { recursive: true})
    }
}

const makeFolders = () => {
    Object.values(folders).forEach(folder => {
        makeFolder(folder)
    })
}

const makeIndexes = () => {
    Object.values(indexPaths).forEach(p => {
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
    ipcRenderer.on(channel, (e, message) => func(message))
}

const writeFile = (p, data) => {
    writeFileSync(path.join(settings.rootFolder, p), data)
}

contextBridge.exposeInMainWorld(
    'electron',
    {
        fetchConfig: async () => {
            return JSON.parse(readFile(appPaths.userData))
        },

        // TODO: validate index
        fetchIndex: async () => {
            return JSON.parse(readFile(indexPaths.index))
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
            console.log('fetchImage', path)

            return await readFile(path).string('base64')
        },

        fetchThumbImage: async (file) => {
            const result = readFile(path.join(folders.thumbs, file.p, file.n + '.jpg'), 'base64')

            return result
        },

        getRootFolder: () => {
            return settings.rootFolder
        },

        initialize: async () => {
            if (exists('')) {
                makeFolders()
                makeIndexes()
                makeConfig();
            }

            return true
        },

        makeAlbum: async (name) => {
            let p = path.join(folders.albums, name + '.json')
            let time = Math.floor(new Date().getTime() / 1000)

            writeFile(p, JSON.stringify({ created: time, files: [], name: name, updated: time}, { flag: 'w' }))

            return JSON.parse(readFile(p, { encoding: 'utf8' }))
        },

        makeThumb: (file) => {
            makeFolder(path.join(folders.thumbs, file.p))

            let source = path.join(settings.rootFolder, file.p, file.n + '.' + file.e)
            let target = path.join(settings.rootFolder, folders.thumbs, file.p, file.n + '.jpg')

            console.log(source, target)

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

        hasConfig: async () => {
            const configPath = path.join(appPaths.userData, 'user.settings.json')
            return existsSync(configPath)
        },

        hasIndex: async () => {
            return exists(indexPaths.index)
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

        onTools: (func) => {
            registerWindowEvent('main-menu-tools', func)
        },

        // toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
        // system: () => ipcRenderer.invoke('dark-mode:system')
    }
)

ipcRenderer.invoke('get-paths').then(result => appPaths = { ...appPaths, ...result })
