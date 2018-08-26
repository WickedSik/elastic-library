import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import SearchBar from '../SearchBar'
import './style.scss'

export default class Header extends React.Component {
    static propTypes = {
        onRequestOpenSettings: PropTypes.func.isRequired,
        onRequestSwitchDialogType: PropTypes.func.isRequired,
        onRequestSwitchSort: PropTypes.func.isRequired,
        onSearch: PropTypes.func.isRequired,
        dialogType: PropTypes.string.isRequired,
        sort: PropTypes.string.isRequired,
        term: PropTypes.string.isRequired
    }

    static defaultProps = {
        onRequestOpenSettings: () => {},
        onRequestSwitchDialogType: () => {},
        onRequestSwitchSort: () => {},
        onSearch: () => {}
    }

    render() {
        return (
            <div className={'header'} data-sticky-container>
                <div className={'title-bar'} data-sticky data-options={'marginTop:0;'}>
                    <div className={'title-bar-left'}>
                        <div className={'menu-icon'} data-toggle={'offCanvas'} />
                        <div className={'settings-icon'} onClick={this.props.onRequestOpenSettings}>
                            <FontAwesomeIcon icon={['fas', 'cogs']} color={'inherit'} />
                        </div>
                        <span className={'title-bar-title'}>Media Library</span>
                    </div>
                    <div className={'top-bar-right'}>
                        <div className={'grid-x'}>
                            <div className={'cell auto'}>
                                <SearchBar term={this.props.term} handleSearch={x => {
                                    this.props.onSearch(x)
                                }} />
                            </div>
                            <div className={'cell small-1'}>
                                <div className={'switch large'}>
                                    <input className={'switch-input'} id={'dialogtype'} type={'checkbox'} checked={this.props.dialogType === 'dialog'} onChange={this.props.onRequestSwitchDialogType} />
                                    <label className={'switch-paddle'} htmlFor={'dialogtype'}>
                                        <span className={'show-for-sr'}>Dialog Type</span>
                                        <span className={'switch-active'} aria-hidden={'true'}>
                                            <FontAwesomeIcon icon={['fas', 'address-card']} fixedWidth />
                                        </span>
                                        <span className={'switch-inactive'} aria-hidden={'true'}>
                                            <FontAwesomeIcon icon={['fas', 'image']} fixedWidth />
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div className={'cell small-1'}>
                                <div className={'switch large'}>
                                    <input className={'switch-input'} id={'sorttype'} type={'checkbox'} checked={this.props.sort === 'file.updated_at'} onChange={this.props.onRequestSwitchSort} />
                                    <label className={'switch-paddle'} htmlFor={'sorttype'}>
                                        <span className={'show-for-sr'}>Sort</span>
                                        <span className={'switch-active'} aria-hidden={'true'}>
                                            <FontAwesomeIcon icon={['fas', 'sort-amount-down']} fixedWidth />
                                        </span>
                                        <span className={'switch-inactive'} aria-hidden={'true'}>
                                            <FontAwesomeIcon icon={['fas', 'clock']} fixedWidth />
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
