import React from 'react'
import PropTypes from 'prop-types'

import SubjectList from './SubjectList'

export default class SideNav extends React.Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSearch: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired
    }

    static defaultProps = {
        open: false
    }

    render() {
        return (
            <div open={this.props.open} onClose={this.props.onClose}>
                <div className={''}>
                    <SubjectList onSearch={this.props.onSearch} />
                </div>
            </div>
        )
    }
}
