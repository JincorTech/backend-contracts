import * as LRU from 'lru-cache';
import * as request from 'web-request';
import * as fs from 'fs';
import { injectable } from 'inversify';
import 'reflect-metadata';

import config from '../config';
import { AuthenticationException } from './exceptions';
import { Logger } from '../logger';

export const AuthenticationServiceType = Symbol('AuthenticationServiceType');

/**
 * AuthenticationService interface
 */
export interface AuthenticationService {

  validateUser(jwtToken: string): Promise<VerificationResult>;
  validateTenant(jwtToken: string): Promise<VerificationResult>;

}

/**
 * ExternalHttpJwtAuthenticationService class
 */
@injectable()
export class ExternalHttpJwtAuthenticationService implements AuthenticationService {
  private logger: Logger = Logger.getInstance('EXTERNAL_HTTP_JWT_AUTH');

  private userVerifyUrl: string = config.auth.verifyUrl;
  private tenantVerifyUrl: string = config.auth.tenantVerifyUrl;
  private timeout: number = config.auth.timeout;
  private agentOptions: any;

  constructor() {
    if (!config.auth.accessJwt) {
      throw new Error('AUTH jwt token is empty');
    }
    if (config.auth.tls) {
      this.agentOptions = {
        ca: fs.readFileSync(config.auth.caFile),
        cert: fs.readFileSync(config.auth.certFile),
        key: fs.readFileSync(config.auth.keyFile),
        passphrase: config.auth.keyPass
      };
    }
    request.defaults({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      throwResponseError: true
    });
  }

  /**
   * Validate user JWT token
   * @param jwtToken
   */
  async validateUser(jwtToken: string): Promise<VerificationResult> {
    this.logger.verbose('Validate user token');

    if (!jwtToken) {
      return null;
    }

    return await this.callVerifyJwtTokenMethodEndpoint(jwtToken, this.userVerifyUrl);
  }

  /**
   * Validate tenant JWT token
   * @param jwtToken
   */
  async validateTenant(jwtToken: string): Promise<VerificationResult> {
    this.logger.verbose('Validate tenant token');

    if (!jwtToken) {
      return null;
    }

    return await this.callVerifyJwtTokenMethodEndpoint(jwtToken, this.tenantVerifyUrl);
  }

  /**
   * Make HTTP/HTTPS request
   * @param jwtToken
   */
  private async callVerifyJwtTokenMethodEndpoint(jwtToken: string, apiUrl: string): Promise<VerificationResult> {
    try {
      /* istanbul ignore next */
      const response = await request.json<{decoded: any}>(apiUrl, {
        timeout: this.timeout,
        auth: {
          bearer: config.auth.accessJwt
        },
        body: { token: jwtToken },
        method: 'post'
      });

      return response.decoded;
    } catch (e) {
      if (e.statusCode !== 200 || !e.content.decoded) {
        throw new AuthenticationException('Invalid token');
      }

      this.logger.error('Error was occurred when call auth', e);

      throw new AuthenticationException(e.content);
    }
  }
}

/**
 * Cache decorator for only successfully request
 */
export class CachedAuthenticationDecorator implements AuthenticationService {
  private lruCache: any;

  /**
   * @param authenticationService
   * @param maxAgeInSeconds
   * @param maxLength
   */
  constructor(private authenticationService: AuthenticationService, maxAgeInSeconds: number = 20, maxLength: number = 1024) {
    this.lruCache = LRU({
      max: maxLength,
      maxAge: maxAgeInSeconds * 1000
    });
  }

  /**
   * @inheritdoc
   */
  async validateUser(jwtToken: string): Promise<VerificationResult> {
    try {
      if (this.lruCache.has(jwtToken)) {
        return this.lruCache.get(jwtToken);
      }

      const result = await this.authenticationService.validateUser(jwtToken);
      this.lruCache.set(jwtToken, result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @inheritdoc
   */
  async validateTenant(jwtToken: string): Promise<VerificationResult> {
    try {
      if (this.lruCache.has(jwtToken)) {
        return this.lruCache.get(jwtToken);
      }

      const result = await this.authenticationService.validateTenant(jwtToken);
      this.lruCache.set(jwtToken, result);
      return result;
    } catch (err) {
      throw err;
    }
  }
}
