import { interfaces as InversifyInterfaces, Container } from 'inversify';
import { interfaces, TYPE } from 'inversify-express-utils';
import * as express from 'express';

import * as commonMiddlewares from './middlewares/common';
import * as validators from './middlewares/request.validators';
import * as auths from './services/auth.service';
import * as mqInterfaces from './services/mq/interfaces';
import * as natsmq from './services/mq/natsmq.service';
import * as accounts from './apps/account.app';
import * as contracts from './apps/contract.app';

import { NetworkController } from './controllers/network.controller';
import { AccountController } from './controllers/account.controller';

let container = new Container();

// services
container.bind<auths.AuthenticationService>(auths.AuthenticationServiceType)
.toDynamicValue((context: InversifyInterfaces.Context): auths.AuthenticationService => {
  return new auths.CachedAuthenticationDecorator(
    context.container.resolve(auths.ExternalHttpJwtAuthenticationService)
  );
}).inSingletonScope();

container.bind<mqInterfaces.MessageQueue>(natsmq.MessageQueueType)
.to(natsmq.NatsMQ).inSingletonScope();

// application services
container.bind<accounts.AccountApplication>(accounts.AccountApplicationType)
  .to(accounts.AccountApplication);

container.bind<contracts.ContractApplication>(contracts.ContractApplicationType)
  .to(contracts.ContractApplication);

// middlewares
container.bind<commonMiddlewares.AuthMiddleware>(commonMiddlewares.AuthMiddlewareType)
  .to(commonMiddlewares.AuthMiddleware);

const authMiddleware = container
  .get<commonMiddlewares.AuthMiddleware>(commonMiddlewares.AuthMiddlewareType);

/* istanbul ignore next */
container.bind<express.RequestHandler>('AuthMiddleware').toConstantValue(
  (req: any, res: any, next: any) => authMiddleware.execute(req, res, next)
);

// request validators
container.bind<express.RequestHandler>('AccountRegisterRequestValidator').toConstantValue(
  (req: any, res: any, next: any) => validators.accountRegisterRequest(req, res, next)
);
container.bind<express.RequestHandler>('DeployEvmContractRequstValidator').toConstantValue(
  (req: any, res: any, next: any) => validators.deployEvmContractRequst(req, res, next)
);
container.bind<express.RequestHandler>('InvokeEvmContractMethodRequestValidator').toConstantValue(
  (req: any, res: any, next: any) => validators.invokeEvmContractMethodRequest(req, res, next)
);

// controllers
container.bind<interfaces.Controller>(TYPE.Controller).to(NetworkController).whenTargetNamed('NetworkController');
container.bind<interfaces.Controller>(TYPE.Controller).to(AccountController).whenTargetNamed('AccountController');

export { container };
