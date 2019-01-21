import React from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeraljs'
import moment from 'moment'
import _ from 'lodash'
import { NotificationManager } from 'react-notifications'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faCaretRight,
    faCaretLeft,
    faTimes,
    faHeart,
    faTrash,
    faGlobe
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faRegularHeart } from '@fortawesome/free-regular-svg-icons'

import KeyCodes from '../../../constants/KeyCodes'
import InlineEdit from '../../partials/InlineEdit'
import Dialog from '../../partials/Dialog'
import PopupMenu from '../../partials/PopupMenu'
import Preview from './Preview'

import e621NetLogo from '../../../../assets/e621-net-logo.png'

import './style.scss'

library.add(
    faCaretLeft,
    faCaretRight,
    faTimes,
    faHeart,
    faRegularHeart,
    faTrash,
    faGlobe
)

export default class MediaDialog extends React.Component {
    static propTypes = {
        onRequestDelete: PropTypes.func.isRequired,
        onRequestClose: PropTypes.func.isRequired,
        onRequestOverlay: PropTypes.func.isRequired,
        onRequestNext: PropTypes.func.isRequired,
        onRequestPrev: PropTypes.func.isRequired,
        onRequestSearch: PropTypes.func.isRequired,
        item: PropTypes.object.isRequired,
        position: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired
    }

    static defaultProps = {
        onRequestDelete: () => {},
        onRequestClose: () => {},
        onRequestOverlay: () => {},
        onRequestNext: () => {},
        onRequestPrev: () => {},
        onRequestSearch: () => {}
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
        document.removeEventListener('keydown', this._handleKeydown, false)
        document.body.removeChild(this.el)

        this._mounted = false

        // if (this.props.item && this.props.item.off) {
        //     this.props.item.off('update', this._forceRerender)
        // }
    }

    componentDidMount() {
        document.addEventListener('keydown', this._handleKeydown, false)

        this._mounted = true

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
            // if (prevProps.item && prevProps.item.off) {
            //     prevProps.item.off('update', this._forceRerender)
            // }
        }
    }

    render() {
        const { item, position, total } = this.props

        const author = Array.isArray(item.attributes.author)
            ? item.attributes.author.join('')
            : item.attributes.author

        return <Dialog
            className={'media-dialog'}
            title={item.title}
            onRequestClose={this.props.onRequestClose}
            killPropagation
            other={<React.Fragment>
                <button className={'next-button'} onClick={this.props.onRequestNext}>
                    <FontAwesomeIcon icon={['fas', 'caret-right']} fixedWidth />
                </button>
                <button className={'prev-button'} onClick={this.props.onRequestPrev}>
                    <FontAwesomeIcon icon={['fas', 'caret-left']} fixedWidth />
                </button>

                <div className={'position'}>
                    <span>{position} / {total}</span>
                </div>
            </React.Fragment>}
            footer={<div className={'grid-x button-group'}>
                <button className={'button clear cell auto'} onClick={this._setFavorite}>
                    <FontAwesomeIcon icon={[item.attributes.favorite ? 'fas' : 'far', 'heart']} />
                </button>
                <button className={'button clear cell auto'} onClick={() => { this.props.onRequestDelete(item.id) }}>
                    <FontAwesomeIcon icon={['fas', 'trash']} />
                </button>

                <PopupMenu
                    className={'clear cell auto'}
                    buttonClassName={'clear cell auto'}
                    label={<FontAwesomeIcon icon={['fas', 'globe']} />}
                    options={[
                        {
                            content: <img src={e621NetLogo} />,
                            onClick: this._checkBooru,
                            disabled: this.props.item.attributes.keywords.indexOf('not_found_on_e621') > -1
                        }
                    ]}
                />
            </div>}
        >
            <div className={'grid-x'}>
                <div className={'cell small-3 medium-3 large-4'}>
                    <Preview key={item.id} item={item} onRequestOverlay={this.props.onRequestOverlay} />
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
                                    <tr><th>Author</th><td><InlineEdit value={author} onUpdate={this._handleUpdateAuthor} /></td></tr>
                                    {(item.attributes.checksum !== item.attributes.file.name) && (
                                        <tr><th>Checksum</th><td>{item.attributes.checksum}</td></tr>
                                    )}
                                    <tr><th>Created</th><td>{moment(item.attributes.file.created_at).format('D MMMM YYYY')}</td></tr>
                                    <tr><th>Updated</th><td>{moment(item.attributes.file.updated_at).format('D MMMM YYYY')}</td></tr>
                                    <tr><th>Tags</th>
                                        <td>
                                            <div className={'tags'}>
                                                {this.state.keywords.map((keyword, index) => {
                                                    return (
                                                        <div className={'label'} key={`${index}-${keyword}`}>
                                                            <div className={'closer'} onClick={() => {
                                                                this._handleDeleteKeyword(keyword)
                                                            }}>
                                                                <FontAwesomeIcon icon={['fas', 'times']} />
                                                            </div>
                                                            <span onClick={() => {
                                                                this._handleClickKeyword(keyword)
                                                            }}>{keyword}</span>
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

        </Dialog>
    }

    _handleKeydown = (event) => {
        switch (event.keyCode) {
            case KeyCodes.ESCAPE:
                this.props.onRequestClose()
                break
            case KeyCodes.ARROW_LEFT:
                this.props.onRequestPrev()
                break
            case KeyCodes.ARROW_RIGHT:
                this.props.onRequestNext()
                break
        }

        if (KeyCodes.getCharacterFromCode(event.keyCode) === 'l') {
            this._setFavorite()
        }
    }

    _forceRerender = () => {
        if (!this._mounted) {
            this.props.item && this.props.item.off && this.props.item.off('update', this._forceRerender)
            return
        }

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

    _handleClickKeyword = (keyword) => {
        this.props.onRequestSearch(`keywords.keyword:${keyword}`)
        this.props.onRequestClose()
    }

    _handleUpdateTitle = (value) => {
        this.props.item.attributes.title = value
        this.props.item.update()
    }

    _handleUpdateAuthor = (value) => {
        this.props.item.attributes.author = value
        this.props.item.update()
    }

    _checkBooru = () => {
        if (this.props.item.attributes.keywords.indexOf('not_found_on_e621') > -1) {
            NotificationManager.warning('Already checked on E621')

            return
        }

        fetch(`booru://e621/${this.props.item.attributes.checksum}`)
            .then(result => result.json())
            .then(result => {
                console.table(result)

                this.props.item.attributes.author = result.artist
                this.props.item.attributes.source = result.source
                this.props.item.attributes.rating = (rating => {
                    switch (rating) {
                        case 'q': return 'questionable'
                        case 's': return 'safe'
                        case 'e': return 'explicit'
                    }
                })(result.rating)

                const keywords = [...this.props.item.attributes.keywords, ...result.tags.split(/\s+/g), 'e621']

                this.props.item.attributes.keywords = _.uniq(keywords)
                this.props.item.update()

                NotificationManager.success('E621 successfully checked')
            })
            .catch(err => {
                console.warn('-- booru', err)

                const keywords = [...this.props.item.attributes.keywords, 'not_found_on_e621']
                this.props.item.attributes.keywords = _.uniq(keywords)
                this.props.item.update()

                NotificationManager.warning('Not found on E621')
            })
    }
}
