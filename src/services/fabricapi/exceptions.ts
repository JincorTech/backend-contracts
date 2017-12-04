export class FabricApiClientException extends Error { }
export class ContractCommunicatorException extends Error { }
export class ContractDeployException extends ContractCommunicatorException { }
export class ContractInvokeException extends ContractCommunicatorException { }
