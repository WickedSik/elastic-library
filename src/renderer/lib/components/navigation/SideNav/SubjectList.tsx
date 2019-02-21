import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHeart, faGlobe, faTag } from '@fortawesome/free-solid-svg-icons'
import { CHECKED_ON_BOORU } from '@src/renderer/lib/constants/search'
import { RootState } from '@src/renderer/lib/store/modules';

library.add(faHeart, faGlobe, faTag)

interface Subject {
    key: string
    doc_count: number
}

interface SubjectListProps {
    onSearch: (term:string) => void
    subjects: Subject[]
}
interface SubjectListState {
    term: string
}

class SubjectList extends React.Component<SubjectListProps, SubjectListState> {
    state = {
        term: '*'
    }

    render() {
        const { subjects } = this.props
        const { term } = this.state

        const subjectCheck = (s:Subject) => s.key !== CHECKED_ON_BOORU

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

    _handleClick = (subject:Subject) => {
        this.setState({
            term: subject.key
        }, () => {
            this.props.onSearch(`keywords.keyword:${subject.key}`)
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
    (state:RootState) => {
        return {
            subjects: state.search ? state.search.subjects : []
        }
    }
)(SubjectList)
