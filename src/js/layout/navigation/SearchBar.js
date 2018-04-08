import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import IconButton from 'material-ui/IconButton'
import Input, { InputAdornment } from 'material-ui/Input'
import { FormControl } from 'material-ui/Form'
import Search from 'material-ui-icons/Search'

import { withStyles } from 'material-ui/styles'

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    margin: {
        margin: theme.spacing.unit,
    },
    withoutLabel: {
        marginTop: theme.spacing.unit * 3,
    },
    textField: {
        flexBasis: 200,
    },
    inputField: {
        color: 'white',
        '&::after': {
            backgroundColor: 'white'
        },
        '&::before': {
            backgroundColor: 'rgba(255, 255, 255, .5)'
        },
        '&:hover:not(.MuiInput-disabled-99)': {
            '&::before': {
                backgroundColor: 'rgba(255, 255, 255, .5)'
            }
        }
    }
})

class SearchBar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            value: props.term
        }
    }

    render() {
        const { classes, handleSearch } = this.props

        return (
            <div>
                <FormControl className={classNames(classes.margin, classes.textField)}>
                    <Input
                        id="search-field"
                        type="text"
                        value={this.state.value}
                        onChange={event => this.setState({ value: event.target.value })}
                        className={classes.inputField}
                        endAdornment={
                            <InputAdornment position="end" color="inherit">
                                <IconButton
                                    onClick={handleSearch.bind(this, this.state.value)}
                                    onMouseDown={handleSearch.bind(this, this.state.value)}
                                    color="inherit"
                                    >
                                    <Search />
                                </IconButton>
                            </InputAdornment>
                        }
                        />
                </FormControl>
            </div>
        )
    }
}


SearchBar.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SearchBar)