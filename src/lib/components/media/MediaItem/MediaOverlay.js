import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

export default class MediaOverlay extends React.Component {
    static propTypes = {
        item: PropTypes.object,
        onClose: PropTypes.func,
        open: PropTypes.bool
    }

    render() {
        const { item } = this.props
        const imageStyle = {
            backgroundImage: `url("${item.url}")`
        }

        return (
            <div className={classnames('media-item-overlay', this.props.open && 'open')}>
                <div style={imageStyle} onClick={this.props.onClose} className={'image'} />
            </div>
        )
    }
}
