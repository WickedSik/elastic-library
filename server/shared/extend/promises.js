/* eslint no-extend-native: 0 */
Promise.prototype.finally = function(callback) {
    const P = this.constructor

    // We don’t invoke the callback in here,
    // because we want then() to handle its exceptions
    return this.then(
        // Callback fulfills => continue with receiver’s fulfillment or rejection
        // Callback rejects => pass on that rejection (then() has no 2nd parameter!)
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason })
    )
}

module.exports = Promise
