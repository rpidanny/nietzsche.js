import nock from 'nock'

import { getPageByTag, getAllPagesByTag } from '../../src/external/goodreads'
import config from '../../src/config'

describe('Goodreads', () => {
  beforeEach(async () => {
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

  it('should return page with quotes', async () => {
    const rawData = {
      ok: true,
      content_html: '',
      page: 1,
      per_page: 30,
      num_results: 0,
      total_pages: 45,
    }
    nock(config.goodreads.baseUrl).get(/.*/).reply(200, rawData)
    const page = await getPageByTag('psychology')
    expect(page).toEqual(rawData)
  })

  it('should return all pages with quotes', async () => {
    const rawData = {
      ok: true,
      content_html: '',
      page: 1,
      per_page: 30,
      num_results: 0,
      total_pages: 5,
    }
    nock(config.goodreads.baseUrl).get(/.*/).times(5).reply(200, rawData)

    const pages = await getAllPagesByTag('psychology')
    expect(pages.length).toEqual(5)
  })
})
