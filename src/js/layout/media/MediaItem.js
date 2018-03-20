import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { Button, Icon, IconButton } from 'material-ui';
import Card, { CardActions, CardHeader, CardMedia } from 'material-ui/Card';
import red from 'material-ui/colors/red';

import url from 'url';
import MediaDialog from './MediaDialog';

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
        height: 200
    }
};

class MediaItem extends Component {
    state = {
        open: false
    }

    render() {
        const { _source } = this.props.item;
        const icon = _source.favorite
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
                        title={_source.file.name}
                        action={<IconButton>{icon}</IconButton>} />
                    <CardMedia 
                        className={classes.media}
                        image={url.format({
                            pathname: _source.file.path,
                            protocol: 'image:',
                            slashes: true,
                            query: {
                                w: 500
                            }
                        })}
                        title={_source.file.name}
                        overlay={_source.file.name}
                    />
                    <CardActions>
                        <Button size="small" onClick={() => this.setState({ open: true })}>Learn More</Button>
                    </CardActions>
                </Card>
                <MediaDialog item={this.props.item} open={this.state.open} onClose={() => this.setState({ open: false })} />
            </div>
        );
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