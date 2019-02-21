import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faVolumeMute, faPause } from '@fortawesome/free-solid-svg-icons'

import KeyCodes from '../../../../constants/KeyCodes'

import { toggleMute } from '../../../../store/modules/player/actions'

library.add(faVolumeMute, faPause)

class Video extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        muted: PropTypes.bool.isRequired,
        onRequestToggleTimer: PropTypes.func.isRequired,
        toggleMute: PropTypes.func.isRequired
    }

    static defaultProps = {
        muted: true
    }

    state = {
        paused: false,
        percentage: 0
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
                {this.props.muted && (
                    <div className={'mute-icon'}>
                        <FontAwesomeIcon icon={['fas', 'volume-mute']} size={'4x'} />
                    </div>
                )}
                {this.state.paused && (
                    <div className={'pause-icon'}>
                        <FontAwesomeIcon icon={['fas', 'pause']} size={'4x'} />
                    </div>
                )}
                <video autoPlay loop ref={r => { this._ref = r }} muted={this.props.muted} onTimeUpdate={this._updateProgress}>
                    <source src={item.url} type={`video/${item.attributes.file.extension.substring(1)}`} />
                </video>
                <div className={'playbar'}>
                    <div className={'bar'} style={{width: `${this.state.percentage}%`}} />
                </div>
            </div>
        )
    }

    _updateProgress = () => {
        const percentage = Math.round((this._ref.currentTime / this._ref.duration) * 100)

        this.setState({
            percentage
        })
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
        this.props.toggleMute()
    }
}

const mapStateToProps = (state, props) => {
    return {
        ...state.player
    }
}

const mapDispatchToProps = {
    toggleMute
}

export default connect(mapStateToProps, mapDispatchToProps)(Video)
