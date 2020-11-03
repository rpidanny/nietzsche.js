export interface Quote {
  text: string
  author: string
  likes: number
  tags: Array<string>
}

export interface GoodreadsResponse {
  ok: boolean
  content_html: string
  page: number
  per_page: number
  num_results: number
  total_pages: number
}

export interface GetQuotesResponse {
  quotes: Array<Quote>
  pageNumber: number
  totalPages: number
  count: number
}
