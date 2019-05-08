export default function displayWebGLErrorMessage() {
  const version = 1;

  const names = {
    1: 'WebGL',
    2: 'WebGL 2',
  };

  const contexts = {
    // @ts-ignore
    1: window.WebGLRenderingContext,
    // @ts-ignore
    2: window.WebGL2RenderingContext,
  };

  const platform = contexts[version] ? 'graphics card' : 'browser';

  const message = `Your ${platform} does not seem to support
  <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">${
    names[version]
  }</a>`;

  const element = document.createElement('div');
  element.id = 'webglmessage';
  element.style.fontFamily = 'Open Sans';
  element.style.fontSize = '13px';
  element.style.fontWeight = 'normal';
  element.style.textAlign = 'center';
  element.style.background = '#fff';
  element.style.color = '#000';
  element.style.padding = '1.5em';
  element.style.width = '400px';
  element.style.margin = '5em auto 0';

  element.textContent = message;

  return element;
}
