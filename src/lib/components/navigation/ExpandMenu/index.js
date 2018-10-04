// brutal copy of https://codepen.io/bjonesAlloy/pen/EWNXJ
import React from 'react'
import PropTypes from 'prop-types'

import './style.scss'

export default class ExpandMenu extends React.PureComponent {
    static propTypes = {
        items: PropTypes.arrayOf(PropTypes.shape({
            link: PropTypes.string.isRequired,
            icon: PropTypes.string.isRequired
        })).isRequired
    }

    static defaultProps = {
        items: []
    }

    render() {
        return (
            <div className={'expand-menu'}>
                <a className={'button ctrl'} href={'#'} tabIndex={'1'}>★</a>
                <ul className={'tip ctrl'}>
                    {this.props.items.map(item => (
                        <li key={item.link} className={'slice'}>
                            <a href={item.link}>{item.icon}</a>
                        </li>
                    ))}
                </ul>

            </div>
        )
    }
}
