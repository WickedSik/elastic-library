import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons'

import { toggleScreenlock } from '../../../store/modules/dialog/actions'

import './style.scss'

library.add(faEdit, faSave)

class InlineEdit extends React.Component {
    static propTypes = {
        toggleScreenlock: PropTypes.func.isRequired,
        onUpdate: PropTypes.func.isRequired,
        value: PropTypes.string
    }

    state = {
        isEditing: false,
        value: ''
    }

    componentWillMount() {
        if (this.props.value) {
            this.setState({
                value: this.props.value
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.value !== prevProps.value) {
            this.setState({ // eslint-disable-line react/no-did-update-set-state
                value: this.props.value
            })
        }
    }

    render() {
        const { isEditing, value } = this.state

        return (
            <div className={'inline-edit'}>
                {!isEditing && (
                    <div className={'grid-x'}>
                        <div className={'cell auto'}>
                            {value}
                        </div>
                        <div className={'cell small-1'}>
                            <button className={'button tiny'} onClick={() => { this.setState({ isEditing: true }) }}>
                                <FontAwesomeIcon icon={['fas', 'edit']} />
                            </button>
                        </div>
                    </div>
                )}
                {isEditing && (
                    <div className={'grid-x'}>
                        <div className={'cell auto'}>
                            <input
                                className={''}
                                value={value}
                                onFocus={() => {
                                    this.props.toggleScreenlock(true)
                                }}
                                onBlur={() => {
                                    this.props.toggleScreenlock(false)
                                }}
                                onChange={event => {
                                    this.setState({ value: event.target.value })
                                }}
                                onKeyPress={event => {
                                    event.stopPropagation()
                                    event.preventDefault()

                                    if (event.key === 'Enter') {
                                        this._handleChange()
                                    }
                                }}
                            />
                        </div>
                        <div className={'cell large-1'}>
                            <button className={'button tiny'} onClick={this._handleChange}>
                                <FontAwesomeIcon icon={['fas', 'save']} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    _handleChange = () => {
        this.setState({
            isEditing: false
        })

        this.props.onUpdate(this.state.value)
    }
}

export default connect(undefined, { toggleScreenlock })(InlineEdit)
