import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrash, faTh } from '@fortawesome/free-solid-svg-icons'

import './style.scss'

library.add(faTrash, faTh)

export default class BulkActionBar extends React.Component {
    static propTypes = {
        bulkSelection: PropTypes.array.isRequired
    }

    static defaultProps = {
        bulkSelection: []
    }

    render() {
        const { bulkSelection } = this.props
        console.info('-- bulk', bulkSelection)

        return (
            <div className={'bulk-action-bar'}>
                <div className={'counter'}>
                    <span className={'label'}><strong>Selected:</strong> {bulkSelection.length}</span>
                </div>
                <div className={'fixed'}>
                    <span className={'icon button'}>
                        <FontAwesomeIcon icon={['fas', 'trash']} />
                    </span>
                    <span className={'icon button'}>
                        <FontAwesomeIcon icon={['fas', 'th']} />
                    </span>
                </div>
            </div>
        )
    }
}
