import React from 'react'
import PropTypes from 'prop-types'
import SideNav from './SideNav'
import SearchBar from './SearchBar'

export default class Header extends React.Component {
    static propTypes = {
        onSearch: PropTypes.func.isRequired,
        term: PropTypes.string.isRequired
    }

    state = {
        open: false
    }

    render() {
        const { term } = this.props

        return (
            <div className={''}>
                <div position='fixed'>
                    <div>
                        <button className={''} color='inherit' aria-label='Menu' onClick={this._toggleDrawer}>
                            <span className={'fa fa-hamburger'} />
                        </button>
                        <h1 variant='title' color='inherit' className={''}>
                            Media Library
                        </h1>
                        <SearchBar term={term} handleSearch={x => {
                            this.setState({ open: false })
                            this.props.onSearch(x)
                        }} />
                    </div>
                </div>
                <SideNav open={this.state.open}
                    onClose={() => {
                        this.setState({ open: false })
                    }}
                    onSearch={x => {
                        this.setState({ open: false })
                        this.props.onSearch(x)
                    }} />
            </div>
        )
    }

    _toggleDrawer = () => {
        this.setState({
            open: !this.state.open
        })
    }
}
