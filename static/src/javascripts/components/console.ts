const worker = new Worker('./../workers/console.worker.ts', { type: 'module' });

/**
 * An example of worker
 */
export const consoleWorker = (): void => {
  worker.postMessage({
    name: 'log',
    params: 'Hello World',
  });

  worker.postMessage({
    name: 'info',
    params: 'This is an info',
  });

  worker.addEventListener('message', (event) => {
    const data = event.data;
    console.log(data.name, data.message);
  });
};
