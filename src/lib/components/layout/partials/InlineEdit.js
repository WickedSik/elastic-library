import React from 'react'
import PropTypes from 'prop-types'

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
            <div className={''}>
                {!isEditing && (
                    <div container className={''}>
                        <div item xs={10} className={''}>
                            {value}
                        </div>
                        <div item xs={2} className={''}>
                            <button mini className={''} onClick={() => { this.setState({ isEditing: true }) }}>
                                <span className={'fa fa-pencil'} />
                            </button>
                        </div>
                    </div>
                )}
                {isEditing && (
                    <div container className={''}>
                        <div item xs={10} className={''}>
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
                        <div item xs={2} className={''}>
                            <button mini className={''} onClick={this._handleChange}>
                                <span className={'fa fa-save'} />
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
