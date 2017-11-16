import config from '../../config';
import { Logger } from '../../logger';
import { FabricApiClient } from './client.service';
import { UserRequest, RequestMethod, NetworkRequest } from './interfaces';

/**
 * Service for certificate manipulation
 */
export class FabricApiCertificate {

  protected logger: Logger = Logger.getInstance('FABRIC_API_CERTIFICATE');

  constructor(protected fabricApi: FabricApiClient) {
  }

  /**
   * Register a new user
   */
  public async register(registrarUsername: string, username: string, password: string): Promise<boolean> {
    this.logger.verbose('Register', registrarUsername, username);

    const registerResult = await this.fabricApi.callApi<{isRegistered: boolean}>(RequestMethod.POST, '/cert-auths/users/actions/register', {
      registrarUsername,
      role: 'user',
      username,
      password,
      affiliation: 'jincornetwork.other'
    });

    return registerResult.isRegistered;
  }

  /**
   * Enroll certificate for registered user
   */
  public async enroll(username: string, password: string): Promise<boolean> {
    this.logger.verbose('Enroll', username);

    const enrollResult = await this.fabricApi.callApi<{isEnrolled: boolean}>(RequestMethod.POST, '/cert-auths/users/actions/enroll', {
      username,
      password
    });

    return enrollResult.isEnrolled;
  }
}
