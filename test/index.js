const merge = require('..');
// const merge = require('mergeiterator');
const stream = require('streams-to-async-iterator');
const CP = require('child_process');

const delay = (t = Math.random() * 100) => new Promise(_ => setTimeout(() => _(t), t));

let array = () => array = ['array', 'array', 'array'];
let basic = () => basic = (function* basic() {
  yield 'basic';
  yield 'basic';
  yield 'basic';
  return 'return'
})();

let asyncBasic10 = () => asyncBasic10 = (async function*() {
  yield delay(10);
  yield delay(10);
  yield delay(10);
  return 'return'
})();

let asyncBasic1000 = () => asyncBasic1000 = (async function*() {
  yield delay(1000);
  yield delay(1000);
  yield delay(1000);
})();

let stdin = () => stdin = stream(process.stdin.setEncoding('utf8'));


const fork = (m, s) => {
  const cp = CP.fork(m, { stdio: 'pipe', encoding: 'utf8' });
  cp.send(s);
  return cp.stdout.setEncoding('utf8');
}

let stdoutA = () => stdoutA = stream(fork('test/stdout', 'a'));
let stdoutB = () => stdoutB = stream(fork('test/stdout', 'b'));

async function main() {

  const merged = merge([
    array(),
    basic(),
    asyncBasic10(),
    asyncBasic1000(),
    // stdin(),
    // stdoutA(),
    // stdoutB(),
  ], {
    // yieldIterator: true
  });

  // let counter = 0
  for await (const value of merged) {
    // process.stdout.write(value);
    // await delay(1000);
    console.log(value);
    // if (counter++ > 1)
    // break
  }

  // console.log(await merged.next());
  // console.log(await merged.next());
  // console.log(await merged.next());
  // console.log(await merged.next());
  // console.log(await merged.next());
  // console.log(await merged.next());
  // console.log(await merged.next());
  // console.log(await merged.next());
  // console.log(await merged.next());
  // console.log(await merged.next());
  // // console.log('1');
  // console.log(await merged.next());
  // // console.log('1');
}

main().then(() => console.log('ok')).catch(e => {
  // console.log('end');
  process.exitCode = 1
  console.error(e);
});
