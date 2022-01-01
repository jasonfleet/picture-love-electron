import React from 'react'

const Settings = (props) => {
    const { visible } = props


    return (
        <div className='settings' style={{ display: visible ? 'flex' : 'none' }} >
            <div style={{ width: '100%', }}><h1>Settings</h1></div>

            <div className='property-header'>Thumbs</div>

            <div className='property'>Border:</div>
            <div className='value'>1px<br/>2px</div>

            <div className='property'>Size:</div>
            <div className='value'>100 x 100<br/>255 x 255</div>

        </div>
    )
}

export default Settings
