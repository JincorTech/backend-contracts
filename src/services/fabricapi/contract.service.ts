import * as abi from 'ethereumjs-abi';

import config from '../../config';
import { Logger } from '../../logger';
import { FabricApiClient } from './client.service';
import { UserRequest, RequestMethod, NetworkRequest, AbiMethod } from './interfaces';
import { ContractDeployException, ContractInvokeException } from './exceptions';

/**
 * Service for evm contracts
 */
export class FabricApiEvmContract {

  protected logger: Logger = Logger.getInstance('FABRIC_API_EVM_CONTRACT');

  /**
   * @param fabricApi
   * @param networkId
   * @param peers
   * @param initiatorUsername
   */
  constructor(
    protected fabricApi: FabricApiClient,
    protected networkId: string,
    protected peers: Array<string>,
    protected initiatorUsername: string
  ) {
  }

  /**
   * Deploy contract and return contract address
   */
  public async deploy(abiDesc: Array<AbiMethod>, code: string, constructorArgs: Array<any>): Promise<any> {
    this.logger.verbose('Deploy contract', this.initiatorUsername);

    const constructorAbiParams = abiDesc.filter(abiMethod => abiMethod.type === 'constructor').pop();
    if (constructorArgs.length > 0 && !constructorAbiParams) {
      throw new ContractDeployException('No abi record for constructor');
    }

    if (constructorArgs.length !== constructorAbiParams.inputs.length) {
      throw new ContractDeployException('Invalid arguments count for constructor');
    }

    const constructorArgsAsHex = abi.rawEncode(constructorAbiParams.inputs.map(param => param.type), constructorArgs)
      .toString('hex');

    const deployResult = await this.fabricApi
      .callApi<{result: any}>(RequestMethod.POST,
        `/channels/${this.networkId}/chaincodes/${config.fabricapi.evmChaincode}/actions/invoke`, {
          peers: this.peers,
          eventPeer: this.peers[0],
          initiatorUsername: this.initiatorUsername,
          commitTransaction: true,
          method: 'DeployContractHexArgs',
          args: [code].concat(constructorArgsAsHex ? [constructorArgsAsHex] : ['00'])
        });
    const response = deployResult.result.result[0].response;

    if (response.status !== 200) {
      throw new ContractDeployException('Can\'t deploy contract');
    }
    return {
      transaction: deployResult.result.transaction,
      address: (new Buffer(response.payload.data)).toString('hex').slice(24)
    };
  }

  /**
   * Invoke contract method
   */
  public async invoke(
    abiDesc: Array<AbiMethod>,
    contractAddress: string,
    methodName: string,
    returnTypes: string,
    methodArgs: Array<string>,
    commitTransaction: boolean = false
  ): Promise<any> {
    this.logger.verbose('Invoke contract method', contractAddress, methodName);

    const methodAbiParams = abiDesc.filter(abiMethod => abiMethod.name === methodName && abiMethod.type === 'function').pop();
    if (!methodAbiParams) {
      throw new ContractInvokeException('No abi record for function ' + methodName);
    }

    if (methodArgs.length !== methodAbiParams.inputs.length) {
      throw new ContractDeployException('Invalid arguments count for method');
    }

    const methodAbiArgTypes = methodAbiParams.inputs.map(param => param.type);

    // Encode methodName and method args
    const methodArgsAsHex = abi.methodID(methodName, methodAbiArgTypes).toString('hex') +
      abi.rawEncode(methodAbiArgTypes, methodArgs).toString('hex');

    const invokeResult = await this.fabricApi
      .callApi<{result: any}>(RequestMethod.POST,
        `/channels/${this.networkId}/chaincodes/${config.fabricapi.evmChaincode}/actions/invoke`, {
          initiatorUsername: this.initiatorUsername,
          peers: this.peers,
          eventPeer: this.peers[0],
          commitTransaction,
          method: 'InvokeContractMethodHexArgs',
          args: [contractAddress].concat(methodArgsAsHex ? [methodArgsAsHex] : [''])
        });

    let result = {};
    const response = commitTransaction ?
      invokeResult.result.result[0].response : invokeResult.result[0].response;

    if (response.status !== 200) {
      throw new ContractDeployException('Can\'t invoke contract');
    }

    if (returnTypes) {
      result = abi.rawDecode(returnTypes.match(/([^() ,]+)/g), new Buffer(response.payload.data, 'hex'));
    }

    return {
      transaction: invokeResult.result.transaction,
      result
    };
  }

}
