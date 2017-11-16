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
    throw new Error('Not implemented');
  }

  @httpPost(
    '/contracts/{contract}/actions/invoke',
    'InvokeEvmContractMethodRequestValidator'
  )
  async invokeEvmContractMethod(req: AuthenticatedRequest, res: Response): Promise<void> {
    throw new Error('Not implemented');
  }
}
