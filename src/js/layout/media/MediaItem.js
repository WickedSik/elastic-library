import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import { Button, Icon, IconButton } from 'material-ui'
import Card, { CardActions, CardHeader, CardMedia } from 'material-ui/Card'
import red from 'material-ui/colors/red'

import MediaDialog from './MediaDialog'
import MediaOverlay from './MediaOverlay'

const styles = {
    card: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        marginBottom: 16,
        fontSize: 14,
    },
    headerTitle: {
        textOverflow: 'ellipsis',
        overflow: 'hidden'
    },
    pos: {
        marginBottom: 12,
    },
    header: {
        maxWidth: 'calc(100% - 32px)'
    },
    actions: {
        display: 'flex',
    },
    avatar: {
        backgroundColor: red[500],
    },
    media: {
        height: 200,
        cursor: 'pointer'
    }
};

class MediaItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            open: false,
            overlayOpen: false,
            forceUpdate: false
        }
    
        if(this.item && this.item.addNotifier) {
            this.item.addNotifier({
                fire:() => {
                    // changing state actually rerenders the component!
                    this.setState({
                        forceUpdate: true
                    })
                }
            })
        }
    }

    render() {
        const doc = this.props.item;
        const icon = doc.attributes.favorite
                        ? <Icon color="action">favorite</Icon>
                        : <Icon color="action">favorite_border</Icon>
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Card>
                    <CardHeader
                        classes={{
                            content: classes.header,
                            title: classes.headerTitle
                        }} 
                        title={doc.title}
                        action={<IconButton onClick={event => {
                            event.stopPropagation()
                            event.preventDefault()

                            this.setFavorite()
                        }}>{icon}</IconButton>} />
                    <CardMedia 
                        className={classes.media}
                        image={doc.thumb}
                        title={doc.title}
                        overlay={doc.title}
                        onClick={() => this.setState({ overlayOpen: true })}
                    />
                    <CardActions>
                        <Button size="small" onClick={() => this.setState({ open: true })}>Details</Button>
                    </CardActions>
                </Card>
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
        );
    }

    setFavorite() {
        this.setState({
            forceUpdate: false // reset state
        })

        this.props.item.attributes.favorite = !this.props.item.attributes.favorite
        this.props.item.update()
    }
}

MediaItem = connect(
    (state, props) => {
        return {}
    }
)(MediaItem)

MediaItem.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MediaItem);