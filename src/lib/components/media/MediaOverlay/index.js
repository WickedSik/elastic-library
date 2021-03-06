import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faVolumeMute,
    faCaretRight,
    faCaretLeft,
    faHeart,
    faClock,
    faAddressCard,
    faTrash,
    faTimes,
    faTags
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faRegularHeart } from '@fortawesome/free-regular-svg-icons'

import KeyCodes from '../../../constants/KeyCodes'
import Fullview from './Fullview'

import './style.scss'

library.add(
    faVolumeMute,
    faCaretLeft,
    faCaretRight,
    faHeart,
    faRegularHeart,
    faClock,
    faAddressCard,
    faTimes,
    faTrash,
    faTags
)

export default class MediaOverlay extends React.Component {
    static propTypes = {
        onRequestOpenDialog: PropTypes.func.isRequired,
        onRequestClose: PropTypes.func.isRequired,
        onRequestDelete: PropTypes.func.isRequired,
        onRequestNext: PropTypes.func.isRequired,
        onRequestPrev: PropTypes.func.isRequired,
        title: PropTypes.string,
        item: PropTypes.object
    }

    static defaultProps = {
        onRequestOpenDialog: () => {},
        onRequestClose: () => {},
        onRequestDelete: () => {},
        onRequestNext: () => {},
        onRequestPrev: () => {}
    }

    __timer = null

    state = {
        forceUpdate: false
    }

    componentWillMount() {
        if (this.props.item && this.props.item.on) {
            this.props.item.on('update', this._forceRerender)
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this._handleKeydown, false)
        this._mounted = true
    }

    componentWillUnmount() {
        this._mounted = false
        document.removeEventListener('keydown', this._handleKeydown, false)
        this._stopTimer()
    }

    render() {
        const { item, title } = this.props

        return (
            <div className={classnames('media-item-overlay', 'open')}>
                <Fullview key={item.id} item={item} onRequestToggleTimer={this._toggleTimer} />

                <button className={'next-button'} onClick={this._requestNext}>
                    <FontAwesomeIcon icon={['fas', 'caret-right']} fixedWidth />
                </button>

                <button className={'prev-button'} onClick={this._requestPrev}>
                    <FontAwesomeIcon icon={['fas', 'caret-left']} fixedWidth />
                </button>

                <div className={'controls'}>
                    <div className={'grid-x align-top'}>
                        <div className={'title cell auto'}>
                            <h4>{title}</h4>
                        </div>
                        <div className={'cell auto'}>
                            <div className={'button-group'}>
                                <button className={'button'} onClick={this._setFavorite}>
                                    <FontAwesomeIcon icon={[item.attributes.favorite ? 'fas' : 'far', 'heart']} color={item.attributes.favorite ? 'red' : 'white'} />
                                </button>
                                <button className={'button'} onClick={this._toggleTimer}>
                                    <FontAwesomeIcon icon={['fas', 'clock']} color={this.__timer ? 'red' : 'white'} />
                                </button>
                                <button className={'button button-with-text'} onClick={this.props.onRequestOpenDialog}>
                                    {item.attributes.keywords.length}
                                    <FontAwesomeIcon icon={['fas', 'tags']} />
                                </button>
                                <button className={'button'} onClick={() => { this.props.onRequestDelete(item.id) }}>
                                    <FontAwesomeIcon icon={['fas', 'trash']} />
                                </button>
                                <button className={'button'} onClick={this._requestClose}>
                                    <FontAwesomeIcon icon={['fas', 'times']} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    _forceRerender = () => {
        if (!this._mounted) {
            this.props.item && this.props.item.off && this.props.item.off('update', this._forceRerender)
            return
        }

        console.info('-- media-overyaly:force-rerender')

        this.setState(state => ({
            forceUpdate: !state.forceUpdate
        }))
    }

    _requestNext = () => {
        if (this.__timer) {
            this._stopTimer()
            this._startTimer()
        }
        this.props.onRequestNext()
    }

    _requestPrev = () => {
        if (this.__timer) {
            this._stopTimer()
            this._startTimer()
        }
        this.props.onRequestPrev()
    }

    _requestClose = () => {
        this._stopTimer()
        this.props.onRequestClose()
    }

    _setFavorite = () => {
        this.props.item.attributes.favorite = !this.props.item.attributes.favorite
        this.props.item.update()

        this.setState({
            forceUpdate: !this.state.forceUpdate
        })
    }

    _handleKeydown = (event) => {
        switch (event.keyCode) {
            case KeyCodes.ESCAPE:
                this._requestClose()
                break
            case KeyCodes.ARROW_LEFT:
                this._requestPrev()
                break
            case KeyCodes.ARROW_RIGHT:
                this._requestNext()
                break
        }

        if (KeyCodes.getCharacterFromCode(event.keyCode) === 'l') {
            this._setFavorite()
        }
    }

    _toggleTimer = () => {
        if (this.__timer) {
            this._stopTimer()
        } else {
            this._startTimer()
        }
        this.setState({
            forceUpdate: !this.state.forceUpdate
        })
    }

    _startTimer = () => {
        if (!this.__timer) {
            this.__timer = setInterval(this.props.onRequestNext, 5000)
        }
    }

    _stopTimer = () => {
        if (this.__timer) {
            clearInterval(this.__timer)
            this.__timer = null
        }
    }
}
