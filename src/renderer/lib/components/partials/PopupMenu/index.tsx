import React, { ReactNode } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './style.scss'

type OptionShape = {
    disabled?: boolean
    content: ReactNode
    onClick: () => void
}

export interface PopupMenuProps {
    label: ReactNode | string
    options: OptionShape[]
    buttonClassName?:string
    className?:string
}

export interface PopupMenuState {
    active: boolean
}

export default class PopupMenu extends React.Component<PopupMenuProps, PopupMenuState> {
    state:PopupMenuState = {
        active: false
    }

    render() {
        return (
            <div className={classnames('popup-menu', this.props.className)}>
                <button className={classnames('button', this.props.buttonClassName)} onClick={this._toggleMenu}>{this.props.label}</button>
                <div className={classnames('popup-menu-options', 'button-group', this.state.active && 'active')}>
                    {this.props.options.map((option, index) => (
                        <div key={`option-${index}`} className={'item'}>
                            <button className={'button clear cell auto no-padding'} onClick={() => {
                                this.setState({ active: false })
                                option.onClick()
                            }} disabled={option.disabled}>
                                {option.content}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    _toggleMenu = (event:React.MouseEvent) => {
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }

        this.setState(state => ({
            active: !state.active
        }))
    }
}
