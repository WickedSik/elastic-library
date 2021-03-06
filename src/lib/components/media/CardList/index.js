import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSync } from '@fortawesome/free-solid-svg-icons'

import MediaItem from '../MediaItem'
import MediaDialog from '../MediaDialog'
import MediaOverlay from '../MediaOverlay'

import './style.scss'

library.add(faSync)

export default class CardList extends React.Component {
    static propTypes = {
        onRequestDelete: PropTypes.func.isRequired,
        onRequestMore: PropTypes.func.isRequired,
        onRequestSwitchDialogType: PropTypes.func.isRequired,
        onRequestSelected: PropTypes.func.isRequired,
        onRequestSearch: PropTypes.func.isRequired,
        results: PropTypes.array,
        bulkSelection: PropTypes.array,
        total: PropTypes.number,
        dialogType: PropTypes.string
    }

    static defaultProps = {
        onRequestDelete: () => {},
        onRequestMore: () => {},
        onRequestSwitchDialogType: () => {},
        onRequestSelected: () => {},
        onRequestSearch: () => {}
    }

    state = {
        bulkSelection: [],
        selected: null
    }

    render() {
        const { results, total, bulkSelection } = this.props
        const { selected } = this.state

        return (
            <div className={classnames('card-list', bulkSelection.length > 0 && 'has-bulk-selection')}>
                <div className={'grid-x'}>
                    {results && results.map((result, index) => (
                        <div key={result.id} className={'cell small-6 medium-4 large-3'}>
                            <MediaItem
                                item={result}
                                selected={bulkSelection.indexOf(index) !== -1}
                                onRequestOpen={() => {
                                    this._go(index)
                                }}
                                onRequestSelected={() => {
                                    this.props.onRequestSelected(index)
                                }}
                            />
                        </div>
                    ))}
                    {results && total > results.length && (
                        <div className={'cell small-12'}>
                            <button className={'load-more button'} onClick={this.props.onRequestMore}>
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
        const { selected } = this.state
        const { results, total, dialogType } = this.props

        switch (dialogType) {
            case 'dialog':
                return (
                    <MediaDialog
                        item={results[selected]}
                        position={selected}
                        total={total}
                        onRequestDelete={this.props.onRequestDelete}
                        onRequestOverlay={this.props.onRequestSwitchDialogType}
                        onRequestClose={this._deselect}
                        onRequestNext={this._next}
                        onRequestPrev={this._prev}
                        onRequestSearch={this.props.onRequestSearch}
                    />
                )
            case 'overlay':
                return (
                    <MediaOverlay
                        title={`${selected + 1} / ${total}`}
                        item={results[selected]}
                        onRequestDelete={this.props.onRequestDelete}
                        onRequestOpenDialog={this.props.onRequestSwitchDialogType}
                        onRequestNext={this._next}
                        onRequestPrev={this._prev}
                        onRequestClose={this._deselect}
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
