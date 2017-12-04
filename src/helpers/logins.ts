import * as crypto from 'crypto';

import config from '../config';

export function getLogin(decodedToken: any, isForCorporate: boolean) {
  const splitted = decodedToken.login.split(':', 1);
  if (isForCorporate && config.logins.corporate && decodedToken.scope === 'company-admin') {
    return splitted[0];
  }
  return decodedToken.login;
}

export function loginAsHash(login: string): string {
  const md5sum = crypto.createHash('md5');
  md5sum.update(login);
  return md5sum.digest('hex');
}
