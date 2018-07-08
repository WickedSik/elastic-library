import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import MediaItem from '../MediaItem'
import MediaDialog from '../MediaDialog'
import MediaOverlay from '../MediaOverlay'

import './style.scss'

export default class CardList extends React.Component {
    static propTypes = {
        results: PropTypes.array,
        total: PropTypes.number,
        onRequestDelete: PropTypes.func,
        onRequestMore: PropTypes.func
    }

    state = {
        selected: null,
        dialogType: 'dialog'
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
                                onRequestOpen={() => {
                                    this._go(index)
                                }}
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
                {selected !== null && this.props.results[selected] && this._buildDialog()}
            </div>
        )
    }

    _buildDialog = () => {
        const { selected, dialogType } = this.state
        const { results, total } = this.props

        switch (dialogType) {
        case 'dialog':
            return (
                <MediaDialog
                    item={results[selected]}
                    onRequestDelete={this.props.onRequestDelete}
                    onRequestOverlay={() => {
                        this.setState({
                            dialogType: 'overlay'
                        })
                    }}
                    onRequestClose={this._deselect}
                    onRequestNext={this._next}
                    onRequestPrev={this._prev}
                />
            )
        case 'overlay':
            return (
                <MediaOverlay
                    title={`${selected + 1} / ${total}`}
                    item={results[selected]}
                    onRequestDelete={this.props.onRequestDelete}
                    onRequestNext={this._next}
                    onRequestPrev={this._prev}
                    onRequestClose={() => {
                        this.setState({
                            dialogType: 'dialog'
                        })
                    }}
                />
            )
        }
    }

    _next = () => {
        const index = this.state.selected || 0

        if (index + 1 < this.props.total) {
            this._go(index + 1)
        }
    }

    _prev = () => {
        const index = this.state.selected || 0

        if (index - 1 >= 0) {
            this._go(index - 1)
        }
    }

    _go = (index) => {
        if (index >= 0 && index < this.props.results.length) {
            if (index === this.props.results.length - 1) {
                // Request more data on last index
                this.props.onRequestMore()
            }

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
