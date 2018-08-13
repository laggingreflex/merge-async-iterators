const merge = require('.')
// const merge = require('mergeiterator')

const delay = (v, t =
    Math.random()
    * 100
  ) =>
  // v
  new Promise(_ => setTimeout(() => _(v), t));

main().then(() => console.log('ok')).catch(e => {
  // console.log('end');
  process.exitCode = 1
  console.error(e);
});

async function main() {

  const aI = a();
  const bI = b();

  const merged = merge([
    aI,
    bI,
  ]);

  let counter = 0
  for await (const val of merged) {
    console.log(val);
    // if (counter++ > 1)
    // break
  }

}


async function* a() {
  // console.log('before a1');
  yield delay('a1', 10);
  throw new Error('a')
  // console.log('before a2');
  yield delay('a2', 100);
  // console.log('before a3');
  yield delay('a3', 100);
  return 'last'
}
async function* b() {
  // console.log('before b1');
  yield delay('b1', 1000);
  // console.log('before b2');
  yield delay('b2', 1000);
  // console.log('before b3');
  yield delay('b3', 1000);
  return 'last'
}
