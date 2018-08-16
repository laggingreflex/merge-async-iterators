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

const array = [1,2];
const iterable = (function*(){
  yield 3
  yield 4
})()
const asyncIterable = (async function*(){
  yield 5
  yield 6
})()

for await (const value of merge([array, iterable, asyncIterable])) {
  console.log(value)
}
```
```
1
2          // order isn't guaranteed
undefined  // finished iterators' returns will yield as well
3
4
undefined
5          // async wil almost always come after normal ones
6
```

## Alternatives

* **[mergeiterator]**

[mergeiterator]: https://github.com/vadzim/mergeiterator
[this gist]: https://gist.github.com/dotproto/7233e905e047df780403380ed354047a

