import React from 'react'
import PropTypes from 'prop-types'

import './style.scss'

import SubjectList from './SubjectList'

export default class SideNav extends React.Component {
    static propTypes = {
        onSearch: PropTypes.func.isRequired
    }

    render() {
        return (
            <div className={'side-nav'}>
                <SubjectList onSearch={this.props.onSearch} />
            </div>
        )
    }
}
