import React from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import numeral from 'numeraljs'
import moment from 'moment'
import _ from 'lodash'

import InlineEdit from '../../partials/InlineEdit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './style.scss'

export default class MediaDialog extends React.Component {
    static propTypes = {
        onRequestDelete: PropTypes.func.isRequired,
        onRequestClose: PropTypes.func.isRequired,
        onRequestOverlay: PropTypes.func.isRequired,
        onRequestNext: PropTypes.func.isRequired,
        onRequestPrev: PropTypes.func.isRequired,
        item: PropTypes.object.isRequired
    }

    static defaultProps = {
        onRequestDelete: () => {},
        onRequestClose: () => {},
        onRequestOverlay: () => {},
        onRequestNext: () => {},
        onRequestPrev: () => {}
    }

    state = {
        newKeyword: '',
        keywords: []
    }

    constructor(props) {
        super(props)

        this.el = document.createElement('div')
    }

    componentWillMount() {
        document.body.appendChild(this.el)

        if (this.props.item && this.props.item.on) {
            this.props.item.on('update', this._forceRerender)
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._closeIfEscape, false)
        document.body.removeChild(this.el)
    }

    componentDidMount() {
        document.addEventListener('keydown', this._closeIfEscape, false)

        this.setState({
            keywords: this.props.item.attributes.keywords
        })
    }

    componentDidUpdate(prevProps) {
        const oldKey = prevProps.item.attributes.keywords.join('-')
        const newKey = this.props.item.attributes.keywords.join('-')

        if (oldKey !== newKey) {
            this.setState({ // eslint-disable-line react/no-did-update-set-state
                keywords: this.props.item.attributes.keywords
            })
        }

        if (prevProps.item.id !== this.props.item.id) {
            if (this.props.item && this.props.item.on) {
                this.props.item.on('update', this._forceRerender)
            }
        }
    }

    render() {
        const { item } = this.props

        return ReactDOM.createPortal(
            <div className={classnames('media-dialog', 'lib-dialog', 'open')} onClick={this.props.onRequestClose}>
                <div className={'media-dialog-content lib-dialog-content'} onClick={this._killPropagation}>
                    <button className={'close-button'} onClick={this.props.onRequestClose}>
                        <span aria-hidden={'true'}>&times;</span>
                    </button>

                    <button className={'next-button'} onClick={this.props.onRequestNext}>
                        <FontAwesomeIcon icon={['fas', 'caret-right']} fixedWidth />
                    </button>

                    <button className={'prev-button'} onClick={this.props.onRequestPrev}>
                        <FontAwesomeIcon icon={['fas', 'caret-left']} fixedWidth />
                    </button>

                    <h1>{item.title}</h1>
                    <div className={'content'}>
                        <div className={'grid-x'}>
                            <div className={'cell small-3 medium-3 large-4'}>
                                <div className={'image'}>
                                    <img onClick={this.props.onRequestOverlay}
                                        className={'img'}
                                        alt={item.title}
                                        src={item.url} />
                                </div>
                            </div>
                            <div className={'cell auto'}>
                                <div className={'grid-x'}>
                                    <div className={'cell small-12'}>
                                        <table className={'table'}>
                                            <tbody>
                                                <tr><th>Title</th><td><InlineEdit value={item.title} onUpdate={this._handleUpdateTitle} /></td></tr>
                                                <tr><th>Filename</th><td>{item.attributes.file.name}</td></tr>
                                                <tr><th>Extension</th><td>{item.attributes.file.extension}</td></tr>
                                                <tr><th>Size</th><td>{numeral(item.attributes.file.size).format('0.00b')}</td></tr>
                                                {item.attributes.author && (
                                                    <tr><th>Author</th><td>{item.attributes.author}</td></tr>
                                                )}
                                                {(item.attributes.checksum !== item.attributes.file.name) && (
                                                    <tr><th>Checksum</th><td>{item.attributes.checksum}</td></tr>
                                                )}
                                                <tr><th>Created</th><td>{moment(item.attributes.file.created_at).format('D MMMM YYYY')}</td></tr>
                                                <tr><th>Updated</th><td>{moment(item.attributes.file.updated_at).format('D MMMM YYYY')}</td></tr>
                                                <tr><th>Tags</th>
                                                    <td>
                                                        <div className={'tags'}>
                                                            {this.state.keywords.map(keyword => {
                                                                return (
                                                                    <div className={'label'} key={keyword}>
                                                                        <FontAwesomeIcon icon={['fas', 'times']} onClick={() => {
                                                                            this._handleDeleteKeyword(keyword)
                                                                        }} />
                                                                        <span>{keyword}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                            <input value={this.state.newKeyword}
                                                                placeholder={'Add (+ enter)'}
                                                                onChange={(event) => {
                                                                    this.setState({ newKeyword: event.target.value })
                                                                }}
                                                                onKeyPress={event => {
                                                                    if (event.key === 'Enter') {
                                                                        this._addNewKeyword()
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={'controls'}>
                        <div className={'grid-x'}>
                            <button className={'button clear cell auto'} onClick={this._setFavorite}>
                                <FontAwesomeIcon icon={[item.attributes.favorite ? 'fas' : 'far', 'heart']} />
                            </button>
                            <button className={'button clear cell auto'} onClick={() => { this.props.onRequestDelete(item.id) }}>
                                <FontAwesomeIcon icon={['fas', 'trash']} />
                            </button>
                            <button className={'button clear cell auto'} onClick={this._checkBooru}>
                                <FontAwesomeIcon icon={['fas', 'globe']} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            , this.el
        )
    }

    _closeIfEscape = (event) => {
        if (event.keyCode === 27) {
            this.props.onRequestClose()
        }
    }

    _forceRerender = () => {
        console.info('-- media-dialog:force-rerender')

        this.setState(state => ({
            forceUpdate: !state.forceUpdate,
            keywords: this.props.item.attributes.keywords
        }))
    }

    _setFavorite = () => {
        this.setState({
            forceUpdate: !this.state.forceUpdate
        })

        this.props.item.attributes.favorite = !this.props.item.attributes.favorite
        this.props.item.update()
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

    _killPropagation = (eve) => {
        eve.stopPropagation()
        eve.preventDefault()

        return false
    }

    _checkBooru = () => {
        fetch(`booru://e621/${this.props.item.attributes.checksum}`)
            .then(result => result.json())
            .then(result => {
                console.table(result)

                this.props.item.attributes.author = result.artist
                this.props.item.attributes.source = result.source
                this.props.item.attributes.rating = ((rating) => {
                    switch (rating) {
                    case 'q': return 'questionable'
                    case 's': return 'safe'
                    case 'e': return 'explicit'
                    }
                })(result.rating)

                const keywords = [...this.props.item.attributes.keywords, ...result.tags.split(/\s+/g)]

                this.props.item.attributes.keywords = _.uniq(keywords)
                this.props.item.update()
            })
            .catch(err => {
                console.warn('-- booru', err)
            })
    }
}
