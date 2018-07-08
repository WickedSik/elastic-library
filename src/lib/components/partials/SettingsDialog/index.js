import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import { renameKeyword } from '../../../redux/api/search'

import './style.scss'

export default class SettingsDialog extends React.Component {
    static propTypes = {
        onRequestClose: PropTypes.func.isRequired
    }

    static defaultProps = {
        onRequestClose: () => {}
    }

    state = {
        pending: false,
        success: false,
        error: null
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
        return ReactDOM.createPortal(
            <div className={classnames('settings-dialog', 'lib-dialog', 'open')} onClick={this.props.onRequestClose}>
                <div className={'settings-dialog-content lib-dialog-content'} onClick={this._killPropagation}>
                    <button className={'close-button'} onClick={this.props.onRequestClose}>
                        <span aria-hidden={'true'}>&times;</span>
                    </button>

                    <h1>Utilities</h1>
                    <div className={'content'}>
                        {/* Content */}
                    </div>
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

    _renameTag = (oldTag, newTag) => {
        renameKeyword(oldTag, newTag)
            .then(() => {
                this.setState({
                    pending: false,
                    success: true
                })
            }).catch(error => {
                this.setState({
                    pending: false,
                    success: false,
                    error
                })
            })
    }
}
