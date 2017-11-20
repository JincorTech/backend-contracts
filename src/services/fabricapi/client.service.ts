import * as fs from 'fs';
import * as LRU from 'lru-cache';
import * as request from 'web-request';

import config from '../../config';
import { Logger } from '../../logger';
import { UserRequest, RequestMethod } from './interfaces';
import { UNAUTHORIZED } from 'http-status';
import { FabricApiClientException } from './exceptions';

let cachedToken: string;

/**
 * Fabric Api Client.
 */
export class FabricApiClient {
  protected logger: Logger = Logger.getInstance('FABRIC_API_CLIENT');

  constructor() {
    if (!config.fabricapi.username) {
      throw new Error('Username for fabricapi is empty');
    }
    if (!config.fabricapi.password) {
      throw new Error('Password for fabricapi is empty');
    }
    request.defaults({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      throwResponseError: true
    });
  }

  // Default tls options
  private static agentOptions = config.fabricapi.tls ? {
    ca: fs.readFileSync(config.fabricapi.tlsCa),
    cert: fs.readFileSync(config.fabricapi.tlsPubKey),
    key: fs.readFileSync(config.fabricapi.tlsPrivKey),
    pass: config.fabricapi.tlsPrivKeyPass
  } : undefined;

  /**
   * Get auth token for known fabricapi user
   */
  protected async getAuthToken() {
    if (cachedToken) {
      this.logger.verbose('Get cached token');
      return cachedToken;
    }

    this.logger.verbose('Retrieve new token');
    return (cachedToken = (await FabricApiClient.requestByMethod<{token: string}>(RequestMethod.POST, '/auth/login', '', {
      username: config.fabricapi.username,
      password: config.fabricapi.password
    })).token);
  }

  /**
   * Call fabric api method. Getting auth. token automatically.
   *
   * @param method
   * @param url
   * @param data
   */
  public async callApi<T>(method: RequestMethod, url: string, data: any): Promise<T> {
    this.logger.verbose('Call api', method, url, data);

    for (let attempts = 0; ; attempts++) {
      const token = await this.getAuthToken();
      try {
        return (await FabricApiClient.requestByMethod<T>(RequestMethod.POST, url, token, data));
      } catch (err) {
        if (!attempts && err.response && err.response.statusCode === UNAUTHORIZED) {
          cachedToken = '';
          this.logger.verbose('Auth token expired, cached token had cleaned, retry');
          continue;
        }

        // if error isn't auth. error buble it
        this.logger.error('Error was occurred', err);
        throw err;
      }
    }
  }

  /**
   * Request api method
   *
   * @param url
   * @param method
   * @param jwtToken
   * @param data
   */
  private static async requestByMethod<T>(method: RequestMethod, url: string, jwtToken: string, data: any): Promise<T> {
    const response = await request.json<any>(config.fabricapi.apiUrl + url, {
      timeout: config.fabricapi.timeout,
      auth: {
        bearer: jwtToken
      },
      body: data,
      agentOptions: FabricApiClient.agentOptions,
      method
    });

    return response;
  }

}
