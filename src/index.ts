import { Goodreads } from './Goodreads'
import config from './config'
import * as types from './types'

const gr = new Goodreads(config.goodreads.baseUrl)

export const getQuotesByTag = (tag: string, page = 1): Promise<types.GetQuotesResponse> =>
  gr.getQuotesByTag(tag, page)

export const getAllQuotesByTag = (
  tag: string,
  concurrency = 10,
  maxPages = 100,
): Promise<Array<types.Quote>> => gr.getAllQuotesByTag(tag, concurrency, maxPages)
