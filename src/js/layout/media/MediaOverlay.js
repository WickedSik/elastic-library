import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import { Popover } from 'material-ui';

const styles = {
    popover: {
        cursor: 'pointer',
    },
    paper: {
        height: 'calc(100vh - 80px)',
        width: 'calc(100vw - 80px)',
        margin: '40px',
        backgroundColor: 'black',
        '&:focus': {
            outline: 'none'
        }
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    }
};

class MediaOverlay extends Component {
    render() {
        const doc = this.props.item;
        const { classes } = this.props;
        const imageStyle = {
            backgroundImage: `url(${doc.url})`
        }

        return (
            <div className={classes.root}>
                <Popover
                    className={classes.popover}
                    open={this.props.open}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'center'
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'center'
                    }}
                    onClose={this.props.onClose}
                    PaperProps={{ className: classes.paper }}
                    >
                    <div style={imageStyle} onClick={this.props.onClose} className={classes.image}></div>
                </Popover>
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

MediaOverlay = connect(
    (state, props) => {
        return {}
    }
)(MediaOverlay)

MediaOverlay.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MediaOverlay);