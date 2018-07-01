import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './style.scss'

export default class InlineEdit extends React.Component {
    static propTypes = {
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

    render() {
        const { isEditing, value } = this.state

        return (
            <div className={'inline-edit'}>
                {!isEditing && (
                    <div className={'grid-x'}>
                        <div className={'cell auto'}>
                            {value}
                        </div>
                        <div className={'cell large-1'}>
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
                                onChange={event => { this.setState({ value: event.target.value }) }}
                                onKeyPress={event => {
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
