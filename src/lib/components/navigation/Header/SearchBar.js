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
            <ul className={'menu'}>
                <li>
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
                </li>
                <li>
                    <button className={'button'} onClick={() => {
                        this.props.handleSearch(this.state.value)
                    }}>Search</button>
                </li>
            </ul>
        )
    }
}
