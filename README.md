# nietzsche.js

![gh-actions](https://github.com/rpidanny/nietzsche.js/workflows/Release/badge.svg) [![codecov](https://codecov.io/gh/rpidanny/nietzsche.js/branch/main/graph/badge.svg?token=UCCA6D6JCB)](https://codecov.io/gh/rpidanny/nietzsche.js)

A JavaScript package to download quotes from Goodreads.

## Install

```sh
$ npm install --save @rpidanny/nietzsche.js
```

## Usage

### Basic example

```ts
import { getAllQuotesByTag } from '@rpidanny/nietzsche.js'

const quoteResponse = await getAllQuotesByTag('psychology')
console.log(quoteResponse)
```

### API Documentation

#### getQuotesByTag(options?)

Type: `object`

| key    | default | type     | description                                                   |
| ------ | ------- | -------- | ------------------------------------------------------------- |
| `tag`  | `None`  | `string` | The name of the tag to search. e.g. `psychology`, `economics` |
| `page` | `1`     | `number` | The page number to get the quotes from.                       |

Response Type: [GetQuotesResponse](#GetQuotesResponse)

#### getAllQuotesByTag(options?)

Type: `object`

| key           | default | type     | description                                                   |
| ------------- | ------- | -------- | ------------------------------------------------------------- |
| `tag`         | `None`  | `string` | The name of the tag to search. e.g. `psychology`, `economics` |
| `concurrency` | `10`    | `number` | The number of parallel requests to goodreads                  |
| `maxPages`    | `100`   | `number` | The maximum number of pages to search                         |

Response Type: `Array<Quotes>`

### Types

#### Quote

```ts
{
  text: string
  author: string
  likes: number
  tags: Array<string>
}
```

#### GetQuotesResponse

```ts
{
  quotes: Array<Quote>
  pageNumber: number
  totalPages: number
  count: number
}
```
