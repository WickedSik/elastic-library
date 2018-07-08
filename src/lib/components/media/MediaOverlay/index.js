import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './style.scss'

export default class MediaOverlay extends React.Component {
    static propTypes = {
        onRequestClose: PropTypes.func.isRequired,
        onRequestDelete: PropTypes.func.isRequired,
        onRequestNext: PropTypes.func.isRequired,
        onRequestPrev: PropTypes.func.isRequired,
        title: PropTypes.string,
        item: PropTypes.object
    }

    static defaultProps = {
        onRequestClose: () => {},
        onRequestDelete: () => {},
        onRequestNext: () => {},
        onRequestPrev: () => {}
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
        const { item, title } = this.props
        const imageStyle = {
            backgroundImage: `url("${item.url}")`
        }

        return (
            <div className={classnames('media-item-overlay', 'open')}>
                <div style={imageStyle} className={'image'} />

                <button className={'next-button'} onClick={this.props.onRequestNext}>
                    <FontAwesomeIcon icon={['fas', 'caret-right']} fixedWidth />
                </button>

                <button className={'prev-button'} onClick={this.props.onRequestPrev}>
                    <FontAwesomeIcon icon={['fas', 'caret-left']} fixedWidth />
                </button>

                <div className={'controls'}>
                    <div className={'grid-x'}>
                        <div className={'title cell small-6'}>
                            <h4>{title}</h4>
                        </div>
                        <button className={'button clear cell small-2'} onClick={this._setFavorite}>
                            <FontAwesomeIcon icon={[item.attributes.favorite ? 'fas' : 'far', 'heart']} />
                        </button>
                        <button className={'button clear cell small-2'} onClick={() => { this.props.onRequestDelete(item.id) }}>
                            <FontAwesomeIcon icon={['fas', 'trash']} />
                        </button>
                        <button className={'button clear cell small-2'} onClick={this.props.onRequestClose}>
                            <FontAwesomeIcon icon={['fas', 'times']} />
                        </button>
                    </div>
                </div>
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
