import React from 'react'
import PropTypes from 'prop-types'

import SearchBar from './SearchBar'
import './style.scss'

export default class Header extends React.Component {
    static propTypes = {
        onSearch: PropTypes.func.isRequired,
        term: PropTypes.string.isRequired,
        offCanvasId: PropTypes.string.isRequired
    }

    render() {
        return (
            <div className={'header'} data-sticky-container>
                <div className={'title-bar'} data-sticky data-options={'marginTop:0;'}>
                    <div className={'title-bar-left'}>
                        <button className={'menu-icon'} type={'button'} data-open={this.props.offCanvasId} />
                        <span className={'title-bar-title'}>Media Library</span>
                    </div>
                    <div className={'top-bar-right'}>
                        <SearchBar term={this.props.term} handleSearch={x => {
                            this.props.onSearch(x)
                        }} />
                    </div>
                </div>
            </div>
        )
    }
}
