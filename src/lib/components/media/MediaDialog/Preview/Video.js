import React from 'react'
import PropTypes from 'prop-types'

export default class Video extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired
    }

    render() {
        const { item } = this.props

        return (
            <div className={'video'}>
                <video controls>
                    <source src={item.url} type={`video/${item.attributes.file.extension.substring(1)}`} />
                </video>
            </div>
        )
    }
}
