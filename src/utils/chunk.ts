export default (arr: Array<unknown>, size: number): Array<Array<unknown>> =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  )
