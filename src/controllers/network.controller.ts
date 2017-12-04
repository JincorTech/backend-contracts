import { getLogin } from '../helpers/logins';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { controller, httpDelete, httpPost } from 'inversify-express-utils';
import 'reflect-metadata';

import { AuthenticatedRequest } from '../interfaces';
import { AccountApplication, AccountApplicationType } from '../apps/account.app';
import { ContractApplication, ContractApplicationType } from '../apps/contract.app';
import { responseAsUnbehaviorError } from '../helpers/responses';

/**
 * Networks resource
 */
@injectable()
@controller(
  '/api/networks/:network',
  'AuthMiddleware'
)
export class NetworkController {
  constructor(
    @inject(ContractApplicationType) private contractApp: ContractApplication
  ) {
  }

  @httpPost(
    '/contracts',
    'DeployEvmContractRequstValidator'
  )
  async deployEvmContract(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.contractApp.deployContract({
        initiatorUsername: getLogin(req.tokenDecoded, req.body.isCorporate),
        networkId: req.params.network,
        peers: req.body.peers,
        abi: JSON.parse(req.body.abi),
        code: req.body.code,
        constructorArgs: req.body.args
      });
      res.json({
        result
      });
    } catch (error) {
      console.log('Error', error);
      responseAsUnbehaviorError(res, error);
    }
  }

  @httpPost(
    '/contracts/:contract/actions/invoke',
    'InvokeEvmContractMethodRequestValidator'
  )
  async invokeEvmContractMethod(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.contractApp.invokeContract({
        contractAddress: req.params.contract,
        initiatorUsername: getLogin(req.tokenDecoded, req.body.isCorporate),
        networkId: req.params.network,
        peers: req.body.peers,
        abi: JSON.parse(req.body.abi),
        method: req.body.method,
        methodArgs: req.body.args,
        commitTransaction: typeof req.body.commitTransaction === 'undefined' ? true : req.body.commitTransaction
      });
      res.json({
        result
      });
    } catch (error) {
      console.log('Error', error);
      responseAsUnbehaviorError(res, error);
    }
  }
}
