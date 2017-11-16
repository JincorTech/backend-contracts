import config from '../../config';
import { Logger } from '../../logger';
import { FabricApiClient } from './client.service';
import { UserRequest, RequestMethod, NetworkRequest } from './interfaces';

/**
 * Service for evm contracts
 */
export class FabricApiEvmContract {

  protected logger: Logger = Logger.getInstance('FABRIC_API_EVM_CONTRACT');

  constructor(protected fabricApi: FabricApiClient) {
  }

  /**
   * Deploy contract
   */
  public async deploy(): Promise<boolean> {
    return false;
  }

  /**
   * Invoke contract method
   */
  public async invoke(): Promise<boolean> {
    return false;
  }

}
