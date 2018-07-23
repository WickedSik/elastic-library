import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import KeyCodes from '../../../constants/KeyCodes'

import './style.scss'

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
        if (this.props.item && this.props.item.addNotifier) {
            this.props.item.addNotifier({
                fire: () => {
                    // changing state actually rerenders the component!
                    this.setState({
                        forceUpdate: !this.state.forceUpdate
                    })
                }
            })
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this._handleKeydown, false)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeydown, false)
        this._stopTimer()
    }

    render() {
        const { item, title } = this.props
        const imageStyle = {
            backgroundImage: `url("${item.url}")`
        }

        return (
            <div className={classnames('media-item-overlay', 'open')}>
                <div style={imageStyle} className={'image'} />

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
                                <button className={'button'} onClick={this.props.onRequestOpenDialog}>
                                    <FontAwesomeIcon icon={['fas', 'address-card']} />
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
        this.setState({
            forceUpdate: !this.state.forceUpdate
        })

        this.props.item.attributes.favorite = !this.props.item.attributes.favorite
        this.props.item.update()
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
