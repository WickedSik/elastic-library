import Datastore from 'nedb'

export type UpdateResult = {
    id: string
}

export type DatabaseResult = {
    [key:string]: any
}

export default class Database {
    private connection:Datastore

    async connect() {
        if(!this.connection) {
            this.connection = new Datastore({
                filename: '.elastic-library.nedb',
                autoload: true
            })

            this.connection.ensureIndex({
                fieldName: 'checksum',
                unique: true,
                sparse: true
            })
        }

        return this.connection
    }

    async insert(doc:any):Promise<UpdateResult> {
        return new Promise((resolve, reject) => {
            this.connection.insert(doc, (err:any, newDoc:any) => {
                err
                    ? reject(err)
                    : resolve(newDoc)
            })
        })
    }

    async update(id:string, doc:any):Promise<void> {        
        return new Promise((resolve, reject) => {
            this.connection.update({ _id: id }, doc, {}, (err:any) => {
                err
                    ? reject(err)
                    : resolve()
            })
        })
    }

    async delete(id:string, rev:string):Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.remove({ _id: id}, {}, (err:any) => {
                err
                    ? reject(err)
                    : resolve()
            })
        })
    }

    async find(query:any):Promise<any> {
        return new Promise((resolve, reject) => {
            this.connection.find(query, (err:any, docs:any) => {
                err
                    ? reject(err)
                    : resolve(docs)
            })
        })
    }

    async get(id:string):Promise<DatabaseResult> {
        return new Promise((resolve, reject) => {
            this.connection.findOne({ _id: id }, (err:any, doc:any) => {
                err
                    ? reject(err)
                    : resolve(doc)
            })
        })
    }

    async getMany(ids:string[]):Promise<DatabaseResult[]> {
        return new Promise((resolve, reject) => {
            this.connection.find({ _id: { $in: ids } }, (err:any, docs:any) => {
                err
                    ? reject(err)
                    : resolve(docs)
            })
        })
    }
}
