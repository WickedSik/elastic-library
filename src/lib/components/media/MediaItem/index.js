import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './style.scss'

export default class MediaItem extends React.Component {
    static propTypes = {
        onRequestOpen: PropTypes.func.isRequired,
        onRequestSelected: PropTypes.func.isRequired,
        selected: PropTypes.bool.isRequired,
        item: PropTypes.object.isRequired
    }

    static defaultProps = {
        onRequestOpen: () => {},
        onRequestSelected: () => {},
        selected: false
    }

    state = {
        forceUpdate: false
    }

    componentWillMount() {
        if (this.props.item && this.props.item.addNotifier) {
            this.props.item.addNotifier(this._forceRerender)
        }
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
                <div className={'img'} style={{backgroundImage: `url("${item.thumb}")`}} />
                <h4>{item.title}</h4>

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
