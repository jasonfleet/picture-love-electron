import React, { useEffect, useState } from 'react'
import View from './components/View'
import Settings from './components/Settings'
import StartUp from './components/StartUp'

const electron = window.electron

const PictureLoveApp = (props) => {

    const [album, setAlbum] = useState(null)
    const [settings, setSettings ] = useState([])
    const [mode, setMode ] = useState('startUp')
    const [state, setState] = useState(0)

    const registerMainEvents = () => {
        electron.onView((message) => {
            switch (message) {
                case 'gallery':
                    setMode('view')
                    break
                case 'settings':
                    setMode('settings')
            }
        })
    }

    useEffect(() => {
        if (state === 0) {
            registerMainEvents()
            setState(1)
        }
    });

    return (
        <>
            <Settings album={album} setMode={(mode) => setMode(mode)} visible={mode === 'settings'} />
            <StartUp album={album} setMode={(mode) => setMode(mode)} visible={mode === 'startUp'} />
            <View album={album} setMode={(mode) => setMode(mode)} visible={mode === 'view'} />
        </>
    )
}

export default PictureLoveApp
