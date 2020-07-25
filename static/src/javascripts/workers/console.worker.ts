const wk: Worker = self as any;

wk.addEventListener('message', (event) => {
  if (event.data.name === 'log') {
    console.log('Log: ', event.data.params);
  } else if (event.data.name === 'error') {
    console.info('Info: ', event.data.params);
  }

  wk.postMessage({
    name: event.data.name,
    message: 'Success to send message with ' + event.data.params,
  });
});
