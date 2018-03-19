import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { Drawer } from 'material-ui';
import SubjectList from './SubjectList'

const styles = {
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
};

class SideNav extends React.Component {

    render() {
        const { classes } = this.props;

        return (
            <Drawer open={this.props.open} onClose={this.props.onClose}>
                <div className={classes.list}>
                    <SubjectList onSearch={this.props.onSearch} />
                </div>
            </Drawer>
        )
    }
}

SideNav.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired
};

export default withStyles(styles)(SideNav);