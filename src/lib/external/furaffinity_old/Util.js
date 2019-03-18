export const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}

export const figure = (obj) => {
    var figure = obj.children()
    var a = figure.eq(0).children().eq(0).children().eq(0)
    var f = figure.eq(1).children()
    return {
        url: 'https://furaffinity.net' + a.attr('href'),
        src: 'https:' + a.children().eq(0).attr('src'),
        title: f.eq(0).children().eq(0).attr('title'),
        author: {
            name: f.eq(1).children().eq(1).attr('title'),
            url: 'https://furaffinity.net' + f.eq(1).children().eq(1).attr('href')
        }
    }
}
