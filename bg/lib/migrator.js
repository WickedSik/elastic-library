const { Client } = require('elasticsearch')
const YAML = require('yaml')
const fs = require('fs')
const path = require('path')

function loadJSON(file) {
    var data = fs.readFileSync(file)
    return JSON.parse(data)
}

module.exports = class Migrator {
    constructor(config) {
        this._clientConfig = config.search
        this._index = config.index

        const cwd = process.cwd()
        const migrationFile = path.resolve(cwd, '.migrate')
        if (fs.existsSync(migrationFile)) {
            this._migrations = loadJSON(migrationFile)
        } else {
            this._migrations = {
                done: []
            }
        }
    }

    get client() {
        if (!this._client) {
            this._client = new Client(this._clientConfig)
        }
        return this._client
    }

    load() {
        return new Promise((resolve, reject) => {
            fs.readdir(path.resolve(process.cwd(), 'migrations'), (err, files) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(files)
                }
            })
        })
    }

    run() {
        return new Promise((resolve, reject) => {
            this.load().then(files => {
                console.info('-- migration:files', files)

                if (files.length === 0) {
                    throw new Error('No migration files')
                }

                const toRun = files.filter(file => this._migrations.done.indexOf(file) === -1).sort()
                const runMigration = () => {
                    if (toRun.length > 0) {
                        console.info('-- migration:run', toRun.length)

                        const migrationFile = toRun.shift()

                        this.migrate(path.resolve(process.cwd(), 'migrations', migrationFile))
                            .then(() => {
                                console.info('-- migrated', migrationFile)

                                this._migrations.done.push(migrationFile)
                            })
                            .then(runMigration)
                    } else {
                        console.info('-- migration:run', toRun.length)

                        fs.writeFile(path.resolve(process.cwd(), '.migrate'), JSON.stringify(this._migrations), err => {
                            err ? reject(err) : resolve()
                        })
                    }
                }

                console.info('-- migration:initial run', toRun.length)
                if (toRun.length > 0) {
                    runMigration()
                } else {
                    console.info('-- migration:initial run', toRun.length)

                    fs.writeFile(path.resolve(process.cwd(), '.migrate'), JSON.stringify(this._migrations), err => {
                        err ? reject(err) : resolve()
                    })
                }
            }).catch(err => {
                console.error('-- migration:load', err)
            })
        })
    }

    migrate(migrationFile) {
        const data = YAML.parse(fs.readFileSync(migrationFile).toString())
        const { settings, mapping } = data

        return this.exists().then(exists => {
            return exists
                ? this.update(settings, mapping)
                : this.create(settings, mapping)
        })
    }

    exists() {
        return this.client.indices.exists({
            index: this._index
        })
    }

    create(newSettingConfig, newMappingConfig) {
        return this.client.indices.create({
            index: this._index,
            body: {
                settings: newSettingConfig,
                mappings: newMappingConfig
            }
        })
    }

    update(newSettingConfig, newMappingConfig) {
        const tmpIndex = `${this._index}-tmp-docs`

        return this.client.indices.create({
            index: tmpIndex,
            body: {
                settings: newSettingConfig,
                mappings: newMappingConfig
            }
        })
            .catch(err => {
                console.error('-- updater:tmp not created', err)
                process.exit(0)
            })
            .then(() => {
                console.info('-- updater:tmp created')

                return this.client.reindex({
                    body: {
                        size: 100000,
                        conflicts: 'proceed',
                        source: {
                            index: this._index
                        },
                        dest: {
                            index: tmpIndex,
                            op_type: 'create'
                        }
                    }
                })
            })
            .catch(err => {
                console.error('-- updater:reindex failed', err)
                process.exit(0)
            })
            .then(() => {
                console.info('-- updater:reindex complete')

                return this.client.indices.delete({
                    index: this._index
                })
            })
            .catch(err => {
                console.error('-- updater:index not deleted', err)
                process.exit(0)
            })
            .then(() => {
                console.info('-- updater:index deleted')

                return this.client.indices.create({
                    index: this._index,
                    body: {
                        settings: newSettingConfig,
                        mappings: newMappingConfig
                    }
                })
            })
            .catch(err => {
                console.error('-- updater:index not created', err)
                process.exit(0)
            })
            .then(() => {
                console.info('-- updater:index created')

                return this.client.reindex({
                    body: {
                        size: 100000,
                        conflicts: 'proceed',
                        source: {
                            index: tmpIndex
                        },
                        dest: {
                            index: this._index,
                            op_type: 'create'
                        }
                    }
                })
            })
            .catch(err => {
                console.error('-- updater:reindex failed', err)
                process.exit(0)
            })
            .then(() => {
                console.info('-- updater:reindex completed')

                return this.client.indices.delete({
                    index: tmpIndex
                })
            })
            .catch(err => {
                console.error('-- updater:tmp not deleted', err)
                process.exit(0)
            })
    }
}
