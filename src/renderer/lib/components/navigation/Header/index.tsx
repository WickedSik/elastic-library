import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faCogs,
    faAddressCard,
    faImage,
    faSortAmountDown,
    faClock
} from '@fortawesome/free-solid-svg-icons'

import SearchBar from '../SearchBar'
import './style.scss'

library.add(faCogs, faAddressCard, faImage, faSortAmountDown, faClock)

export interface HeaderProps {
    onRequestOpenSettings: () => void
    onRequestSwitchDialogType: () => void
    onRequestSwitchSort: () => void
    onSearch: (term:string) => void
    dialogType?: string
    sort?: any
    term?: string
}

export default class Header extends React.Component<HeaderProps> {
    static defaultProps:HeaderProps = {
        onRequestOpenSettings: () => {},
        onRequestSwitchDialogType: () => {},
        onRequestSwitchSort: () => {},
        onSearch: (term:string) => {}
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
                                <SearchBar term={this.props.term} handleSearch={(x:string) => {
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
                                    <input className={'switch-input'} id={'sorttype'} type={'checkbox'} checked={'_score' in this.props.sort} onChange={this.props.onRequestSwitchSort} />
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