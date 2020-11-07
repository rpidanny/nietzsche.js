import nock from 'nock'
import { performance } from 'perf_hooks'

import { Goodreads } from '../../src/Goodreads'

describe('Goodreads', () => {
  const rawResponse = {
    ok: true,
    content_html:
      '<article>\n<div class=\'quoteContainer quoteContainer--noSeparator\'>\n<div class=\'quoteIconWrapper\'>\n<a aria-label="Orrin Woodward" href="/author/show/249881.Orrin_Woodward"><div class=\'userIcon\' style=\'background-image: url(https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/authors/1359585605i/249881._UY30_.jpg);\'></div>\n</a></div>\n<div class=\'quoteContentContainer\'>\n<div class=\'quote\'>\n<blockquote class=\'quoteBody\'>A limited state with free economic systems is the soil where the liberty tree blossoms.</blockquote>\n<div class=\'quoteDetails\'>\n<span class=\'quoteAuthor\'>\nOrrin Woodward\n</span>\n<div class=\'quoteTags\'>\nTags:\n<a title="Economics quotes" href="/quotes/tag/economics">economics</a>,\n<a title="Freedom quotes" href="/quotes/tag/freedom">freedom</a>,\n<a title="Libertarianism quotes" href="/quotes/tag/libertarianism">libertarianism</a>,\n<a title="Liberty quotes" href="/quotes/tag/liberty">liberty</a>\n</div>\n<div class=\'quoteLikes\'>\n<ul class=\'quoteFooter\'>\n<li class=\'footerItem\'>\n<a id="like_action_quote_567718" rel="nofollow" data-like-count-id="like_count_quote_567718" class="jsLike" data-remote="true" data-method="post" href="/quotes/add/567718-a-limited-state-with-free-economic-systems-is-the-soil?format=json&amp;lc=3">Like</a>\n</li>\n<li class=\'footerItem ratingsCount\'>\n<a id="like_id_quote_567718" href="/quotes/567718-a-limited-state-with-free-economic-systems-is-the-soil"><span class=\'likesIndicator\'>\nlikes:\n</span>\n<span class=\'likesCount\'>3</span>\n</a>\n</li>\n</ul>\n\n</div>\n</div>\n</div>\n\n</div>\n</div>\n\n</article>\n',
    page: 1,
    per_page: 1,
    num_results: 1,
    total_pages: 5,
  }
  const parsedQuotes = [
    {
      text:
        'A limited state with free economic systems is the soil where the liberty tree blossoms.',
      author: 'Orrin Woodward',
      likes: 3,
      tags: ['economics', 'freedom', 'libertarianism', 'liberty'],
    },
  ]

  let gr: Goodreads

  const baseUrl = 'http://example.com'

  beforeEach(async () => {
    gr = new Goodreads(baseUrl)

    nock.abortPendingRequests()
    nock.cleanAll()
    nock.disableNetConnect()
  })

  afterEach(() => {
    const pending = nock.pendingMocks()

    if (pending.length > 0) {
      console.log('Pending Nocks: ', pending)
      throw new Error(`${pending.length} mocks are pending!`)
    }

    nock.enableNetConnect()
  })

  describe('Parser', () => {
    it('should parse raw html and extract quotes', () => {
      const quotes = gr.parseAndExtractQuotes(rawResponse.content_html)
      expect(quotes).toEqual(parsedQuotes)
    })
  })

  describe('Quotes by Tag', () => {
    it('should return parsed quotes from a single page', async () => {
      const expectedResponse = {
        quotes: parsedQuotes,
        pageNumber: 1,
        totalPages: 5,
        count: 1,
      }
      nock(baseUrl).get(/.*/).reply(200, rawResponse)
      const response = await gr.getQuotesByTag('economics')
      expect(response).toEqual(expectedResponse)
    })

    it('should return parsed quotes from all pages', async () => {
      const expectedResponse = new Array(5).fill(parsedQuotes[0])
      nock(baseUrl).get(/.*/).times(5).reply(200, rawResponse)
      const response = await gr.getAllQuotesByTag('economics')
      expect(response).toEqual(expectedResponse)
    })

    describe('Request', () => {
      it('should return page with quotes', async () => {
        nock(baseUrl).get(/.*/).reply(200, rawResponse)
        const page = await gr.getPageByTag('economics')
        expect(page).toEqual(rawResponse)
      })

      it('should throw error when failed to get page', async () => {
        nock(baseUrl).get(/.*/).reply(400)
        expect.assertions(2)
        try {
          await gr.getPageByTag('economics')
        } catch (err) {
          expect(err).toBeInstanceOf(Error)
          expect(err).toHaveProperty('message', 'Failed to get page by tag')
        }
      })
    })

    describe('concurrency', () => {
      const delayMillis = 500
      const prescaler = 100

      it('should return parsed quotes from all pages in sequence', async () => {
        const concurrency = 1

        const start = performance.now()

        const expectedResponse = new Array(5).fill(parsedQuotes[0])

        nock(baseUrl).get(/.*/).times(5).delay(delayMillis).reply(200, rawResponse)

        const response = await gr.getAllQuotesByTag('economics', concurrency)

        const end = performance.now()
        const executionTime = end - start

        expect(Math.floor(executionTime / prescaler)).toEqual((5 * delayMillis) / prescaler)
        expect(response).toEqual(expectedResponse)
      })

      it('should return parsed quotes from all pages with concurrent requests', async () => {
        const concurrency = 5

        const start = performance.now()

        const expectedResponse = new Array(5).fill(parsedQuotes[0])

        nock(baseUrl).get(/.*/).times(5).delay(delayMillis).reply(200, rawResponse)

        const response = await gr.getAllQuotesByTag('economics', concurrency)

        const end = performance.now()
        const executionTime = end - start
        // 2 * delayMillis since we need to get the first page before running in parallel
        expect(Math.floor(executionTime / prescaler)).toEqual((2 * delayMillis) / prescaler)
        expect(response).toEqual(expectedResponse)
      })
    })
  })

  describe('Quotes by Path', () => {
    it('should return parsed quotes from a single page', async () => {
      const expectedResponse = {
        quotes: parsedQuotes,
        pageNumber: 1,
        totalPages: 5,
        count: 1,
      }
      nock(baseUrl).get(/.*/).reply(200, rawResponse)
      const response = await gr.getQuotesByPath('quotes/tag/economics')
      expect(response).toEqual(expectedResponse)
    })

    it('should return parsed quotes from all pages', async () => {
      const expectedResponse = new Array(5).fill(parsedQuotes[0])
      nock(baseUrl).get(/.*/).times(5).reply(200, rawResponse)
      const response = await gr.getAllQuotesByPath('quotes/tag/economics')
      expect(response).toEqual(expectedResponse)
    })

    it('should fail when path starts with "/"', async () => {
      expect.assertions(2)
      try {
        await gr.getAllQuotesByPath('/quotes/tag/economics')
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
        expect(err).toHaveProperty(
          'message',
          '`input` must not start with a slash when using `prefixUrl`',
        )
      }
    })

    describe('Request', () => {
      it('should return page with quotes', async () => {
        nock(baseUrl).get(/.*/).reply(200, rawResponse)
        const page = await gr.getPageByPath('quotes/tag/economics')
        expect(page).toEqual(rawResponse)
      })

      it('should throw error when failed to get page', async () => {
        nock(baseUrl).get(/.*/).reply(400)
        expect.assertions(2)
        try {
          await gr.getPageByPath('quotes/tag/economics')
        } catch (err) {
          expect(err).toBeInstanceOf(Error)
          expect(err).toHaveProperty('message', 'Failed to get page by path')
        }
      })
    })

    describe('concurrency', () => {
      const delayMillis = 500
      const prescaler = 100

      it('should return parsed quotes from all pages in sequence', async () => {
        const concurrency = 1

        const start = performance.now()

        const expectedResponse = new Array(5).fill(parsedQuotes[0])

        nock(baseUrl).get(/.*/).times(5).delay(delayMillis).reply(200, rawResponse)

        const response = await gr.getAllQuotesByPath('quotes/tag/economics', concurrency)

        const end = performance.now()
        const executionTime = end - start

        expect(Math.floor(executionTime / prescaler)).toEqual((5 * delayMillis) / prescaler)
        expect(response).toEqual(expectedResponse)
      })

      it('should return parsed quotes from all pages with concurrent requests', async () => {
        const concurrency = 5

        const start = performance.now()

        const expectedResponse = new Array(5).fill(parsedQuotes[0])

        nock(baseUrl).get(/.*/).times(5).delay(delayMillis).reply(200, rawResponse)

        const response = await gr.getAllQuotesByPath('quotes/tag/economics', concurrency)

        const end = performance.now()
        const executionTime = end - start
        // 2 * delayMillis since we need to get the first page before running in parallel
        expect(Math.floor(executionTime / prescaler)).toEqual((2 * delayMillis) / prescaler)
        expect(response).toEqual(expectedResponse)
      })
    })
  })
})
