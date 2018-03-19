import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { connect } from 'react-redux';
import { Grid } from 'material-ui';

import MediaItem from './MediaItem'

const styles = theme => ({
    root: {
        flexGrow: 1,
        padding: theme.spacing.unit * 2,
        paddingTop: 64 + (theme.spacing.unit * 2)
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
});

class CardList extends React.Component {
    render() {
        const { classes, results } = this.props;

        return (
            <div className={classes.root}>
                <Grid container spacing={24}>
                    {results && results.map(result => (
                        <Grid key={result._id} item xs={3}>
                            <MediaItem item={result} />
                        </Grid>
                    ))}
                </Grid>
            </div>
        );
    }
}

CardList = connect(
    (state, props) => {
        return {
            results: state.search ? state.search.results : []
        }
    }
)(CardList)

CardList.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardList);