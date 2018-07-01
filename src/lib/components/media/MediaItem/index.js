import React from 'react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './style.scss'

import MediaDialog from './MediaDialog'
// import MediaOverlay from './MediaOverlay'

export default class MediaItem extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onDelete: PropTypes.func
    }

    state = {
        open: false,
        overlayOpen: false,
        forceUpdate: false
    }

    componentWillMount() {
        if (this.props.item && this.props.item.addNotifier) {
            this.props.item.addNotifier({
                fire: () => {
                    // changing state actually rerenders the component!
                    this.setState({
                        forceUpdate: true
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
                <span className={'icon'} onClick={event => {
                    event.stopPropagation()
                    event.preventDefault()

                    this._setFavorite()
                }}>{icon}</span>
                <MediaDialog
                    open={this.state.open}
                    item={this.props.item}
                    onRequestFavorite={this._setFavorite}
                    onDelete={this.props.onDelete}
                    onRequestClose={this._handleClose}
                />
                {/* <MediaOverlay
                    item={this.props.item}
                    open={this.state.overlayOpen}
                    onClose={() => this.setState({ overlayOpen: false })}
                /> */}
            </div>
        )
    }

    _setFavorite = () => {
        this.setState({
            forceUpdate: false // reset state
        })

        this.props.item.attributes.favorite = !this.props.item.attributes.favorite
        this.props.item.update()
    }

    _handleOpen = (eve) => {
        console.info('-- media-item:open')

        eve.stopPropagation()
        eve.preventDefault()

        this.setState({
            open: true
        })
    }

    _handleClose = (eve) => {
        console.info('-- media-item:close')

        eve.stopPropagation()
        eve.preventDefault()

        this.setState({
            open: false
        })
    }
}
