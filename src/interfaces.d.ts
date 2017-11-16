import { Request } from 'express';

/**
 * @internal helper interface
 */
export interface AuthenticatedRequest extends Request {
  token: string;
  tokenDecoded: {
    login: string;
  };
}
