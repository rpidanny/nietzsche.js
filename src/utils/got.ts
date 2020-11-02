import got from 'got'
import HttpAgent, { HttpsAgent } from 'agentkeepalive'

import config from '../config'

export const gotInstance = got.extend({
  prefixUrl: config.goodreads.baseUrl,
  throwHttpErrors: false,
  agent: {
    http: new HttpAgent({
      keepAlive: true,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 60000, // active socket keepalive for 60 seconds
      freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
    }),
    https: new HttpsAgent({
      keepAlive: true,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 60000, // active socket keepalive for 60 seconds
      freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
    }),
  },
})
