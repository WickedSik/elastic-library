import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './style.scss'

export default class MediaItem extends React.Component {
    static propTypes = {
        onRequestOpen: PropTypes.func.isRequired,
        item: PropTypes.object.isRequired
    }

    static defaultProps = {
        onRequestOpen: () => {}
    }

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

    render() {
        const { item } = this.props
        const icon = item.attributes.favorite
            ? <FontAwesomeIcon icon={['fas', 'heart']} />
            : <FontAwesomeIcon icon={['far', 'heart']} />

        return (
            <div className={'media-item'} onClick={this.props.onRequestOpen}>
                <div className={'img'} style={{backgroundImage: `url("${item.thumb}")`}} />
                <h4>{item.title}</h4>
                <span className={classnames('icon', item.attributes.favorite && 'is-favorited')} onClick={event => {
                    event.stopPropagation()
                    event.preventDefault()

                    this._setFavorite()
                }}>{icon}</span>
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
}
