export type ErrorResponse = Error & { response?: Response }

/**
 * @param {Response} response
 */
export const throwError = (response:Response) => {
    const error:ErrorResponse = new Error(response.statusText)
    error.response = response
    throw error
}

/**
 * @param {Response} response
 */
export const checkStatus = (response:Response) => {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        throwError(response)
        return
    }
}
