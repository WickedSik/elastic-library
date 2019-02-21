import React from 'react'
import PropTypes from 'prop-types'

export default class Preview extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onRequestOverlay: PropTypes.func.isRequired
    }

    render() {
        const { item, onRequestOverlay } = this.props

        return (
            <div className={'image'}>
                <img onClick={onRequestOverlay}
                    className={'img'}
                    alt={item.title}
                    src={item.url}
                    onError={() => { this.src = item.thumb }} />
            </div>
        )
    }
}
