import { gotInstance } from '../utils/got'

export const getPageByTag = async (tag: string, page = 1): Promise<Record<string, unknown>> => {
  const response = await gotInstance(`quotes/tag/${tag}`, {
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

export const getAllPagesByTag = async (
  tag: string,
  maxPages = 100,
): Promise<Array<Record<string, unknown>>> => {
  const pages = []

  let nextPage = 1
  let totalPages = 1
  do {
    const response = await getPageByTag(tag, nextPage)
    pages.push(response)
    nextPage += 1
    totalPages = response.total_pages as number
  } while (nextPage <= totalPages && nextPage <= maxPages)

  return pages
}
