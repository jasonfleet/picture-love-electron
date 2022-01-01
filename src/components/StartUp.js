import React, { useEffect, useState } from 'react'
import Logo from './Logo'

const electron = window.electron

const StartUp = (props) => {
    const { album, setMode, visible } = props

    const [hasAlbumsFolder, setHasAlbumsFolder] = useState(null)
    const [hasAppFolder, setHasAppFolder] = useState(null)
    const [hasIndex, setHasIndex] = useState(null)
    const [hasRootFolder, setHasRootFolder] = useState(null)
    const [hasThumbsFolder, setHasThumbsFolder] = useState(null)
    const [rootFolder, setRootFolder] = useState('')
    const [state, setState] = useState(0)

    const fetchSettings = () => {
        setRootFolder(electron.getRootFolder())

        electron.hasAlbumsFolder().then(result => setHasAlbumsFolder(result))
        electron.hasAppFolder().then(result => setHasAppFolder(result))
        electron.hasIndex().then(result => setHasIndex(result))
        electron.hasRootFolder().then(result => setHasRootFolder(result))
        electron.hasThumbsFolder().then(result => setHasThumbsFolder(result))
    }

    const show = () => {
        electron.fetchIndex().then(result => setMode('view'))
    }

    const initialize = () => {
        electron.initialize().then(result => fetchSettings())
    }

    useEffect(() => {
        if (album === null && state === 0) {
            setState(1)
            fetchSettings()
        }
    });

    return (
        <div className='startup' style={{ display: visible ? 'flex' : 'none' }}>

            <div className='startup-logo'>
                <Logo />
            </div>

            <div><hr/><br/></div>
            <div>
                Has root folder: {hasRootFolder === null ? '?' : hasRootFolder ? 'Yes' : 'No'}
            </div>
            <div>
                Has app folder: {hasAppFolder === null ? '?' : hasAppFolder ? 'Yes' : 'No' }
            </div>
            <div>
                Has index: {hasIndex === null ? '?' : hasIndex ? 'Yes' : 'No'}
            </div>
            <div>
                Has thumbs folder: {hasThumbsFolder === null ? '?' : hasThumbsFolder ? 'Yes' : 'No'}
            </div>
            <div>
                Has albums folder: {hasAlbumsFolder === null ? '?' : hasAlbumsFolder ? 'Yes' : 'No'}
            </div>

            <div><br/></div>

            {!hasRootFolder
                ? <><div>The root folder</div><div>{rootFolder}</div><div>is needed to continue.</div></>
                : !hasAlbumsFolder || !hasAppFolder || !hasIndex || !hasThumbsFolder
                    ? <div><button onClick={() => initialize()}>initialize</button></div>
                    : <div><button onClick={() => show()}>show</button></div>
            }
        </div>
    )
}
export default StartUp
