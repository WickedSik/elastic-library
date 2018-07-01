import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import MediaItem from '../MediaItem'

import './style.scss'

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
                        <div className={'cell small-12'}>
                            <button className={'add-more button'} onClick={this.props.onRequestMore}>
                                <FontAwesomeIcon icon={['fas', 'sync']} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}
