import { loginAsHash } from '../helpers/logins';
import { DeployContractRequest, InvokeContractMethodRequest } from './interfaces';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { Logger } from '../logger';
import { FabricApiClient } from '../services/fabricapi/client.service';
import { FabricApiEvmContract } from '../services/fabricapi/contract.service';
import * as request from 'web-request';

// IoC
export const ContractApplicationType = Symbol('ContractApplicationType');

/**
 * Contract application.
 */
@injectable()
export class ContractApplication {
  private logger = Logger.getInstance('CONTRACT_APPLICATION');
  private client = new FabricApiClient();

  /**
   * @param request
   */
  async deployContract(request: DeployContractRequest) {
    const sanitizedLogin = request.initiatorUsername.replace(/[:]/g, '.');
    const svc = new FabricApiEvmContract(this.client, request.networkId, request.peers, loginAsHash(sanitizedLogin));

    this.logger.verbose('Deploy contract by', sanitizedLogin, loginAsHash(sanitizedLogin));

    if (!/^(0x)?[\da-fA-F]+$/.test(request.code)) {
      throw new Error('Invalid hex code format');
    }

    let code = request.code.indexOf('0x') === 0 ? request.code.slice(2) : request.code;
    if (code.length & 1) {
      code = '0' + code;
    }

    const result = await svc.deploy(request.abi, code, request.constructorArgs);
    return result;
  }

  /**
   * @param request
   */
  async invokeContract(request: InvokeContractMethodRequest) {
    const sanitizedLogin = request.initiatorUsername.replace(/[:]/g, '.');
    const svc = new FabricApiEvmContract(this.client, request.networkId, request.peers, loginAsHash(sanitizedLogin));

    this.logger.verbose('Invoke contract by', sanitizedLogin, loginAsHash(sanitizedLogin));

    if (!/^[\da-fA-F]{40,64}$/.test(request.contractAddress)) {
      throw new Error('Invalid hex code format');
    }

    const result = await svc.invoke(request.abi, request.contractAddress, request.method, request.methodArgs, request.commitTransaction);
    return result;
  }
}
