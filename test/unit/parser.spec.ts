import { parseAndExtractQuotes } from '../../src/utils/parser'

describe('Parser', () => {
  const rawHtml =
    '<article>\n<div class=\'quoteContainer quoteContainer--noSeparator\'>\n<div class=\'quoteIconWrapper\'>\n<a aria-label="Orrin Woodward" href="/author/show/249881.Orrin_Woodward"><div class=\'userIcon\' style=\'background-image: url(https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/authors/1359585605i/249881._UY30_.jpg);\'></div>\n</a></div>\n<div class=\'quoteContentContainer\'>\n<div class=\'quote\'>\n<blockquote class=\'quoteBody\'>A limited state with free economic systems is the soil where the liberty tree blossoms.</blockquote>\n<div class=\'quoteDetails\'>\n<span class=\'quoteAuthor\'>\nOrrin Woodward\n</span>\n<div class=\'quoteTags\'>\nTags:\n<a title="Economics quotes" href="/quotes/tag/economics">economics</a>,\n<a title="Freedom quotes" href="/quotes/tag/freedom">freedom</a>,\n<a title="Libertarianism quotes" href="/quotes/tag/libertarianism">libertarianism</a>,\n<a title="Liberty quotes" href="/quotes/tag/liberty">liberty</a>\n</div>\n<div class=\'quoteLikes\'>\n<ul class=\'quoteFooter\'>\n<li class=\'footerItem\'>\n<a id="like_action_quote_567718" rel="nofollow" data-like-count-id="like_count_quote_567718" class="jsLike" data-remote="true" data-method="post" href="/quotes/add/567718-a-limited-state-with-free-economic-systems-is-the-soil?format=json&amp;lc=3">Like</a>\n</li>\n<li class=\'footerItem ratingsCount\'>\n<a id="like_id_quote_567718" href="/quotes/567718-a-limited-state-with-free-economic-systems-is-the-soil"><span class=\'likesIndicator\'>\nlikes:\n</span>\n<span class=\'likesCount\'>3</span>\n</a>\n</li>\n</ul>\n\n</div>\n</div>\n</div>\n\n</div>\n</div>\n\n</article>\n'

  const parsedQuotes = [
    {
      text:
        'A limited state with free economic systems is the soil where the liberty tree blossoms.',
      author: 'Orrin Woodward',
      likes: 3,
      tags: ['economics', 'freedom', 'libertarianism', 'liberty'],
    },
  ]

  it('should parse raw html and extract quotes', () => {
    const quotes = parseAndExtractQuotes(rawHtml)
    expect(quotes).toEqual(parsedQuotes)
  })
})
