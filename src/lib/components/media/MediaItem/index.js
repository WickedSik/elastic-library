import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './style.scss'

import MediaDialog from './MediaDialog'
import MediaOverlay from './MediaOverlay'

export default class MediaItem extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        showModal: PropTypes.bool.isRequired,
        onRequestOpen: PropTypes.func,
        onRequestClose: PropTypes.func,
        onRequestNext: PropTypes.func,
        onRequestPrev: PropTypes.func,
        onRequestDelete: PropTypes.func
    }

    static defaultProps = {
        showModal: false,
        onRequestOpen: () => {},
        onRequestClose: () => {},
        onRequestNext: () => {},
        onRequestPrev: () => {},
        onRequestDelete: () => {}
    }

    state = {
        overlayOpen: false,
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

    render() {
        const { item } = this.props
        const icon = item.attributes.favorite
            ? <FontAwesomeIcon icon={['fas', 'heart']} />
            : <FontAwesomeIcon icon={['far', 'heart']} />

        return (
            <div className={'media-item'} onClick={this._handleOpen}>
                <div className={'img'} style={{backgroundImage: `url("${item.thumb}")`}} />
                <h4>{item.title}</h4>
                <span className={classnames('icon', item.attributes.favorite && 'is-favorited')} onClick={event => {
                    event.stopPropagation()
                    event.preventDefault()

                    this._setFavorite()
                }}>{icon}</span>
                <MediaDialog
                    open={this.props.showModal}
                    item={this.props.item}
                    onRequestOverlay={this._handleOverlayOpen}
                    onRequestFavorite={this._setFavorite}
                    onRequestDelete={this.props.onRequestDelete}
                    onRequestClose={this._handleClose}
                    onRequestNext={this.props.onRequestNext}
                    onRequestPrev={this.props.onRequestPrev}
                />
                <MediaOverlay
                    item={this.props.item}
                    open={this.state.overlayOpen}
                    onClose={this._handleOverlayClose}
                />
            </div>
        )
    }

    _setFavorite = () => {
        this.setState({
            forceUpdate: !this.state.forceUpdate
        })

        this.props.item.attributes.favorite = !this.props.item.attributes.favorite
        this.props.item.update()
    }

    _handleOpen = (eve) => {
        eve.stopPropagation()
        eve.preventDefault()

        this.props.onRequestOpen()
    }

    _handleClose = (eve) => {
        eve.stopPropagation()
        eve.preventDefault()

        this.props.onRequestClose()
    }

    _handleOverlayOpen = (eve) => {
        eve.stopPropagation()
        eve.preventDefault()

        this.setState({
            overlayOpen: true
        })
    }

    _handleOverlayClose = (eve) => {
        eve.stopPropagation()
        eve.preventDefault()

        this.setState({
            overlayOpen: false
        })
    }
}
