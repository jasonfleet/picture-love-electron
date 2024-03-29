import React from 'react'

const Menu = (props) => {
    const { width } = props

    return (
        <svg style={{ height: '24px', width: '12px'}} viewBox="0 0 12 20" fill="#000000" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
    )
}

export default Menu
