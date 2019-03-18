import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart, faGlobe, faTag } from '@fortawesome/free-solid-svg-icons'
import { CHECKED_ON_BOORU, NOT_FOUND_ON_BOORU } from '../../../store/modules/search/actiontypes'

library.add(faHeart, faGlobe, faTag)

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

        const subjectCheck = s => s.key !== NOT_FOUND_ON_BOORU && s.key !== CHECKED_ON_BOORU

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
                    { subjects.filter(subjectCheck).map(subject =>
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
            this.props.onSearch(`keywords.keyword:"${subject.key}"`)
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
