import { Goodreads } from './Goodreads'
import config from './config'
import * as types from './types'

const gr = new Goodreads(config.goodreads.baseUrl)

export const getQuotesByTag = (
  options: types.GetQuotesByTagRequest,
): Promise<types.GetQuotesResponse> => gr.getQuotesByTag(options.tag, options.page)

export const getAllQuotesByTag = (
  options: types.GetAllQuotesByTagRequest,
): Promise<Array<types.Quote>> =>
  gr.getAllQuotesByTag(options.tag, options.concurrency, options.maxPages)

export const getQuotesByPath = (
  options: types.GetQuotesByPathRequest,
): Promise<types.GetQuotesResponse> => gr.getQuotesByPath(options.path, options.page)

export const getAllQuotesByPath = (
  options: types.GetAllQuotesByPathRequest,
): Promise<Array<types.Quote>> =>
  gr.getAllQuotesByPath(options.path, options.concurrency, options.maxPages)
