import React, { useEffect, useLayoutEffect, useReducer, useState } from 'react'
import Image from './Image'
import Logo from './Logo'

const electron = window.electron

const View = (props) => {
    const { visible } = props
    const [fontSize, setFontSize ] = useState(8)
    const [height, setHeight ] = useState(128)
    // const [index, setIndex ] = useState(null)
    const [showProperties, setShowProperties] = useState(true)
    const [selectAll, setSelectAll] = useState(false)
    const [state, setState] = useState(0)
    const [thumbList, setThumbList ] = useState(null)
    const [width, setWidth ] = useState(128)

    const fetchIndex = () => {
        electron.fetchIndex().then(result => {
            setIndex(result)
            fillIndex()
        })
    }

    const fetchThumbList = () => {
        electron.fetchThumbList().then(result => {
            setThumbList(result)
        })
    }

    const fillIndex = () => {
        electron.fetchFileList('').then(result => {
            setIndex({
                ...index,
                files: result
            })

            fetchThumbList()
        })
    }

    const isSelected = (file) => {
        const onSelectedList = selectedList.some(selected => selected.n === file.n && selected.p === file.p && selected.e === file.e)

        // return selectAll && !onSelectedList
        //  || selectedList.some(selected => selected.n === file.n && selected.p === file.p && selected.e === file.e)

        return onSelectedList
    }

    const makeThumbs = () => {
        for (let file of index.files) {
            electron.makeThumb(file).then(result => { console.log(result); fetchThumbList() })
        }
    }

    const registerWindowEvents = () => {
        electron.onSelect((message) => {
            switch (message) {
                case 'all':
                    setSelectedList({ action: 'all' })
                    break
                case 'none':
                    setSelectedList({ action: 'none' })
            }
        })
        electron.onThumb((message) => {
            switch (message) {
                case 'generate-missing':
                    makeThumbs()
            }
        })
    }

    const renderGallery = () => {
        if (state === 0) {
            return <div>waiting...</div>
        }

        if (index === null) {
            return <div>fetching index...</div>
        }

        if (thumbList === null) {
            return <div>fetching thumb list...</div>
        }

        return (
            <div className='view-gallery'>
                <div className='view-gallery-items'>
                    {index.files.map((file, i) =>
                        <Image
                            file={file}
                            fontSize={fontSize}
                            hasThumb={thumbList.some(thumb => thumb.n === file.n && thumb.p === file.p && thumb.e === file.e)}
                            height={height}
                            key={i}
                            onClick={() => selectFile(file)}
                            selected={isSelected(file)}
                            showProperties={showProperties}
                            width={width}
                        />
                    )}
                </div>
            </div>
        )
    }

    const renderPropertiesBar = () =>
        <div className='view-properties-bar'>
            <div className='long'><Logo  width='104px'/></div>
            <div className='separator' />
            <div>{index === null ? '0' : index.files.length + ' files'}</div>
            <div className='separator' />
            <div>{thumbList === null ? '0' : thumbList.length + ' thumbs'}</div>
            <div className='separator' />
            <div>{selectedList === null ? '0' : selectedList.length + ' selected'}</div>
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

    const selectFile = (file) => {
        setSelectedList({ action: 'toggle', object: file })
    }

    function setIndexReducer (state, action) {
        return action
    }

    function setSelectedListReducer (state, message) {
        switch (message.action) {
            case 'all':
                return index.files;
            case 'toggle':
                if (state.some(selected => selected.n === message.object.n && selected.p === message.object.p && selected.e === message.object.e)) {
                    return state.filter(selectedFile => selectedFile.n !== message.object.n || selectedFile.p !== message.object.p || selectedFile.e !== message.object.e)
                } else {
                    return state.concat(message.object)
                }
            case 'none':
            default:
                return [];
          }
    }

    const [index, setIndex ] = useReducer(setIndexReducer, null)
    const [selectedList, setSelectedList ] = useReducer(setSelectedListReducer, [])

    useEffect(() => {
        if (visible && index === null && state === 0) {
            registerWindowEvents()
            fetchIndex()
            setState(1)
        }
    });

    return (
        <div className='view' style={{ display: visible ? 'flex' : 'none' }}>
            {renderGallery()}
            {renderPropertiesBar()}
            {/* <div style={{ position: 'fixed', right: '0' }}><button onClick={(e) => fetchList() }>Refresh</button></div>
             */}
        </div>
    )
}

export default View
