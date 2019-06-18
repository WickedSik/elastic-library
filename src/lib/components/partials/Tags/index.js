import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { sprintf } from 'sprintf-js'
import { toggleScreenlock } from '../../../store/modules/dialog/actions'

class Tags extends React.PureComponent {
    static propTypes = {
        toggleScreenlock: PropTypes.func.isRequired,
        onRequestDelete: PropTypes.func.isRequired,
        onRequestSelect: PropTypes.func.isRequired,
        onRequestAddTag: PropTypes.func.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string).isRequired,
        titleFormat: PropTypes.string.isRequired
    }

    static defaultProps = {
        onRequestAddTag: () => {},
        onRequestDelete: () => {},
        onRequestSelect: () => {},
        tags: [],
        titleFormat: '%s'
    }

    state = {
        newKeyword: ''
    }

    render() {
        const { tags, titleFormat } = this.props

        return (
            <div className={'tags'}>
                {tags.map(tag => {
                    return (
                        <div className={'label'} key={`${tag}`} title={sprintf(titleFormat, tag)}>
                            <div className={'closer'} onClick={() => {
                                this.props.onRequestDelete(tag)
                            }}>
                                <FontAwesomeIcon icon={['fas', 'times']} />
                            </div>
                            <span onClick={() => {
                                this.props.onRequestSelect(tag)
                            }}>{tag}</span>
                        </div>
                    )
                })}
                <input value={this.state.newKeyword}
                    placeholder={'Add (+ enter)'}
                    onBlur={() => {
                        this.props.toggleScreenlock(false)
                    }}
                    onFocus={() => {
                        this.props.toggleScreenlock(false)
                    }}
                    onChange={(event) => {
                        this.setState({ newKeyword: event.target.value })
                    }}
                    onKeyPress={event => {
                        if (event.key === 'Enter') {
                            this.props.onRequestAddTag(this.state.newKeyword)
                            this.setState({
                                newKeyword: ''
                            })
                        }
                    }}
                />
            </div>
        )
    }
}

export default connect(undefined, { toggleScreenlock })(Tags)
