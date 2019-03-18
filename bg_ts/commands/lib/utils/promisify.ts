export default async function promisify(method, ...parameters:any[]):Promise<any> {
    return new Promise((resolve, reject) => {
        method(...parameters, (err:any, result:any) => {
            if(err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}