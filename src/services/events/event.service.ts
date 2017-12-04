import { FabricApiClient } from '../fabricapi/client.service';
import { QueryFabric } from '../fabricapi/query.service';
import config from '../../config';
import { setTimeout } from 'timers';
import * as ws from 'ws';
import { Server } from 'http';
import * as url from 'url';
import * as inversify from 'inversify';
import * as lru from 'lru-cache';

import { Logger } from '../../logger';
import { AuthenticationService, AuthenticationServiceType } from '../auth.service';
import { MessageQueue } from '../mq/interfaces';
import { MessageQueueType } from '../mq/natsmq.service';

/**
 * Websocket Event server
 */
export class EventServer {
  private server: ws.Server;
  private logger: Logger = Logger.getInstance('EVENT_SERVER');
  private authService: AuthenticationService;
  private transactionEvents: any;
  private fabricApi: FabricApiClient;

  /**
   * @param container
   * @param httpServer
   */
  constructor(private container: inversify.interfaces.Container, private httpServer: Server) {
    this.initWebsocket();
    this.subscribeOnEvents();
    this.authService = this.container.get<AuthenticationService>(AuthenticationServiceType);
    this.transactionEvents = this.transactionEvents = lru({
      max: config.mq.transactionsMaxSize,
      maxAge: config.mq.transactionsTtlInSec * 1000
    });
    this.fabricApi = new FabricApiClient();
  }

  private broadcast(data: any) {
    this.logger.verbose('Broadcast event', data);

    this.server.clients.forEach(clientSocket => {
      if (clientSocket.readyState === ws.OPEN) {
        clientSocket.send(data, (err) => {
          if (err) {
            this.logger.error('Broadcast event failed ', err);
          }
        });
      }
    });
  }

  private initWebsocket() {
    this.logger.info('Start event server...');

    this.server = new ws.Server({
      server: this.httpServer
    });

    this.server.on('connection', this.onWebsocketClientConnect.bind(this));
  }

  private async onWebsocketClientConnect(clientSocket, clientRequest) {
    const parsedUrl = url.parse(clientRequest.url, true);

    if (parsedUrl.pathname !== '/events') {
      clientSocket.close(1008, 'Bad request');
      return;
    }

    if (!parsedUrl.query || (!parsedUrl.query.token && !parsedUrl.query.tenant_token)) {
      clientSocket.close(1008, 'Not authorized');
      return;
    }

    this.logger.verbose('WebSocket client connected', clientRequest.headers);

    let decodedToken;
    try {
      decodedToken = parsedUrl.query.token ? await this.authService.validateUser(parsedUrl.query.token) : await this.authService.validateTenant(parsedUrl.query.tenant_token);
    } catch (error) {
      clientSocket.close(1008, 'Not authorized');
      return;
    }

    clientSocket.on('message', async(message) => {
      try {
        const data = JSON.parse(message);
        // @TODO: Add joi validation
        switch (data.command) {
          case 'PING':
            clientSocket.send('{"response":"PONG"}');
            break;
          case 'TRANSACTION_STATUS':
            const queryFabric = new QueryFabric(this.fabricApi,
              data.args.network,
              data.args.peers,
              data.args.initiateUser
            );
            clientSocket.send(JSON.stringify({
              response: {
                txId: data.args.txId,
                status: await queryFabric.queryTransactionStatusByHash(data.args.txId)
              }
            }));
            break;
        }
      } catch (err) {
        this.logger.error('Error was occurred when process commands from client', err);
      }
    });
  }

  private subscribeOnEvents() {
    const mqService = this.container.get<MessageQueue>(MessageQueueType);

    this.logger.verbose('Subscribe on transactions');
    mqService.subscribe(`${config.mq.channelTransactions}${config.fabricapi.mspId}`,
      (data: string, reply: any, channel: string) => {

        const eventData = JSON.parse(data);
        this.transactionEvents.set(eventData.transactionId, eventData.code);
        this.broadcast(JSON.stringify({
          type: 'transaction',
          payload: {
            txId: eventData.transactionId,
            status: eventData.code
          }
        }));
      });

    const [chaincode, chaincodeVersion] = config.fabricapi.evmChaincode.split(':');

    this.logger.verbose('Subsribe on EVM events');
    mqService.subscribe(`${config.mq.channelChaincodes}${config.fabricapi.mspId}/${chaincode}/EVM:LOG`,
      (data: string, reply: any, channel: string) => {
        const eventData = JSON.parse(data);
        const payloadData = JSON.parse(eventData.payload);

        this.broadcast(JSON.stringify({
          type: 'evm',
          payload: {
            txId: eventData.transactionId,
            status: payloadData.error || this.transactionEvents.get(eventData.transactionId) || 'PENDING',
            address: payloadData.address,
            topics: payloadData.payload.topics.map(v => (new Buffer(v).toString('hex'))),
            data: (new Buffer(payloadData.payload.data, 'base64').toString('hex'))
          }
        }));
      });
  }
}
