import * as abi from 'ethereumjs-abi';

import config from '../../config';
import { Logger } from '../../logger';
import { FabricApiClient } from './client.service';
import { UserRequest, RequestMethod, NetworkRequest, AbiMethod } from './interfaces';
import { ContractDeployException, ContractInvokeException } from './exceptions';

/**
 * Service for query datas
 */
export class QueryFabric {

  protected logger: Logger = Logger.getInstance('QUERY_FABRIC');

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
   * Query transaction status
   */
  public async queryTransactionStatusByHash(transactionHash: string): Promise<string> {
    this.logger.verbose('Query transaction by hash', transactionHash, 'by', this.initiatorUsername);

    if (!/^(0x)?[\da-fA-F]{64,64}$/.test(transactionHash)) {
      throw new Error('Invalid transaction hash format');
    }

    try {
      const result = await this.fabricApi
        .callApi<{data: any}>(RequestMethod.POST,
          `/channels/${this.networkId}/transactions/actions/query`, {
            peers: this.peers,
            transaction: transactionHash.indexOf('0x') === 0 ?
              transactionHash.slice(2) : transactionHash
          });

      if (!result.data || !result.data.transactionEnvelope ||
        !result.data.transactionEnvelope.payload.data.actions.length) {
        throw new Error('There is no transaction data');
      }

      const actions = result.data.transactionEnvelope.payload.data.actions;
      const chaincodeActions = actions.filter(a => a.payload.action.proposal_response_payload.extension.chaincode_id);
      const responses = chaincodeActions.map(a => a.payload.action.proposal_response_payload.extension.response);

      this.logger.debug('Responses:', transactionHash, responses);
      for (let i = 0; i < responses.length; i += 1) {
        if (responses[i].status === 200) {
          return 'success';
        }
      }

      return 'failure';
    } catch (error) {
      this.logger.warn('Query transcation failed', error);
    }
    return 'pending';
  }
}
