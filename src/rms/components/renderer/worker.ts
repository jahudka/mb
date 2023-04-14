import { Renderer } from './renderer';

const renderer = new Renderer();

renderer.on('render', (peak, rms) => {
  self.postMessage({ event: 'render', args: [peak, rms] });
});

self.addEventListener('message', (evt) => {
  if (evt.data.canvas) {
    renderer.setCanvas(evt.data.type, evt.data.canvas);
  } else if ('reset' in evt.data) {
    renderer.reset();
  } else if ('option' in evt.data) {
    renderer.setOption(evt.data.option, evt.data.value);
  }
});
