const _ = require('lodash')
const Import = require('./tasks/import')
const config = require('../config.json')

const sendMessage = function(event, payload) {
    console.info('process >>:', event)

    process.send({
        event, payload
    })
}

const deferredNewFile = _.debounce(metadata => {
    sendMessage('new.file', {
        title: metadata.get('title'),
        file: metadata.getFilePath()
    })
}, 5000)

const importer = new Import(config)

importer.on('started', () => {
    sendMessage('import.started')
})
importer.on('new.file', metadata => {
    deferredNewFile(metadata)
})
importer.on('done', () => {
    sendMessage('import.done')
})

process.on('message', message => {
    console.info('>> process:', message)
    const { event } = JSON.parse(message)

    switch (event) {
        case 'import':
            importer.start()
            sendMessage('import.starting')
            break
    }
})

setTimeout(() => {
    sendMessage('init')
}, 5000)

// setInterval(() => {
//     sendMessage('ping')
// }, 25000)
