import * as Joi from 'joi';
import { Response, Request, NextFunction } from 'express';
import { UNPROCESSABLE_ENTITY } from 'http-status';

import { responseWithError } from '../helpers/responses';

const options = {
  allowUnknown: true
};

function commonFlowRequestMiddleware(scheme: Joi.Schema, req: Request, res: Response, next: NextFunction) {
  const result = Joi.validate(req.body || {}, scheme, options);

  if (result.error) {
    return responseWithError(res, UNPROCESSABLE_ENTITY, {
      'error': result.error,
      'details': result.value
    });
  } else {
    return next();
  }
}

const jsonSchemeContractArgs = Joi.array().items(
  Joi.alternatives().try([
    Joi.string(),
    Joi.boolean()
  ])
);

const jsonSchemeAccountRegisterRequest = Joi.object().keys({
  loginFromJwt: Joi.boolean().invalid(false).required(),
  password: Joi.string().empty().required()
});

const jsonSchemeDeployEvmContractRequst = Joi.object().keys({
  peers: Joi.array().items(Joi.string()).min(1).unique().required(),
  abi: Joi.string().empty().required(),
  code: Joi.string().hex().empty().required(),
  args: jsonSchemeContractArgs
});

const jsonSchemeInvokeEvmContractMethodRequest = Joi.object().keys({
  peers: Joi.array().items(Joi.string()).min(1).unique().required(),
  address: Joi.string().hex().empty().required(),
  abi: Joi.string().required(),
  // abi: Joi.string().when('abi_hash', { is: Joi.hex().required(), then: Joi.optional() }),
  // abi_hash: Joi.hex().when('abi', { is: Joi.hex().required(), then: Joi.optional() }),
  method: Joi.string().empty().required(),
  args: jsonSchemeContractArgs
});

export function accountRegisterRequest(req: Request, res: Response, next: NextFunction) {
  return commonFlowRequestMiddleware(jsonSchemeAccountRegisterRequest, req, res, next);
}

export function deployEvmContractRequst(req: Request, res: Response, next: NextFunction) {
  return commonFlowRequestMiddleware(jsonSchemeDeployEvmContractRequst, req, res, next);
}

export function invokeEvmContractMethodRequest(req: Request, res: Response, next: NextFunction) {
  return commonFlowRequestMiddleware(jsonSchemeInvokeEvmContractMethodRequest, req, res, next);
}
