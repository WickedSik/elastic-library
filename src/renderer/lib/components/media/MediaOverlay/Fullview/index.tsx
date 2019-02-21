import React from 'react'
import PropTypes from 'prop-types'

import Image from './Image'
import Video from './Video'
import Document from '../../../Document'

export interface FullviewProps {
    onRequestToggleTimer: () => void
    item: Document
}

export default class Fullview extends React.Component<FullviewProps> {
    render() {
        const { item, onRequestToggleTimer } = this.props

        return (
            <div className={'fullview'}>
                {item.isVideo ? (
                    <Video item={item} onRequestToggleTimer={onRequestToggleTimer} />
                ) : (
                    <Image item={item} onRequestToggleTimer={onRequestToggleTimer} />
                )}
            </div>
        )
    }
}
