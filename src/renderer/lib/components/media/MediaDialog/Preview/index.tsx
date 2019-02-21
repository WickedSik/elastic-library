import React from 'react'
import PropTypes from 'prop-types'

import Image from './Image'
import Video from './Video'
import Document from '../../../Document'

export interface PreviewProps {
    onRequestOverlay: () => void
    item: Document
}

export default class Preview extends React.Component<PreviewProps> {
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
