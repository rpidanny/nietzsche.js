import $ from 'cheerio'
import got, { Got } from 'got'
import HttpAgent, { HttpsAgent } from 'agentkeepalive'

import * as types from './types'

export class Nietzsche {
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

  async getAllQuotesByTag(tag: string, maxPages = 100): Promise<Array<types.Quote>> {
    let nextPage = 1
    let total

    let response: Array<types.Quote> = []
    do {
      const { quotes, totalPages } = await this.getQuotesByTag(tag, nextPage)
      nextPage += 1
      total = totalPages
      response = response.concat(quotes)
    } while (nextPage <= total && nextPage <= maxPages)

    return response
  }
}
