import React from 'react'
import PropTypes from 'prop-types'

export default class Preview extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onRequestOverlay: PropTypes.func.isRequired
    }

    state = {
        url: this.props.item.url
    }

    render() {
        const { item, onRequestOverlay } = this.props
        const { url } = this.state

        return (
            <div className={'image'}>
                <img onClick={onRequestOverlay}
                    className={'img'}
                    alt={item.title}
                    src={url}
                    onError={this._onError} />
            </div>
        )
    }

    _onError = () => {
        console.warn('-- failed to load', this.state.url)

        this.setState({
            url: this.props.item.thumb
        })
    }
}
