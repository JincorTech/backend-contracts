import { AbiMethod } from '../services/fabricapi/interfaces';

export interface DeployContractRequest {
  networkId: string;
  peers: Array<string>;
  initiatorUsername: string;
  abi: Array<AbiMethod>;
  code: string;
  constructorArgs: Array<string>;
}

export interface InvokeContractMethodRequest {
  networkId: string;
  peers: Array<string>;
  initiatorUsername: string;
  abi: Array<AbiMethod>;
  contractAddress: string;
  method: string;
  methodArgs: Array<string>;
  commitTransaction: boolean;
}
