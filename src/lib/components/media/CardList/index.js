import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import MediaItem from '../MediaItem'

import './style.scss'

export default class CardList extends React.Component {
    static propTypes = {
        results: PropTypes.array,
        total: PropTypes.number,
        onRequestDelete: PropTypes.func,
        onRequestMore: PropTypes.func
    }

    state = {
        selected: null
    }

    render() {
        const { results, total } = this.props
        const { selected } = this.state

        return (
            <div className={'card-list'}>
                <div className={'grid-x'}>
                    {results && results.map((result, index) => (
                        <div key={result.id} className={'cell small-6 medium-4 large-3'}>
                            <MediaItem
                                item={result}
                                showModal={selected === index}
                                onRequestOpen={() => {
                                    this._go(index)
                                }}
                                onRequestClose={this._deselect}
                                onRequestNext={this._next}
                                onRequestPrev={this._prev}
                                onRequestDelete={this.props.onRequestDelete}
                            />
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

    _next = () => {
        const index = this.state.selected || 0

        if (index + 1 <= this.props.results.length) {
            this.setState({
                selected: index + 1
            })
        }
    }

    _prev = () => {
        const index = this.state.selected || 0

        if (index - 1 >= 0) {
            this.setState({
                selected: index - 1
            })
        }
    }

    _go = (index) => {
        if (index >= 0 && index < this.props.results.length) {
            this.setState({
                selected: index
            })
        }
    }

    _deselect = () => {
        this.setState({
            selected: null
        })
    }
}
