// brutal copy of https://codepen.io/bjonesAlloy/pen/EWNXJ
import React from 'react'

import './style.scss'

type ItemProps = {
    link: string
    icon: string
}

export interface ExpandMenuProps {
    items: ItemProps[]
}

export default class ExpandMenu extends React.PureComponent<ExpandMenuProps> {
    static defaultProps:ExpandMenuProps = {
        items: []
    }

    render() {
        return (
            <div className={'expand-menu'}>
                <a className={'button ctrl'} href={'#'} tabIndex={1}>★</a>
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
