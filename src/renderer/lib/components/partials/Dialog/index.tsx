import React, { ReactNode } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './style.scss'

export interface DialogProps {
    onRequestClose: () => void
    className: string
    title: string
    killPropagation: boolean
    children?: ReactNode
    footer?: ReactNode
    other?: ReactNode
}

export default class Dialog extends React.Component<DialogProps> {
    static defaultProps:DialogProps = {
        onRequestClose: () => {},
        className: 'dialog',
        killPropagation: false,
        title: 'Dialog'
    }

    el:HTMLElement

    constructor(props:DialogProps) {
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

    _requestClose = ():void => {
        this.props.onRequestClose()
    }

    _closeIfEscape = ():void => {
        if ((event as KeyboardEvent).keyCode === 27) {
            this.props.onRequestClose()
        }
    }

    _killPropagation = (eve:React.MouseEvent):boolean => {
        if (this.props.killPropagation) {
            eve.stopPropagation()
            eve.preventDefault()

            return false
        }
        return true
    }
}
