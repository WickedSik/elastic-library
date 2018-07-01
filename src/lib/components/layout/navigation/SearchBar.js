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
        const { handleSearch } = this.props

        return (
            <div>
                <form className={''}>
                    <input
                        id='search-field'
                        type='text'
                        value={this.state.value}
                        onChange={event => this.setState({ value: event.target.value })}
                        onKeyPress={event => {
                            if (event.key === 'Enter') {
                                handleSearch(this.state.value)
                            }
                        }}
                        className={''}
                        endAdornment={
                            <span position='end' color='inherit'>
                                <button
                                    onClick={() => {
                                        this.props.handleSearch(this.state.value)
                                    }}
                                    onMouseDown={() => {
                                        this.props.handleSearch(this.state.value)
                                    }}
                                    color='inherit'
                                >
                                    <span className={'fa fa-search'} />
                                </button>
                            </span>
                        }
                    />
                </form>
            </div>
        )
    }
}
