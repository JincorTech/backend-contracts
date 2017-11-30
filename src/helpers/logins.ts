import config from '../config';

export function getLogin(decodedToken: any, isForCorporate: boolean) {
  const splitted = decodedToken.login.split(':', 1);
  if (isForCorporate && config.logins.corporate && decodedToken.scope === 'company-admin') {
    return splitted[0];
  }
  return decodedToken.login;
}
