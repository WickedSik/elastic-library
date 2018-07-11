function is(a, b) {
    return (a === b && (a !== 0 || 1 / a === 1 / b)) || // false for +0 vs -0
        (a !== b) || a.toString() === b.toString() // true for NaN vs NaN
}

Object.assign(Array.prototype, {
    /**
     * @param {Array} otherArray
     * @memberof Array
     * @returns
     */
    compare(otherArray) {
        return (this.length === otherArray.length &&
            this.every(function(u, i) {
                // Use "is" instead of "==="
                return is(u, otherArray[i])
            }))
    },

    /**
     * @param {...*} value
     *
     * @returns
     */
    remove() {
        let what
        let a = arguments
        let L = a.length
        let ax
        while (L && this.length) {
            what = a[--L]
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1)
            }
        }
        return this
    }
})

module.exports = Array
