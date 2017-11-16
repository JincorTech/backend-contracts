import { injectable } from 'inversify';
import 'reflect-metadata';

import { Logger } from '../logger';

// IoC
export const ContractApplicationType = Symbol('ContractApplicationType');

/**
 * Contract application.
 */
@injectable()
export class ContractApplication {
  private logger = Logger.getInstance('CONTRACT_APPLICATION');

  async deployContract() {
    throw new Error('Not implemented');
  }

  async invokeContract() {
    throw new Error('Not implemented');
  }
}
