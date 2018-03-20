import React from 'react'
import PropTypes from 'prop-types'
import { withStyles, Chip } from 'material-ui'
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, Button } from 'material-ui';
import Slide from 'material-ui/transitions/Slide';

import e621 from '../../redux/api/e621'

import url from 'url'

const styles = (theme) => ({
    appBar: {
        position: 'relative'
    },
    flex: {
        flex: 1,
    },
    dialogContent: {
        marginTop: theme.spacing.unit * 2
    },
    tags: {},
    chip: {
        margin: theme.spacing.unit / 2,
    },
    img: {
        maxWidth: '100%'
    }
})

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class MediaDialog extends React.Component {
    searchOnE621(md5) {
        e621.findPost(md5).then(result => {
            console.info('-- e621', result)

        }).catch(e => console.error('-- e621', e))
    }

    handleDeleteKeyword(keyword) {
        console.info('-- keyword:delete', keyword)
    }
    
    render() {
        const { classes, onClose, selectedValue, ...other } = this.props
        const { _source } = this.props.item

        return (
            <div>
                <Dialog onClose={onClose} transition={Transition} {...other}>
                    <DialogTitle>{_source.file.name}</DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        <Grid container>
                            <Grid item xs={3}>
                                <img 
                                    className={classes.img}
                                    alt={_source.file.path}
                                    src={url.format({
                                        pathname: _source.file.path,
                                        protocol: 'image:',
                                        slashes: true,
                                        query: {
                                            w: 500
                                        }
                                    })} />
                            </Grid>
                            <Grid item>
                                <p><strong>Tags</strong></p>
                                <div className={classes.tags}>
                                    {_source.keywords.map(keyword => {
                                        return (
                                            <Chip
                                                key={keyword}
                                                label={keyword}
                                                onDelete={this.handleDeleteKeyword(keyword)}
                                                className={classes.chip} 
                                            />
                                        )
                                    })}
                                </div>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.searchOnE621.bind(this, _source.checksum)} color="primary">Check on E621</Button>
                        <Button color="secondary">Delete</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

MediaDialog.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MediaDialog)