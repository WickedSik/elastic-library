import React from 'react'
import PropTypes from 'prop-types'

import Image from './Image'
import Video from './Video'

export default class Preview extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onRequestToggleTimer: PropTypes.func.isRequired
    }

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
