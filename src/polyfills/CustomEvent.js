/**
 * This module polyfills the CustomEvent() constructor for IE support
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
const CustomEventNative = window.CustomEvent;
let CustomEventImplementation = CustomEventNative;

function CustomEvent (event, params) {
  params = params || {
    bubbles: false,
    cancelable: false,
    detail: undefined
  };
  const evt = document.createEvent('CustomEvent');

  evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

  return evt;
}
CustomEvent.prototype = window.Event.prototype;

if (typeof CustomEventNative !== 'function') {
  CustomEventImplementation = CustomEvent;
}

// Module exports
export default CustomEventImplementation;
