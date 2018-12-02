import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVolumeMute, faPause } from '@fortawesome/free-solid-svg-icons'

import KeyCodes from '../../../../constants/KeyCodes'

library.add(faVolumeMute, faPause)

export default class Video extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onRequestToggleTimer: PropTypes.func.isRequired
    }

    state = {
        muted: true,
        paused: false
    }

    componentDidMount() {
        document.addEventListener('keydown', this._handleKeydown, false)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeydown, false)
    }

    render() {
        const { item } = this.props

        return (
            <div className={'video'}>
                {this.state.muted && (
                    <div className={'mute-icon'}>
                        <FontAwesomeIcon icon={['fas', 'volume-mute']} size={'4x'} />
                    </div>
                )}
                {this.state.paused && (
                    <div className={'pause-icon'}>
                        <FontAwesomeIcon icon={['fas', 'pause']} size={'4x'} />
                    </div>
                )}
                <video autoPlay loop ref={r => { this._ref = r }} muted={this.state.muted}>
                    <source src={item.url} type={`video/${item.attributes.file.extension.substring(1)}`} />
                </video>
            </div>
        )
    }

    _handleKeydown = (event) => {
        switch (event.keyCode) {
            case KeyCodes.SPACE:
                event.stopPropagation()
                event.preventDefault()

                this.props.onRequestToggleTimer()
                break
        }

        if (KeyCodes.getCharacterFromCode(event.keyCode) === 'p') {
            this._togglePlay()
        }

        if (KeyCodes.getCharacterFromCode(event.keyCode) === 'm') {
            this._toggleMute()
        }
    }

    _togglePlay = () => {
        if (this._ref.paused) {
            this._ref.play()
            this.setState({ paused: false })
        } else {
            this._ref.pause()
            this.setState({ paused: true })
        }
    }

    _toggleMute = () => {
        this.setState(state => ({
            ...state,
            muted: !state.muted
        }))
    }
}
