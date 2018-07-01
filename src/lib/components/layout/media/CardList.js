import React from 'react'
import PropTypes from 'prop-types'

import MediaItem from './MediaItem'

export default class CardList extends React.Component {
    static propTypes = {
        results: PropTypes.array,
        total: PropTypes.number,
        onDelete: PropTypes.func,
        onRequestMore: PropTypes.func
    }

    render() {
        const { results, total } = this.props

        return (
            <div className={''}>
                <div container spacing={24}>
                    {results && results.map(result => (
                        <div key={result.id} item xs={4} md={3} lg={2}>
                            <MediaItem item={result} onDelete={this.props.onDelete} />
                        </div>
                    ))}
                    {results && total > results.length && (
                        <div item xs={4} md={3} lg={2}>
                            <button className={''} onClick={this.props.onRequestMore}>
                                <span />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
