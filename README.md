# Jincor Backend Contracts
![](https://travis-ci.org/JincorTech/hyperledger-fabricapi.svg?branch=master)

This is service with high level functions for communicating between web application and hyperledger-fabricapi service.

Main features are:

1. Register new accounts
2. Deploy ethereum contracts
3. Invoke methods of ethereum contracts


## Pre-requests

1. install `docker`.
1. deployed & configured `backend-auth`, `hyperledger-fabricapi`.

*Preferred Linux environment*.


## Configuration

### Environment variables

* *CONTRACTS_LOGGING_LEVEL* log level (verbose, info, warning, error)
* *CONTRACTS_LOGGING_FORMAT* log format (text, json)
* *CONTRACTS_LOGGING_COLORIZE* colorize output (true, false)
* *CONTRACTS_SERVER_HTTP* HTTP server (true, false)
* *CONTRACTS_SERVER_HTTP_IP* bind ip
* *CONTRACTS_SERVER_HTTP_PORT* listen port
* *CONTRACTS_SERVER_HTTPS* HTTPS server (true, false)
* *CONTRACTS_SERVER_HTTPS_IP* https bind ip
* *CONTRACTS_SERVER_HTTPS_PORT* https port
* *CONTRACTS_SERVER_HTTPS_PUB_KEY* path to cert. file
* *CONTRACTS_SERVER_HTTPS_PRIV_KEY* path to private key file
* *CONTRACTS_SERVER_HTTPS_CA* path to root CA cert. file
* *CONTRACTS_NATS_SERVERS=localhost:4222
* *CONTRACTS_NATS_SERVERS* nats server
* *CONTRACTS_NATS_TLS* is nats tls enabled
* *CONTRACTS_NATS_TLS_PUB_KEY* path to cert file
* *CONTRACTS_NATS_TLS_PRIV_KEY* path to private key file
* *CONTRACTS_NATS_TLS_CA* path to ca file
* *CONTRACTS_NATS_USER* nats username
* *CONTRACTS_NATS_PASSWORD* nats password
* *CONTRACTS_AUTH_VERIFY_URL* url to backend-auth endpoint to verify user token like `http://auth:3000/auth/verify`
* *CONTRACTS_AUTH_TENANT_VERIFY_URL* url to backend-auth endpoint to verify tenant token like `http://auth:3000/tenant/verify`
* *CONTRACTS_AUTH_ACCESS_JWT* tenant token to access backend-auth service
* *CONTRACTS_FABRICAPI_URL* url to fabricapi service like `http://fabricapi:8080/api`
* *CONTRACTS_FABRICAPI_USER* user who execute actions.
* *CONTRACTS_FABRICAPI_PASSWORD* password for user
* *CONTRACTS_FABRICAPI_EVMCHAINCODE* ethereum virtual machine in chaincode `hyperledger-fabric-evmcc:0`
* *CONTRACTS_FABRICAPI_REG_USER* main user for registration another user `admin@ca.network`
* *CONTRACTS_FABRICAPI_MSPID* organization membership id
* *CONTRACTS_LOGINS_MODE* logins format, default has any format, corporate has `uuid:email` format


## Websocket

WebSocket server available by `ws://contracts:8080/events?token={TOKEN}` endpoint, where {TOKEN} is backend-auth tenant token.
Look at *apiary* to see possible websocket messages.


## Installation

1. Copy & fix: `.env.template` -> `.env`, `credentials.json.template` -> `credentials.json`, `network-config.yaml.template` -> `network-config.yaml`
1. Build docker image
1. Run docker container, and don't forget to mount crypto-config.


## Run Tests

1. Just run `npm run test`
