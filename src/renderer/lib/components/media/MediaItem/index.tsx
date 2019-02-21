import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart, faCheckSquare, faVideo, faFilm } from '@fortawesome/free-solid-svg-icons'
import {
    faHeart as faRegularHeart,
    faCheckSquare as faRegularCheckSquare
} from '@fortawesome/free-regular-svg-icons'

import './style.scss'
import Document from '../../Document'

library.add(
    faHeart,
    faRegularHeart,
    faCheckSquare,
    faRegularCheckSquare,
    faVideo,
    faFilm
)

interface MediaItemProps {
    onRequestOpen: () => void,
    onRequestSelected: () => void,
    selected: boolean,
    item: Document
}

interface MediaItemState {
    forceUpdate: boolean
}

export default class MediaItem extends React.Component<MediaItemProps, MediaItemState> {
    _mounted:boolean = false

    static defaultProps = {
        onRequestOpen: () => {},
        onRequestSelected: () => {},
        selected: false
    }

    state = {
        forceUpdate: false
    }

    componentWillMount() {
        if (this.props.item && this.props.item.on) {
            this.props.item.on('update', this._forceRerender)
        }
    }

    componentDidMount() {
        this._mounted = true
    }

    componentWillUnmount() {
        this._mounted = false
    }

    render() {
        const { item, selected } = this.props
        const favoriteIcon = item.attributes.favorite
            ? <FontAwesomeIcon icon={['fas', 'heart']} size={'2x'} />
            : <FontAwesomeIcon icon={['far', 'heart']} size={'2x'} />
        const selectedIcon = selected
            ? <FontAwesomeIcon icon={['fas', 'check-square']} size={'2x'} />
            : <FontAwesomeIcon icon={['far', 'check-square']} size={'2x'} />

        return (
            <div className={'media-item'} onClick={this.props.onRequestOpen}>
                {item.isVideo && (
                    <div className={'is-video-icon'}>
                        <FontAwesomeIcon icon={['fas', 'video']} />
                    </div>
                )}
                {item.attributes.file.extension === '.gif' && (
                    <div className={'is-gif-icon'}>
                        <FontAwesomeIcon icon={['fas', 'film']} />
                    </div>
                )}

                <div className={'img'} style={{backgroundImage: `url("${item.thumb}")`}} />
                <h4>{item.title}</h4>

                {item.attributes.image && item.attributes.image.palette && (
                    <ul className={'palette'}>
                        {Object.keys(item.attributes.image.palette).map(key => (
                            <li key={key} title={`${key} (${item.attributes.image.palette[key]})`} style={{backgroundColor: item.attributes.image.palette[key]}} />
                        ))}
                    </ul>
                )}

                <span className={classnames('icon', 'select-icon', selected && 'is-selected')} onClick={event => {
                    event.stopPropagation()
                    event.preventDefault()

                    this.props.onRequestSelected()
                }}>{selectedIcon}</span>

                <span className={classnames('icon', 'favorite-icon', item.attributes.favorite && 'is-favorited')} onClick={event => {
                    event.stopPropagation()
                    event.preventDefault()

                    this._setFavorite()
                }}>{favoriteIcon}</span>
            </div>
        )
    }

    _forceRerender = () => {
        if (!this._mounted) {
            this.props.item && this.props.item.off && this.props.item.off('update', this._forceRerender)
            return
        }

        console.info('-- media-item:force-rerender')

        this.setState(state => ({
            forceUpdate: !state.forceUpdate
        }))
    }

    _setFavorite = () => {
        this.setState({
            forceUpdate: !this.state.forceUpdate
        })

        this.props.item.attributes.favorite = !this.props.item.attributes.favorite
        this.props.item.update()
    }
}
