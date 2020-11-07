import $ from 'cheerio'
import got, { Got } from 'got'
import HttpAgent, { HttpsAgent } from 'agentkeepalive'

import chunk from './utils/chunk'
import * as types from './types'

export class Goodreads {
  baseUrl: string
  gotInstance: Got
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.gotInstance = got.extend({
      prefixUrl: this.baseUrl,
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
  }

  async getPageByTag(tag: string, page = 1): Promise<types.GoodreadsResponse> {
    const response = await this.gotInstance(`quotes/tag/${tag}`, {
      searchParams: {
        format: 'json',
        page,
      },
    })

    if (response.statusCode === 200 && response.body) {
      return JSON.parse(response.body)
    }

    throw new Error('Failed to get page by tag')
  }

  async getPageByPath(path: string, page = 1): Promise<types.GoodreadsResponse> {
    const response = await this.gotInstance(path, {
      searchParams: {
        format: 'json',
        page,
      },
    })

    if (response.statusCode === 200 && response.body) {
      return JSON.parse(response.body)
    }

    throw new Error('Failed to get page by path')
  }

  parseAndExtractQuotes(html: string): Array<types.Quote> {
    const quotes: Array<types.Quote> = []
    const quoteGroup = $('.quote', html)

    quoteGroup.each((_idx, elem) => {
      const quoteElement = $(elem)
      const text: string = quoteElement
        .find('.quoteBody')
        .text()
        .replace(/^\s+|\s+$/g, '')
      const author: string = quoteElement
        .find('.quoteAuthor')
        .text()
        .replace(/^\s+|\s+$/g, '')
        .replace(/,/g, '')
      const likes: number = parseInt(
        quoteElement
          .find('.likesCount')
          .text()
          .replace(/^\s+|\s+$/g, ''),
      )
      const tags: Array<string> = quoteElement
        .find('.quoteTags')
        .find('a')
        .map((_idx, tag) => {
          const tagSelector = $(tag)
          return tagSelector.text().replace(/^\s+|\s+$/g, '')
        })
        .toArray()
        .map((element) => element.toString())

      if (text.length > 0 && author.length > 0) {
        const quote: types.Quote = {
          text,
          author,
          likes,
          tags,
        }
        quotes.push(quote)
      }
    })
    return quotes
  }

  async getQuotesByTag(tag: string, pageNumber = 1): Promise<types.GetQuotesResponse> {
    const rawPage = await this.getPageByTag(tag, pageNumber)
    const quotes = this.parseAndExtractQuotes(rawPage.content_html)
    return {
      quotes,
      pageNumber: rawPage.page,
      totalPages: rawPage.total_pages,
      count: quotes.length,
    }
  }

  async getQuotesByPath(path: string, pageNumber = 1): Promise<types.GetQuotesResponse> {
    const rawPage = await this.getPageByPath(path, pageNumber)
    const quotes = this.parseAndExtractQuotes(rawPage.content_html)
    return {
      quotes,
      pageNumber: rawPage.page,
      totalPages: rawPage.total_pages,
      count: quotes.length,
    }
  }

  private async getAllQuotes(
    method: (selector: string, pageNumber: number) => Promise<types.GetQuotesResponse>,
    selector: string,
    concurrency = 10,
    maxPages = 100,
  ): Promise<Array<types.Quote>> {
    let response: Array<types.Quote> = []

    // download first page to get total page info
    const { quotes, totalPages } = await method(selector, 1)

    response = response.concat(quotes)

    // Create an array of page numbers
    const pageNumbers: Array<number> = Array.from(
      { length: totalPages < maxPages ? totalPages : maxPages },
      (_, i) => i + 1,
    )

    // remove the first page as it has already been downloaded
    pageNumbers.splice(0, 1)

    // create batches to run in parallel
    const batches = chunk(pageNumbers, concurrency) as Array<Array<number>>

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const responses = await Promise.all(
        batch.map((pageNumber: number) => method(selector, pageNumber)),
      )

      const batchQuotes = responses.reduce((acc, item) => {
        acc = acc.concat(item.quotes)
        return acc
      }, [] as Array<types.Quote>)
      response = response.concat(batchQuotes)
    }

    return response
  }

  async getAllQuotesByTag(
    tag: string,
    concurrency = 10,
    maxPages = 100,
  ): Promise<Array<types.Quote>> {
    const quotes = await this.getAllQuotes(
      this.getQuotesByTag.bind(this),
      tag,
      concurrency,
      maxPages,
    )
    return quotes
  }

  async getAllQuotesByPath(
    path: string,
    concurrency = 10,
    maxPages = 100,
  ): Promise<Array<types.Quote>> {
    const quotes = await this.getAllQuotes(
      this.getQuotesByPath.bind(this),
      path,
      concurrency,
      maxPages,
    )
    return quotes
  }
}
