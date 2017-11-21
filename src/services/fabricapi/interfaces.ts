export enum RequestMethod {
  POST = 'post',
  GET = 'get'
}

export interface EnrollResponse {
  username: string;
  address: string;
}

export interface UserRequest {
  login: string;
  password: string;
}

export interface NetworkRequest {
  networkId: string;
  peers: Array<string>;
}

export interface AbiParam {
  name: string;
  type: string;
  indexed: boolean;
}

export interface AbiMethod {
  inputs: Array<AbiParam>;
  outputs: Array<AbiParam>;
  name: string;
  constant: boolean;
  payable: boolean;
  type: string;
}
