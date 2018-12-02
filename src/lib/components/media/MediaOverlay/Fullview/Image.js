import React from 'react'
import PropTypes from 'prop-types'

export default class Preview extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired
    }

    render() {
        const { item } = this.props

        return (
            <div style={{
                backgroundImage: `url("${item.url}")`
            }} className={'image'} />
        )
    }
}
