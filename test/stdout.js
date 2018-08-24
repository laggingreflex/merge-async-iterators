process.on('message', (l = 'a') => {
  let i = 0
  setInterval(() => {
    console.log(l, i++);
  }, 100);
});
