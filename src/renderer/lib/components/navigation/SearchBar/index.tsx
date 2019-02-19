import React from 'react'
import PropTypes from 'prop-types'

import './style.scss'

export interface SearchBarProps {
    handleSearch: (term:string) => void
    term?: string
}
export interface SearchBarState {
    value: string
}

export default class SearchBar extends React.Component<SearchBarProps, SearchBarState> {
    state:SearchBarState = {
        value: ''
    }

    componentWillMount() {
        if (this.props.term) {
            this.setState({
                value: this.props.term
            })
        }
    }

    componentWillReceiveProps(props:SearchBarProps) {
        if (this.props.term === this.state.value) {
            this.setState({
                value: props.term as string
            })
        } else {
            this.setState({
                value: this.state.value || props.term as string
            })
        }
    }

    render() {
        return (
            <div className={'grid-x search-bar'}>
                <div className={'cell auto'}>
                    <input
                        type={'search'}
                        value={this.state.value}
                        onChange={event => this.setState({ value: event.target.value })}
                        onKeyPress={event => {
                            if (event.key === 'Enter') {
                                this.props.handleSearch(this.state.value)
                            }
                        }}
                    />
                </div>
                <div className={'cell small-2 medium-2 large-1'}>
                    <button className={'button'} onClick={() => {
                        this.props.handleSearch(this.state.value)
                    }}>Search</button>
                </div>
            </div>
        )
    }
}
