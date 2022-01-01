import React, { useEffect, useState } from 'react'

const electron = window.electron

const Image = (props) => {
    const { onClick, file, hasThumb, height, selected, showProperties, width } = props
    // c - created (seconds)
    // e - file extension
    // n - name
    // p - path - relative to root
    // s - size
    // u - last update (seconds)
    const { c, e, n, p, s, u } = file

    const [imageSource, setImageSource ] = useState(null)
    const [state, setState ] = useState(0)

    const fetchThumbImage = () => {
        electron.fetchThumbImage(file).then(result => {
            setState(2)
            console.log('fetchThumbImage', result.length)
            setImageSource(result)
        })
    }

    const image = () => {
        if (hasThumb) {
            if (imageSource === null) {
                fetchThumbImage()
            } else {
                return {backgroundImage: 'URL(data:image;base64,' + imageSource + ')',}
            }
        }

        return {}
    }

    const makeThumbImage = () => {
        electron.makeThumb(file).then(result => {
            fetchThumbImage()
        })
    }

    // const onClick = () => {
    //     if (hasThumb()) {
    //         fetchThumbImage(file)
    //     } else {
    //         makeThumbImage()
    //     }
    // }

    const renderProperties = () => {
        return showProperties
            ?   <div className='view-image-properties'>
                    <div>{file.p}/{file.n}.{file.e}</div>
                    {hasThumb
                        ? <div>has thumb</div>
                        : <div>no thumb</div>
                    }
                </div>
            : <></>
    }

    return (
        <div
            className='view-image-thumb'
            onClick={() => onClick()}
            style={{
                ...image(),
                ...{
                    borderColor: selected ? 'orange' : '#676767',
                    height: (height + 4) + 'px',
                    width: (width + 4) + 'px',
                }
            }}
        >
            {renderProperties()}
        </div>
    )

}

export default Image
