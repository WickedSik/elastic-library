import React from 'react'
import PropTypes from 'prop-types'

import { Grid, TextField, Button, withStyles } from 'material-ui'
import Edit from 'material-ui-icons/Edit'
import Save from 'material-ui-icons/Save'

const styles = {
    root: {},
    container: {},
    item: {
        padding: 0
    },
    button: {
        padding: 0,
        minHeight: 0
    },
    input: {
        width: '100%'
    }
}

class InlineEdit extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isEditing: false,
            value: props.value || ''
        }
    }

    handleChange() {
        this.setState({
            isEditing: false
        })

        this.props.onUpdate(this.state.value)
    }

    render() {
        const { isEditing, value } = this.state
        const { classes } = this.props

        return (
            <div className={classes.root}>
                {!isEditing && (
                    <Grid container className={classes.container}>
                        <Grid item xs={10} className={classes.item}>
                            {value}
                        </Grid>
                        <Grid item xs={2} className={classes.item}>
                            <Button mini className={classes.button} onClick={() => this.setState({ isEditing: true })}>
                                <Edit />
                            </Button>
                        </Grid>
                    </Grid>
                )}
                {isEditing && (
                    <Grid container className={classes.container}>
                        <Grid item xs={10} className={classes.item}>
                            <TextField className={classes.input} value={value} onChange={event => this.setState({ value: event.target.value })} />
                        </Grid>
                        <Grid item xs={2} className={classes.item}>
                            <Button mini className={classes.button} onClick={this.handleChange.bind(this)}>
                                <Save />
                            </Button>
                        </Grid>
                    </Grid>
                )}
            </div>
        )
    }
}

InlineEdit.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(InlineEdit)