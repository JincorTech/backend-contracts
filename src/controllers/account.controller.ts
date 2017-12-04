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
 * Accounts resource
 */
@injectable()
@controller(
  '/api/accounts',
  'AuthMiddleware'
)
export class AccountController {
  constructor(
    @inject(AccountApplicationType) private accountApp: AccountApplication
  ) {
  }

  @httpPost(
    '',
    'AccountRegisterRequestValidator'
  )
  async registerAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const registeredLogin = await this.accountApp.registerAccount(
        getLogin(req.tokenDecoded, req.body.isCorporate),
        req.body.password
      );
      res.json(registeredLogin);
    } catch (error) {
      responseAsUnbehaviorError(res, error);
    }
  }
}
