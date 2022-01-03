import React, { useEffect, useState } from 'react'
import NoThumb from './icons/NoThumbIcon'

const electron = window.electron

const Image = (props) => {
    const { file, height, onClick, onMouseEnter, selected, showProperties, visible, width } = props
    // c - created (seconds)
    // e - file extension
    // n - name
    // p - path - relative to root
    // s - size
    // u - last update (seconds)
    const { c, e, n, p, s, u } = file

    const [hoverStartTime, setHoverStartTime ] = useState(null)
    const [imageSource, setImageSource ] = useState(null)
    const [state, setState ] = useState(0)

    const fetchThumbImage = () => {
        electron.fetchThumbImage(file).then(result => {
            setState(2)
            setImageSource(result)
        })
    }

    const makeThumbImage = () => {
        electron.makeThumb(file).then(result => {
            fetchThumbImage()
        })
    }

    const renderProperties = () => {
        return showProperties
            ?   <div className='view-image-properties'>
                    <div>{file.n}.{file.e}</div>
                    <div>{file._}</div>
                </div>
            : <></>
    }

    const renderThumbImage = () => {
        if (file.thumb !== null) {
            if (imageSource === null) {
                fetchThumbImage()
            } else {
                return <img src={'data:image;base64,' + imageSource} style={{ height: '100%', width: '100%',  objectFit: 'contain' }} />
            }
        }

        return <div><NoThumb /></div>
    }

    return visible
        ?   <div
                className='view-gallery-item'
                onClick={() => onClick()}
                onMouseEnter={() => onMouseEnter(file)}
                style={{
                    borderColor: selected ? 'orange' : '#676767',
                    height: (height + 4) + 'px',
                    width: (width + 4) + 'px',
                }}
            >
                <div className='view-gallery-item-wrapper'>
                    {renderThumbImage()}
                    {renderProperties()}
                </div>
            </div>
        : <></>

}

export default Image
