import React from 'react';
import { connect } from "react-redux"
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import { Inbox as InboxIcon, Favorite as FavoriteIcon } from 'material-ui-icons';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
});

class SubjectList extends React.Component {
    handleClick(subject) {
        this.props.onSearch('keywords:' + subject.key)
    }

    handleFavorite() {
        this.props.onSearch('favorite:true')
    }

    render() {
        const { classes, subjects } = this.props;

        return (
            <div className={classes.root}>
                <List component="nav">
                    <ListItem button onClick={this.handleFavorite.bind(this)}>
                        <ListItemIcon>
                            <FavoriteIcon />
                        </ListItemIcon>
                        <ListItemText primary="Favorites" />
                    </ListItem>
                    { subjects.map(subject => 
                            <ListItem key={subject.key} button onClick={this.handleClick.bind(this, subject)}>
                                <ListItemIcon>
                                    <InboxIcon />
                                </ListItemIcon>
                                <ListItemText primary={subject.key} />
                            </ListItem>
                        )}
                    <Divider />
                </List>
            </div>
        );
    }
}

SubjectList = connect(
    (state, props) => {
        return {
            subjects: state.search ? state.search.subjects: []
        }
    }
)(SubjectList)

SubjectList.propTypes = {
  classes: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired
};

export default withStyles(styles)(SubjectList);