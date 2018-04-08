import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import numeral from 'numeraljs'
import moment from 'moment'

import { withStyles, Chip } from 'material-ui'
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, Button } from 'material-ui'
import { FormControl, Input, InputAdornment, InputLabel, IconButton } from 'material-ui'
import Slide from 'material-ui/transitions/Slide'
import Add from 'material-ui-icons/Add'

import InlineEdit from '../partials/InlineEdit'

import e621 from '../../redux/api/e621'
import Config from '../../../config'

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
    dialog: {
        minWidth: '50%',
        maxWidth: '90%',
        '&:focus': {
            outline: 'none'
        }
    },
    tags: {},
    chip: {
        margin: theme.spacing.unit / 2,
    },
    img: {
        maxWidth: '100%'
    },
    table: {
        width: '100%'
    },
    th: {
        textAlign: 'left'
    }
})

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class MediaDialog extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            newKeyword: '',
            keywords: []
        }
    
        if(this.item && this.item.addNotifier) {
            this.item.addNotifier({
                fire:() => {
                    // changing state actually rerenders the component!
                    this.componentDidMount()
                }
            })
        }
    }

    componentDidMount() {
        this.setState({
            keywords: this.props.item.attributes.keywords
        })
    }

    searchOnE621(md5) {
        // e621.login(Config.e621.username, Config.e621.password)

        e621.findPost(md5, Config.e621.username, Config.e621.password).then(result => {
            console.info('-- e621', result)

        }).catch(e => console.error('-- e621', e))
    }

    addNewKeyword() {
        let keywords = this.state.keywords
        if(keywords.indexOf(this.state.keyword) === -1) {
            keywords.push(this.state.newKeyword)
        }

        this.props.item.attributes.keywords = keywords
        this.props.item.update()

        this.setState({
            keywords,
            newKeyword: ''
        })
    }

    handleDeleteKeyword(keyword) {
        let keywords = this.state.keywords.filter(k => k !== keyword)

        this.props.item.attributes.keywords = keywords
        this.props.item.update()

        this.setState({
            keywords,
            newKeyword: ''
        })
    }

    handleUpdateTitle(value) {
        this.props.item.attributes.title = value
        this.props.item.update()
    }
    
    render() {
        const { classes, onClose, onOverlay, open } = this.props
        const doc = this.props.item

        return (
            <div>
                <Dialog onClose={onClose} transition={Transition} PaperProps={{className:classes.dialog}} open={open}>
                    <DialogTitle>{doc.title}</DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        <Grid container>
                            <Grid item xs={3}>
                                <img 
                                    className={classes.img}
                                    alt={doc.title}
                                    src={doc.url}
                                    onClick={onOverlay} />
                            </Grid>
                            <Grid item xs={9}>
                                <table className={classes.table}>
                                    <tbody>
                                        <tr><th className={classes.th}>Title</th><td><InlineEdit value={doc.title} onUpdate={this.handleUpdateTitle.bind(this)} /></td></tr>
                                        <tr><th className={classes.th}>Filename</th><td>{doc.attributes.file.name}</td></tr>
                                        <tr><th className={classes.th}>Extension</th><td>{doc.attributes.file.extension}</td></tr>
                                        <tr><th className={classes.th}>Size</th><td>{numeral(doc.attributes.file.size).format('0.00b')}</td></tr>
                                        <tr><th className={classes.th}>Created</th><td>{moment(doc.attributes.file.created_at).format('D MMMM YYYY')}</td></tr>
                                        <tr><th className={classes.th}>Updated</th><td>{moment(doc.attributes.file.updated_at).format('D MMMM YYYY')}</td></tr>
                                    </tbody>
                                </table>
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
                                            onKeyPress={event => {
                                                if(event.key === 'Enter') {
                                                    this.addNewKeyword()
                                                }
                                            }}
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
                        <Button onClick={this.props.onDelete.bind(this, doc.id)} color="secondary">Delete</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

MediaDialog.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(MediaDialog)