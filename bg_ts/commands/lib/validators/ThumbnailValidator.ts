import Elastic, { SummaryResult } from '../elastic'
import { Progressbar } from '../utils/progressbar'
import Logger from '../utils/logger'
import { Validator } from '../../doctor'
import chalk from 'chalk';

export default class ThumbnailValidator implements Validator {
    async run(client:Elastic, logger:Logger):Promise<any> {
        const documents = await client.getSummary(undefined, {
            bool: {
                must_not: [
                    { exists: { field: 'image.thumbnail' } }
                ]
            }
        })

        logger.info(chalk`found {yellow %d documents without thumnail}`, documents.length)

        await client.client.deleteByQuery({
            index: 'media',
            type: 'media',
            body: {
                query: {
                    bool: {
                        must_not: [
                            { exists: { field: 'image.thumbnail' } }
                        ]
                    }
                }
            }
        })

        logger.info('deleted')
    }
}