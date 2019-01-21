module.exports = class Parser {
    parse(metadata) {
        throw new Error('Override this method!')
    }

    get mapping() {
        return {}
    }

    accepts(file) {
        return /(.+)\.(jpe?g|png|gif)/.test(file)
    }

    get runsForExistingItems() {
        return false
    }
}
