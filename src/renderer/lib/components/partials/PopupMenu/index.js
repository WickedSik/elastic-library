import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './style.scss'

export default class PopupMenu extends React.Component {
    static propTypes = {
        label: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.string
        ]).isRequired,
        options: PropTypes.arrayOf(PropTypes.shape({
            content: PropTypes.node.isRequired,
            onClick: PropTypes.func.isRequired
        })).isRequired,
        buttonClassName: PropTypes.string,
        className: PropTypes.string
    }

    state = {
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

    _toggleMenu = (event) => {
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }

        this.setState(state => ({
            active: !state.active
        }))
    }
}
