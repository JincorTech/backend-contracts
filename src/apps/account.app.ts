import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import config from '../config';
import { Logger } from '../logger';
import { FabricApiClient } from '../services/fabricapi/client.service';
import { FabricApiCertificate } from '../services/fabricapi/certificate.service';
import { MessageQueueType } from '../services/mq/natsmq.service';
import { MessageQueue } from '../services/mq/interfaces';
import { FabricApiEvmContract } from '../services/fabricapi/contract.service';
import { EnrollResponse } from '../services/fabricapi/interfaces';

// IoC
export const AccountApplicationType = Symbol('AccountApplicationType');

/**
 * Accounts application.
 */
@injectable()
export class AccountApplication {
  private logger = Logger.getInstance('ACCOUNT_APPLICATION');

  private fabricapiClient: FabricApiClient = new FabricApiClient();
  private fabricApiCertificate: FabricApiCertificate;

  constructor(
    @inject(MessageQueueType) private messageQueue: MessageQueue
  ) {
    this.fabricApiCertificate = new FabricApiCertificate(this.fabricapiClient);
  }

  /**
   * Register an account
   *
   * @param userLogin
   * @param userPassword
   */
  async registerAccount(userLogin: string, userPassword: string): Promise<EnrollResponse> {
    const sanitizedLogin = userLogin.replace(/[:]/g, '.');

    this.logger.verbose('Register a new user', sanitizedLogin);
    try {
      await this.fabricApiCertificate.register(config.fabricapi.regUser, sanitizedLogin, userPassword);
    } catch (error) {
      if (!error.response || !error.response.body.message || !/already registered/.test(error.response.body.message)) {
        throw error;
      }
    }

    this.logger.verbose('Enroll certificate for user', sanitizedLogin);

    const enrollResult = await this.fabricApiCertificate.enroll(sanitizedLogin, userPassword);

    return {
      username: sanitizedLogin,
      address: enrollResult.address
    };
  }
}
