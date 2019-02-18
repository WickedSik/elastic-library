/**
 * @param {Response} response
 */
export const throwError = (response) => {
    const error = new Error(response.statusText)
    error.response = response
    throw error
}

/**
 * @param {Response} response
 */
export const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        throwError(response)
    }
}
