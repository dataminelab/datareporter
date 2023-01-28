import { BigQuery } from '@google-cloud/bigquery';
import { PlywoodLocator, PlywoodRequester } from 'plywood-base-api';
import { Readable } from 'readable-stream';

interface BigQueryRequesterParams {
  locator?: PlywoodLocator;
  keyFilename: string;
}

/**
 * BigQueryRequester - depends on google-cloud sdk, runs queries, moved in from bigquery-plywood-requester repo for convenience
 */
export function BigQueryRequester(parameters: BigQueryRequesterParams): PlywoodRequester<string> {
  const client = new BigQuery({
    keyFilename: parameters.keyFilename
  });

  return (request): Readable => {
    const query = request.query;

    const stream = new Readable({
      objectMode: true,
      read: function() {
      }
    });

    client.createQueryStream({
      query,
      useLegacySql: false
    }).on('data', (row) => {
      stream.push(row);
    }).on('end', () => {
      stream.push(null);
    }).on('error', (error) => {
      stream.emit('error', error);
    });

    return stream;
  };
}