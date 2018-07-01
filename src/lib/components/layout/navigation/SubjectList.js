import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

class SubjectList extends React.Component {
    static propTypes = {
        onSearch: PropTypes.func.isRequired,
        subjects: PropTypes.array
    }

    render() {
        const { subjects } = this.props

        return (
            <div className={''}>
                <ul component='nav'>
                    <li button onClick={this._handleFavorite}>
                        <span>
                            <span className={'fa fa-heart'} />
                        </span>
                        <p primary='Favorites' />
                    </li>
                    { subjects.map(subject =>
                        <li key={subject.key} button onClick={() => { this._handleClick(subject) }}>
                            <span>
                                <span className={'fa fa-heart'} />
                            </span>
                            <p primary={subject.key} />
                        </li>
                    )}
                    <div />
                </ul>
            </div>
        )
    }

    _handleClick = (subject) => {
        this.props.onSearch('keywords:' + subject.key)
    }

    _handleFavorite = () => {
        this.props.onSearch('favorite:true')
    }
}

export default connect(
    (state) => {
        return {
            subjects: state.search ? state.search.subjects : []
        }
    }
)(SubjectList)
