import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withStyles, Chip } from 'material-ui'
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, Button } from 'material-ui'
import { FormControl, Input, InputAdornment, InputLabel, IconButton } from 'material-ui'
import Slide from 'material-ui/transitions/Slide'
import Add from 'material-ui-icons/Add'

import e621 from '../../redux/api/e621'

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
    state = {
        newKeyword: '',
        keywords: []
    }

    componentDidMount() {
        this.setState({
            keywords: this.props.item.attributes.keywords
        })
    }

    searchOnE621(md5) {
        e621.findPost(md5).then(result => {
            console.info('-- e621', result)

        }).catch(e => console.error('-- e621', e))
    }

    addNewKeyword() {
        let keywords = this.state.keywords
        keywords.push(this.state.newKeyword)

        this.setState({
            keywords,
            newKeyword: ''
        })
    }

    handleDeleteKeyword(keyword) {
        console.info('-- keyword:delete', keyword)
    }
    
    render() {
        const { classes, onClose, selectedValue, onOverlay, ...other } = this.props
        const doc = this.props.item

        return (
            <div>
                <Dialog onClose={onClose} transition={Transition} {...other}>
                    <DialogTitle>{doc.attributes.file.name}</DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        <Grid container>
                            <Grid item xs={3}>
                                <img 
                                    className={classes.img}
                                    alt={doc.attributes.file.path}
                                    src={doc.url}
                                    onClick={onOverlay} />
                            </Grid>
                            <Grid item>
                                <p><strong>Tags</strong></p>
                                <div className={classes.tags}>
                                    {this.state.keywords.map(keyword => {
                                        return (
                                            <Chip
                                                key={keyword}
                                                label={keyword}
                                                onDelete={this.handleDeleteKeyword.bind(this, keyword)}
                                                className={classes.chip} 
                                            />
                                        )
                                    })}
                                </div>
                                <div>
                                    <FormControl className={classNames(classes.margin, classes.textField)}>
                                        <InputLabel htmlFor="new-keyword">New Keyword</InputLabel>
                                        <Input
                                            id="new-keyword"
                                            type="text"
                                            value={this.state.newKeyword}
                                            onChange={(event) => this.setState({ newKeyword: event.target.value })}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="Add"
                                                        onClick={this.addNewKeyword.bind(this)}
                                                        >
                                                        <Add />
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                    </FormControl>
                                </div>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.searchOnE621.bind(this, doc.attributes.checksum)} color="primary">Check on E621</Button>
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