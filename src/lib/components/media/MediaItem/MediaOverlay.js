import React from 'react'
import PropTypes from 'prop-types'

import Document from '../../Document'

export default class MediaOverlay extends React.Component {
    static propTypes = {
        item: PropTypes.objectOf(Document),
        onClose: PropTypes.func,
        open: PropTypes.bool
    }

    render() {
        const { item } = this.props
        const imageStyle = {
            backgroundImage: `url("${item.url}")`
        }

        return (
            <div className={''}>
                <div
                    className={''}
                    open={this.props.open}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'center'
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'center'
                    }}
                    onClose={this.props.onClose}
                >
                    <div style={imageStyle} onClick={this.props.onClose} className={''} />
                </div>
            </div>
        )
    }
}
