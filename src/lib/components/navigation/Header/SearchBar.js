import React from 'react'
import PropTypes from 'prop-types'

export default class SearchBar extends React.Component {
    static propTypes = {
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
            <div className={'grid-x'}>
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
