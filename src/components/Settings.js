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
            <div className='value'>
                <div><input type='checkbox' id='size-100x100' /> <label htmlFor='size-100x100'>100 x 100</label></div>
                <div><input type='checkbox' id='size-128x128' /> <label htmlFor='size-128x128'>128 x 128</label></div>
                <div><input type='checkbox' id='size-255x255' /> <label htmlFor='size-255x255'>255 x 255</label></div>
            </div>

        </div>
    )
}

export default Settings
