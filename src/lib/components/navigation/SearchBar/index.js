import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { toggleScreenlock } from '../../../store/modules/dialog/actions'

import './style.scss'

class SearchBar extends React.Component {
    static propTypes = {
        toggleScreenlock: PropTypes.func.isRequired,
        handleSearch: PropTypes.func,
        term: PropTypes.string
    }

    state = {
        value: ''
    }

    componentWillMount() {
        if (this.props.term) {
            this.setState({
                value: this.props.term
            })
        }
    }

    componentWillReceiveProps(props) {
        if (this.props.term === this.state.value) {
            this.setState({
                value: props.term
            })
        } else {
            this.setState({
                value: this.state.value || props.term
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
                        onBlur={() => {
                            this.props.toggleScreenlock(false)
                        }}
                        onFocus={() => {
                            this.props.toggleScreenlock(true)
                        }}
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

export default connect(undefined, { toggleScreenlock })(SearchBar)
