import React from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeraljs'
import moment from 'moment'

import InlineEdit from '../partials/InlineEdit'

import e621 from '../../../redux/api/e621'
import Config from '../../../../config'

import Document from '../../Document'

export default class MediaDialog extends React.Component {
    static propTypes = {
        item: PropTypes.objectOf(Document),
        onClose: PropTypes.func,
        onOverlay: PropTypes.func,
        onDelete: PropTypes.func,
        open: PropTypes.bool.isRequired
    }

    static defaultProps = {
        open: false
    }

    state = {
        newKeyword: '',
        keywords: []
    }

    componentWillMount() {
        if (this.props.item && this.props.item.addNotifier) {
            this.props.item.addNotifier({
                fire: () => {
                    // changing state actually rerenders the component!
                    this._forceRerender()
                }
            })
        }
    }

    componentDidMount() {
        this.setState({
            keywords: this.props.item.attributes.keywords
        })
    }

    render() {
        const { onClose, onOverlay, open, item } = this.props

        return (
            <div>
                <div onClose={onClose} open={open}>
                    <h1>{item.title}</h1>
                    <div className={''}>
                        <div container>
                            <div item xs={3}>
                                <img
                                    className={''}
                                    alt={item.title}
                                    src={item.url}
                                    onClick={onOverlay} />
                            </div>
                            <div item xs={9}>
                                <table className={''}>
                                    <tbody>
                                        <tr><th className={''}>Title</th><td><InlineEdit value={item.title} onUpdate={this._handleUpdateTitle} /></td></tr>
                                        <tr><th className={''}>Filename</th><td>{item.attributes.file.name}</td></tr>
                                        <tr><th className={''}>Extension</th><td>{item.attributes.file.extension}</td></tr>
                                        <tr><th className={''}>Size</th><td>{numeral(item.attributes.file.size).format('0.00b')}</td></tr>
                                        <tr><th className={''}>Created</th><td>{moment(item.attributes.file.created_at).format('D MMMM YYYY')}</td></tr>
                                        <tr><th className={''}>Updated</th><td>{moment(item.attributes.file.updated_at).format('D MMMM YYYY')}</td></tr>
                                    </tbody>
                                </table>
                                <p><strong>Tags</strong></p>
                                <div className={''}>
                                    {this.state.keywords.map(keyword => {
                                        return (
                                            <div
                                                key={keyword}
                                                label={keyword}
                                                onDelete={() => {
                                                    this._handleDeleteKeyword(keyword)
                                                }}
                                                className={''}
                                            />
                                        )
                                    })}
                                </div>
                                <div>
                                    <form className={''}>
                                        <label htmlFor='new-keyword'>New Keyword</label>
                                        <input
                                            id='new-keyword'
                                            type='text'
                                            value={this.state.newKeyword}
                                            onChange={(event) => this.setState({ newKeyword: event.target.value })}
                                            onKeyPress={event => {
                                                if (event.key === 'Enter') {
                                                    this.addNewKeyword()
                                                }
                                            }}
                                            endAdornment={
                                                <span position='end'>
                                                    <button
                                                        aria-label='Add'
                                                        onClick={this._addNewKeyword}
                                                    >
                                                        <span className={'fa fa-add'} />
                                                    </button>
                                                </span>
                                            }
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button onClick={this._searchOnE621} color='primary'>Check on E621</button>
                        <button onClick={() => {
                            this.props.onDelete(item.id)
                        }} color='secondary'>Delete</button>
                    </div>
                </div>
            </div>
        )
    }

    _forceRerender = () => {
        this.setState({
            keywords: this.props.item.attributes.keywords
        })
    }

    _searchOnE621 = () => {
        // e621.login(Config.e621.username, Config.e621.password)

        e621.findPost(this.props.item.attributes.checksum, Config.e621.username, Config.e621.password).then(result => {
            console.info('-- e621', result)
        }).catch(e => console.error('-- e621', e))
    }

    _addNewKeyword = () => {
        let keywords = this.state.keywords
        if (keywords.indexOf(this.state.keyword) === -1) {
            keywords.push(this.state.newKeyword)
        }

        this.props.item.attributes.keywords = keywords
        this.props.item.update()

        this.setState({
            keywords,
            newKeyword: ''
        })
    }

    _handleDeleteKeyword = (keyword) => {
        let keywords = this.state.keywords.filter(k => k !== keyword)

        this.props.item.attributes.keywords = keywords
        this.props.item.update()

        this.setState({
            keywords,
            newKeyword: ''
        })
    }

    _handleUpdateTitle = (value) => {
        this.props.item.attributes.title = value
        this.props.item.update()
    }
}
