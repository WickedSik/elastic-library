import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class SubjectList extends React.Component {
    static propTypes = {
        onSearch: PropTypes.func.isRequired,
        subjects: PropTypes.array
    }

    state = {
        term: '*'
    }

    render() {
        const { subjects } = this.props
        const { term } = this.state

        console.info('-- search', term)

        return (
            <div className={'subject-list'}>
                <ul className='menu vertical icons icon-left'>
                    <li onClick={this._handleFavorite}>
                        <FontAwesomeIcon icon={['fas', 'heart']} />
                        <span>Favorites</span>
                    </li>
                    <li onClick={this._handleEverything}>
                        <FontAwesomeIcon icon={['fas', 'globe']} />
                        <span>Everything</span>
                    </li>
                    { subjects.map(subject =>
                        <li key={subject.key} onClick={() => { this._handleClick(subject) }} className={classnames(subject.key === term && 'active')}>
                            <FontAwesomeIcon icon={['fas', 'tag']} />
                            <span>{subject.key} ({subject.doc_count})</span>
                        </li>
                    )}
                    <div />
                </ul>
            </div>
        )
    }

    _handleClick = (subject) => {
        this.setState({
            term: subject.key
        }, () => {
            this.props.onSearch(`keywords:${subject.key}`)
        })
    }

    _handleFavorite = () => {
        this.props.onSearch('favorite:true')
    }

    _handleEverything = () => {
        this.props.onSearch('*')
    }
}

export default connect(
    (state) => {
        return {
            subjects: state.search ? state.search.subjects : []
        }
    }
)(SubjectList)
