import React from 'react'
import PropTypes from 'prop-types'

import KeyCodes from '../../../../constants/KeyCodes'
import { FullviewProps } from './index'

export default class Preview extends React.Component<FullviewProps> {
    componentDidMount() {
        document.addEventListener('keydown', this._handleKeydown, false)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeydown, false)
    }

    render() {
        const { item } = this.props

        return (
            <div style={{
                backgroundImage: `url("${item.url}")`
            }} className={'image'} />
        )
    }

    _handleKeydown = (event:KeyboardEvent) => {
        switch (event.keyCode) {
            case KeyCodes.SPACE:
                event.stopPropagation()
                event.preventDefault()

                this.props.onRequestToggleTimer()
                break
        }
    }
}
