import React from 'react'
import PropTypes from 'prop-types'

import Dialog from '../Dialog'
import { renameKeyword } from '../../../store/modules/search/api'

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

    render() {
        return <Dialog title={'Utilities'} onRequestClose={this.props.onRequestClose} />
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
