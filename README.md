# Jincor Backend Contracts
![](https://travis-ci.org/JincorTech/hyperledger-fabricapi.svg?branch=master)

This is service with high level functions for communicating between web application and hyperledger-fabricapi service.

Main features are:

1. Register new accounts
2. Deploy contracts
3. Invoke methods of contracts

## Pre-requests

1. install `docker`.
1. deployed & configured `backend-auth`, `hyperledger-fabricapi`.

*Preferred Linux environment*.


## Configuration

### Environment

## Installation

1. Copy & fix: `.env.template` -> `.env`, `credentials.json.template` -> `credentials.json`, `network-config.yaml.template` -> `network-config.yaml`
1. Build docker image
1. Run docker container, and don't forget to mount crypto-config.

## Run Tests

1. Just run `npm run test`
