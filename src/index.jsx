import React from 'react'
import * as ReactDOM from 'react-dom'

import PictureLoveApp from './PictureLoveApp';

function render() {
    ReactDOM.render(
        <PictureLoveApp />,
        document.getElementById('app')
    )
}

render();
