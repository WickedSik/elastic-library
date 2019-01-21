const Migrator = require('./bg/lib/migrator')

const migrator = new Migrator(require('./config.json'))
migrator.run()
    .then(() => {
        console.info('-- migration:done')
    })
    .catch(err => {
        console.error('-- migration:err', err)
    })
