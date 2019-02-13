import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Dialog from '../Dialog'
import { renameKeyword, getSummary, update } from '../../../store/modules/search/api'
import { CHECKED_ON_BOORU } from '../../../store/modules/search/actiontypes'

import './style.scss'

const promiseSerial = funcs =>
    funcs.reduce((promise, func) =>
        promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([]))

export default class SettingsDialog extends React.Component {
    static propTypes = {
        onRequestClose: PropTypes.func.isRequired
    }

    static defaultProps = {
        onRequestClose: () => {}
    }

    state = {
        pending: false,
        success: false,
        error: null,
        count: 0,
        total: 0
    }

    render() {
        const percentage = this.state.total === 0
            ? 0
            : Math.floor((this.state.count / this.state.total) * 100)

        return (
            <Dialog title={'Utilities'} killPropagation onRequestClose={this.props.onRequestClose}>
                <div className={'grid-x'}>
                    <div className={'cell auto'}>
                        <div className={'progress success'} role={'progressbar'}>
                            <div className='progress-meter' style={{ width: `${percentage}%` }}>
                                <p className={'progress-meter-text'}>{this.state.count} / {this.state.total}</p>
                            </div>
                        </div>
                        <div>
                            <button className={'button'} onClick={event => {
                                event.stopPropagation()
                                event.preventDefault()

                                this._queueDocs()
                            }}>Check with E621</button>
                        </div>
                    </div>
                </div>
            </Dialog>
        )
    }

    _renameTag = (oldTag, newTag) => {
        renameKeyword(oldTag, newTag)
            .then(() => {
                this.setState({
                    pending: false,
                    success: true
                })
            }).catch(error => {
                this.setState({
                    pending: false,
                    success: false,
                    error
                })
            })
    }

    // queue docs for checking with booru
    _queueDocs = () => {
        const exclude = {
            query_string: {
                default_field: 'keywords',
                query: '-checked_on_e621'
            }
        }

        getSummary(['checksum', 'keywords'], exclude).then(sums => {
            console.info('-- checksums:result', sums, sums.length)

            this.setState({
                total: sums.length
            })

            const funcs = sums.map((data, index) => {
                return () => {
                    return this._checkBooru({
                        keywords: [],
                        ...data
                    })
                }
            })

            promiseSerial(funcs)
                .then(finalResult => {
                    console.info('-- finally done!', finalResult)
                })
                .catch(err => {
                    console.info('-- it failed', err)
                })
        })
    }

    // check booru, I know.. it's cheap
    _checkBooru = (item) => new Promise(resolve => {
        if (item.keywords.indexOf(CHECKED_ON_BOORU) > -1) {
            this.setState(state => {
                console.info('-- state:n', state.total, state.count, state.count / state.total)
                return {
                    count: state.count + 1
                }
            }, () => {
                resolve(item)
            })
            return
        }

        setTimeout(() => {
            fetch(`booru://e621/${item.checksum}`)
                .then(result => result.json())
                .then(result => {
                    if (!result.id) {
                        const keywords = [...item.keywords, CHECKED_ON_BOORU]
                        item.keywords = _.uniq(keywords)

                        resolve(this._update(item.id, item))
                    } else {
                        item.author = result.artist
                        item.source = result.source
                        item.rating = (rating => {
                            switch (rating) {
                                case 'q': return 'questionable'
                                case 's': return 'safe'
                                case 'e': return 'explicit'
                            }
                        })(result.rating)

                        const keywords = [...item.keywords, ...result.tags.split(/\s+/g), 'e621', CHECKED_ON_BOORU]

                        item.keywords = _.uniq(keywords)

                        resolve(this._update(item.id, item))
                    }
                })
        }, 2500)
    })

    _update = (id, data) => new Promise(resolve => {
        const query = {
            id,
            index: 'media',
            type: 'media',
            body: {
                doc: data
            }
        }

        update(query).then(() => {
            this.setState(state => {
                console.info('-- state:u', state.total, state.count, state.count / state.total)
                return {
                    count: state.count + 1
                }
            }, () => {
                resolve(id)
            })
        })
    })
}
