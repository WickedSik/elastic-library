import React from 'react'
import PropTypes from 'prop-types'

export default class Video extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onRequestOverlay: PropTypes.func.isRequired
    }

    render() {
        const { item, onRequestOverlay } = this.props

        return (
            <div className={'video'}>
                <video muted loop autoPlay playsInline onClick={onRequestOverlay}>
                    <source src={item.url} type={`video/${item.attributes.file.extension.substring(1)}`} />
                </video>
            </div>
        )
    }
}
