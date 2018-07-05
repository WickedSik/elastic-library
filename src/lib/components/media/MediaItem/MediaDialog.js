import React from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import numeral from 'numeraljs'
import moment from 'moment'

import InlineEdit from '../../partials/InlineEdit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class MediaDialog extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onRequestDelete: PropTypes.func.isRequired,
        onRequestClose: PropTypes.func.isRequired,
        onRequestFavorite: PropTypes.func.isRequired,
        onRequestOverlay: PropTypes.func.isRequired,
        onRequestNext: PropTypes.func.isRequired,
        onRequestPrev: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired
    }

    static defaultProps = {
        open: false
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

        if (this.props.item && this.props.item.addNotifier) {
            this.props.item.addNotifier({
                fire: () => {
                    // changing state actually rerenders the component!
                    this._forceRerender()
                }
            })
        }
    }

    componentWillUnmount() {
        document.body.removeChild(this.el)
    }

    componentDidMount() {
        this.setState({
            keywords: this.props.item.attributes.keywords
        })
    }

    render() {
        const { item } = this.props

        return ReactDOM.createPortal(
            <div className={classnames('media-dialog', this.props.open && 'open')} onClick={this.props.onRequestClose}>
                <div className={'media-dialog-content'} onClick={this._killPropagation}>
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
                            <div className={'cell small-3'}>
                                <img onClick={this.props.onRequestOverlay}
                                    className={'img'}
                                    alt={item.title}
                                    src={item.url} />
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
                            <button className={'button clear cell auto'} onClick={this.props.onRequestFavorite}>
                                <FontAwesomeIcon icon={[item.attributes.favorite ? 'fas' : 'far', 'heart']} />
                            </button>
                            <button className={'button clear cell auto'} onClick={() => { this.props.onRequestDelete(item.id) }}>
                                <FontAwesomeIcon icon={['fas', 'trash']} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            , this.el
        )
    }

    _forceRerender = () => {
        this.setState({
            keywords: this.props.item.attributes.keywords
        })
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
}
