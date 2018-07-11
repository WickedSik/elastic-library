const unflatten = function(data) {
    if (Object(data) !== data || Array.isArray(data)) {
        return data
    }

    let result = {}
    let cur
    let prop
    let idx
    let last
    let temp

    for (let p in data) {
        cur = result
        prop = ''
        last = 0

        do {
            idx = p.indexOf('.', last)
            temp = p.substring(last, idx !== -1 ? idx : undefined)
            cur = cur[prop] || (cur[prop] = (!isNaN(parseInt(temp)) ? [] : {}))
            prop = temp
            last = idx + 1
        } while (idx >= 0)

        cur[prop] = data[p]
    }
    return result['']
}

module.exports = unflatten
