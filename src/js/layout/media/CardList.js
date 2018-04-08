import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import { connect } from 'react-redux'
import { Grid, Button } from 'material-ui'
import Cached from 'material-ui-icons/Cached'

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
    nextButton: {
        height: '100%',
        width: '100%'
    }
});

class CardList extends React.Component {
    render() {
        const { classes, results, total } = this.props;

        return (
            <div className={classes.root}>
                <Grid container spacing={24}>
                    {results && results.map(result => (
                        <Grid key={result.id} item xs={4} md={3} lg={2}>
                            <MediaItem item={result} onDelete={this.props.onDelete} />
                        </Grid>
                    ))}
                    {results && total > results.length && (
                        <Grid item xs={4} md={3} lg={2}>
                            <Button className={classes.nextButton} onClick={this.props.onRequestMore} variant="raised">
                                <Cached />
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </div>
        );
    }
}

CardList = connect(
    (state, props) => {
        return {
        }
    }
)(CardList)

CardList.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardList);