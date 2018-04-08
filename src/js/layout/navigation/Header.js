import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import { AppBar, Toolbar, Typography, IconButton } from 'material-ui'
import MenuIcon from 'material-ui-icons/Menu'
import SideNav from './SideNav'
import SearchBar from './SearchBar'

const styles = {
    root: {
        flexGrow: 1,
    },
    flex: {
        flex: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

class ButtonAppBar extends React.Component {
    state = {
        open: false
    }

    toggleDrawer() {
        this.setState({
            open: !this.state.open
        })
    }

    render() {
        const { classes, term } = this.props

        return (
            <div className={classes.root}>
                <AppBar position="fixed">
                    <Toolbar>
                        <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={this.toggleDrawer.bind(this)}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            Media Library
                        </Typography>
                        <SearchBar term={term} handleSearch={x => {
                            this.setState({ open: false })
                            this.props.onSearch(x)
                        }} />
                    </Toolbar>
                </AppBar>
                <SideNav open={this.state.open} 
                        onClose={() => { 
                            this.setState({ open: false }) 
                        }}
                        onSearch={x => { 
                            this.setState({ open: false })
                            this.props.onSearch(x)
                        }} />
            </div>
        );
    }
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
  term: PropTypes.string.isRequired
}

export default withStyles(styles)(ButtonAppBar)