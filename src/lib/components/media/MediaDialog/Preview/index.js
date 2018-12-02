import React from 'react'
import PropTypes from 'prop-types'

import Image from './Image'
import Video from './Video'

export default class Preview extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onRequestOverlay: PropTypes.func.isRequired
    }

    render() {
        const { item, onRequestOverlay } = this.props

        return (
            <div className={'preview'}>
                {item.isVideo ? (
                    <Video item={item} onRequestOverlay={onRequestOverlay} />
                ) : (
                    <Image item={item} onRequestOverlay={onRequestOverlay} />
                )}
            </div>
        )
    }
}
