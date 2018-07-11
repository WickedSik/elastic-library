const flatten = (input, flat = {}, prefix = '') => {
    if (input instanceof Object) {
        Object.keys(input).forEach((key) => {
            if (!(input[key] instanceof Object) || (input[key] instanceof Function) || (input[key] instanceof String) || (input[key] instanceof Array)) {
                flat[(prefix ? prefix + '.' + key : key)] = input[key]
            } else {
                flatten(input[key], flat, (prefix ? prefix + '.' + key : key))
            }
        })
    }

    return flat
}

module.exports = flatten
