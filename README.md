# merge-async-iterators

A simple async iterators merger

**Requires ES2018 [Async Iteration][async-iteration]**

[async-iteration]: https://github.com/tc39/proposal-async-iteration

## Install

```
npm i merge-async-iterators
```

## Usage

### API

**`merge([...iterators], opts)`**

* **`iterators`** Array of async iterables

* **`opts`**

  * **`yieldIterator[=false]`** Yields `{iterator, value}` (instead of `value`)

    Useful if you wanna know which iterator yielded the value

* **Returns** A single merged async iterable

### Example

```js
const merge = require('merge-async-iterators');

async function* a () {
  yield 'a1'
  yield 'a2'
  return 'a3'
}
async function* b () {
  yield 'b1'
  yield 'b2'
  return 'b3'
}

for await (const value of merge([a(), b()])) {
  console.log(value)
}
```
```
a1
b1
a2
b2
a3
b3
```



## Alternatives

* **[mergeiterator]**

[mergeiterator]: https://github.com/vadzim/mergeiterator
[this gist]: https://gist.github.com/dotproto/7233e905e047df780403380ed354047a

