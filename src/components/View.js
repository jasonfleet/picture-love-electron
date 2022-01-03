import React, { useEffect, useLayoutEffect, useReducer, useState } from 'react'
import Image from './Image'
import Logo from './icons/LogoIcon'
import FloatingToolbar from './FloatingToolbar'

const electron = window.electron

const View = (props) => {
    const { visible } = props

    const [focussedFile, setFocussedFile] = useState(null)
    const [fontSize, setFontSize ] = useState(8)
    const [height, setHeight ] = useState(128)
    const [showProperties, setShowProperties] = useState(true)
    const [state, setState] = useState(0)
    const [width, setWidth ] = useState(128)

    const setFilesReducer = (state, message) => {
        switch (message.action) {
            case 'generate-thumbs':
                return state.map(file =>
                    file.thumb === null
                        ? { ...file, thumb: electron.makeThumb(file) }
                        : file
                )
            case 'set':
                return message.files.map(file => { return { ...file, thumb: file.thumb || null }})
            case 'set-thumb':
                return state.map(file => file._ === message.thumb._ ? { ...file, thumb: message.thumb } : file )
            case 'update-thumbs':
                return state.map(file => {
                    if (message.thumbList.length > 0 && message.thumbList[0]._ === file._) {
                        return { ...file, thumb: message.thumbList.shift() }
                    } else {
                        return file
                    }
                })
            default:
                return state
        }
    }

    const setIndexReducer = (state, message) => {
        switch (message.action) {
            case 'set':
                return message.index
            default:
                return state
        }
    }

    const setSelectedListReducer = (state, message) => {
        switch (message.action) {
            case 'all':
                return files.map(file => file._)
            case 'toggle':
                if (state.some(selected => selected === message.object._)) {
                    return state.filter(selected => selected !== message.object._)
                } else {
                    return state.concat(message.object._)
                }
            case 'none':
            default:
                return [];
          }
    }

    const [files, setFiles] = useReducer(setFilesReducer, [])
    const [index, setIndex ] = useReducer(setIndexReducer, null)
    const [selectedList, setSelectedList ] = useReducer(setSelectedListReducer, [])

    const setFilteredReducer = (state, message) => {
        switch (message.action) {
            case 'all':
                return null
            case 'sans-thumb':
                return files.filter(file => file.thumb === null).map(file => file._)
            case 'selected':
                return selectedList
            case 'unselected':
                return selectedList
            case 'none':
            default:
                return files
        }
    }

    const [filtered, setFiltered] = useReducer(setFilteredReducer, null)

    const fetchIndex = () => {
        electron.fetchIndex().then(result => {
            setIndex({ action: 'set', index: result })
            fetchFiles()
        })
    }

    const fetchThumbList = () => {
        electron.fetchThumbList().then(result => {
            setFiles({ action: 'update-thumbs', thumbList: result })
        })
    }

    const fetchFiles = () => {
        electron.fetchFileList('').then(result => {
            setFiles({ action: 'set', files: result })
            fetchThumbList()
        })
    }

    const formattedDate = (seconds) => {
        let d = new Date(seconds * 1000)

        return d.getDate().toString().padStart(2, '0') + '/'
            + (d.getMonth() + 1).toString().padStart(2, '0') + '/'
            + d.getFullYear().toString().padStart(4, '0')
    }

    const isSelected = (file) => {
        return selectedList.some(selected => selected === file._)
    }

    const isVisible = (file) => {
        return filtered === null ? true : filtered.some(filteredFile => filteredFile === file._)
    }

    const registerMainEvents = () => {
        electron.onSelect((message) => {
            switch (message) {
                case 'all':
                    setSelectedList({ action: 'all' })
                    break
                case 'none':
                    setSelectedList({ action: 'none' })
            }
        })
        electron.onView((message) => {
            setFiltered({ action: message })
        })
        electron.onTools((message) => {
            console.log('gete')
            setFiles({ action: 'generate-thumbs' })
        })
    }

    const renderGallery = () => {
        if (state === 0) {
            return <div>waiting...</div>
        }

        if (index === null) {
            return <div>fetching index...</div>
        }

        if (thumbCount === 0) {
            return <div>fetching thumb list...</div>
        }

        return (
            <div className='view-gallery'>
                <div className='view-gallery-items'>
                    {files.map((file, i) =>
                        <Image
                            file={file}
                            fontSize={fontSize}
                            height={height}
                            key={i}
                            onClick={() => selectFile(file)}
                            onMouseEnter={file => setFocussedFile(file)}
                            selected={isSelected(file)}
                            showProperties={showProperties}
                            visible={isVisible(file)}
                            width={width}
                        />
                    )}
                </div>
            </div>
        )
    }

    const renderPropertiesBar = () =>
        <div className='view-properties-bar'>
            <div className='view-properties-bar-props'>
                <div className='long'><Logo  width='104px'/></div>

                {focussedFile !== null
                    ?   <   >
                            <div>{focussedFile.p}/{focussedFile.n}.{focussedFile.e}</div>
                            <div className='separator' />
                            <div>{focussedFile.s} bytes</div>
                            <div className='separator' />
                            <div>{formattedDate(focussedFile.c)}</div>
                            <div className='separator' />
                            <div>{formattedDate(focussedFile.u)}</div>
                            <div className='separator' />
                        </>
                    : <div className='separator' />
                }

                <div>{(index === null ? '0' : files.length) + ' files'}</div>
                <div className='separator' />
                <div>{thumbCount + ' thumbs'}</div>
                <div className='separator' />
                <div>{(selectedList === null ? '0' : selectedList.length) + ' selected'}</div>
                <div className='separator' />
                <div>
                    <label htmlFor='show-properties-checkbox'>Show properties&nbsp;</label>
                </div>
                <div>
                    <input
                        checked={showProperties}
                        id='show-properties-checkbox'
                        onChange={() => setShowProperties(!showProperties)}
                        style={{ transform: 'scale(0.8)', }}
                        type='checkbox'
                    />
                </div>
            </div>
        </div>

    const selectFile = (file) => {
        setSelectedList({ action: 'toggle', object: file })
    }

    const thumbCount = files.filter(file => file.thumb !== null).length

    useEffect(() => {
        if (visible && index === null && state === 0) {
            registerMainEvents()
            fetchIndex()
            setState(1)
        }
    });

    return (
        <div className='view' style={{ display: visible ? 'flex' : 'none' }}>
            <FloatingToolbar />
            {renderGallery()}
            {renderPropertiesBar()}
        </div>
    )
}

export default View
