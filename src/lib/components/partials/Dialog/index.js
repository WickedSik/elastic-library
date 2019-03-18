import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './style.scss'

export default class SettingsDialog extends React.Component {
    static propTypes = {
        onRequestClose: PropTypes.func.isRequired,
        className: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        killPropagation: PropTypes.bool.isRequired,
        children: PropTypes.node,
        footer: PropTypes.node,
        other: PropTypes.node
    }

    static defaultProps = {
        onRequestClose: () => {},
        className: 'dialog',
        killPropagation: false
    }

    constructor(props) {
        super(props)

        this.el = document.createElement('div')
    }

    componentWillMount() {
        document.body.appendChild(this.el)
    }

    componentDidMount() {
        document.addEventListener('keydown', this._closeIfEscape, false)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._closeIfEscape, false)
        document.body.removeChild(this.el)
    }

    render() {
        const { className } = this.props

        return ReactDOM.createPortal(
            <div className={classnames(className, 'lib-dialog', 'open')} onClick={this.props.onRequestClose}>
                <div className={classnames(`${className}-content`, 'lib-dialog-content', this.props.footer && 'has-footer')} onClick={this._killPropagation}>
                    <button className={'close-button'} onClick={this.props.onRequestClose}>
                        <span aria-hidden={'true'}>&times;</span>
                    </button>

                    {this.props.other}

                    <h1>{this.props.title}</h1>
                    <div className={'content'}>
                        {this.props.children}
                    </div>

                    {this.props.footer && (
                        <div className={'footer'}>
                            {this.props.footer}
                        </div>
                    )}
                </div>
            </div>
            , this.el
        )
    }

    _closeIfEscape = (event) => {
        if (event.keyCode === 27) {
            this.props.onRequestClose()
        }
    }

    _killPropagation = (eve) => {
        if (this.props.killPropagation) {
            eve.stopPropagation()
            eve.preventDefault()

            return false
        }
    }
}
