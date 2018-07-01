import React from 'react'
import PropTypes from 'prop-types'

import Document from '../../Document'
import MediaDialog from './MediaDialog'
import MediaOverlay from './MediaOverlay'

export default class MediaItem extends React.Component {
    static propTypes = {
        item: PropTypes.objectOf(Document),
        onDelete: PropTypes.func
    }

    state = {
        open: false,
        overlayOpen: false,
        forceUpdate: false
    }

    componentWillMount() {
        if (this.props.item && this.props.item.addNotifier) {
            this.props.item.addNotifier({
                fire: () => {
                    // changing state actually rerenders the component!
                    this.setState({
                        forceUpdate: true
                    })
                }
            })
        }
    }

    render() {
        const { item } = this.props
        const icon = item.attributes.favorite
            ? <span color='action'>favorite</span>
            : <span color='action'>favorite_border</span>

        return (
            <div className={''}>
                <div>
                    <div
                        className={''}
                        title={item.title}
                        action={<span onClick={event => {
                            event.stopPropagation()
                            event.preventDefault()

                            this._setFavorite()
                        }}>{icon}</span>} />
                    <div
                        className={''}
                        image={item.thumb}
                        title={item.title}
                        overlay={item.title}
                        onClick={() => this.setState({ overlayOpen: true })}
                    />
                    <div>
                        <button size='small' onClick={() => this.setState({ open: true })}>Details</button>
                    </div>
                </div>
                <MediaDialog
                    item={this.props.item}
                    open={this.state.open}
                    onOverlay={() => this.setState({ overlayOpen: true })}
                    onClose={() => this.setState({ open: false })}
                    onDelete={this.props.onDelete}
                />
                <MediaOverlay
                    item={this.props.item}
                    open={this.state.overlayOpen}
                    onClose={() => this.setState({ overlayOpen: false })}
                />
            </div>
        )
    }

    _setFavorite = () => {
        this.setState({
            forceUpdate: false // reset state
        })

        this.props.item.attributes.favorite = !this.props.item.attributes.favorite
        this.props.item.update()
    }
}
