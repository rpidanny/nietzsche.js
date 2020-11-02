import $ from 'cheerio'

import * as types from '../types'

export const parseAndExtractQuotes = (html: string): Array<Record<string, unknown>> => {
  const quotes: Array<types.Quote> = []
  const quoteGroup = $('.quote', html)

  quoteGroup.each((_idx, elem) => {
    const quoteElement = $(elem)
    const text = quoteElement
      .find('.quoteBody')
      .text()
      .replace(/^\s+|\s+$/g, '')
    const author = quoteElement
      .find('.quoteAuthor')
      .text()
      .replace(/^\s+|\s+$/g, '')
      .replace(/,/g, '')
    const likes = parseInt(
      quoteElement
        .find('.likesCount')
        .text()
        .replace(/^\s+|\s+$/g, ''),
    )
    const tags = quoteElement
      .find('.quoteTags')
      .find('a')
      .map((_idx, tag) => {
        const tagSelector = $(tag)
        return tagSelector.text().replace(/^\s+|\s+$/g, '')
        // return {
        //   link: tagSelector.attr('href'),
        //   text: tagSelector.text().replace(/^\s+|\s+$/g, '')
        // }
      })
      .toArray()

    if (text.length > 0 && author.length > 0) {
      quotes.push({
        text,
        author,
        likes,
        tags,
      })
    }
  })
  return quotes
}
