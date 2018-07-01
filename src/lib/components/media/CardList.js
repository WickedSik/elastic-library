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
            <div className={'card-list'}>
                <div className={'grid-x'}>
                    {results && results.map(result => (
                        <div key={result.id} className={'cell small-6 medium-4 large-3'}>
                            <MediaItem item={result} onDelete={this.props.onDelete} />
                        </div>
                    ))}
                    {results && total > results.length && (
                        <div className={'cell small-6 medium-4 large-3'}>
                            <button onClick={this.props.onRequestMore}>
                                <span />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
