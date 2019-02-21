import React from 'react'
import PropTypes from 'prop-types'

import './style.scss'

import SubjectList from './SubjectList'

interface SideNavProps {
    onSearch: (term:string) => void
}

export default class SideNav extends React.Component<SideNavProps> {
    render() {
        return (
            <div className={'side-nav'}>
                <SubjectList onSearch={this.props.onSearch} />
            </div>
        )
    }
}
