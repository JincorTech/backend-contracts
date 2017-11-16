export enum RequestMethod {
  POST = 'post',
  GET = 'get'
}

export interface UserRequest {
  login: string;
  password: string;
}

export interface NetworkRequest {
  networkId: string;
  peers: Array<string>;
}
