/**
 * This module provides a simple event listener
 */

import CustomEvent from './polyfills/CustomEvent.js';
import { $ } from './externalModules.js'; // DEPRECATE

const eventListenersByType = {};

// Registers an event listener
export function addEventListener (type, callback) {
  const eventListeners = eventListenersByType[type] || [];

  eventListeners.push(callback);
  eventListenersByType[type] = eventListeners;
}

// Dispatches an event
export function dispatchEvent (type, data) {
  const eventListeners = eventListenersByType[type];

  if (!eventListeners || eventListeners.length < 1) {
    return;
  }

  for (let i = 0; i < eventListeners.length; i++) {
    eventListeners[i](data);
  }
}

const LEGACY_EVENT_TYPES = {
  activelayerchange: 'CornerstoneActiveLayerChanged',
  elementenable: 'CornerstoneElementEnabled',
  elementdisable: 'CornerstoneElementDisabled',
  elementresize: 'CornerstoneElementResized',
  imagecachechange: 'CornerstoneImageCacheChanged',
  imagecachefull: 'CornerstoneImageCacheFull',
  imagecachemaximumsizechange: 'CornerstoneImageCacheMaximumSizeChanged',
  imagecachepromiseresolve: 'CornerstoneImageCachePromiseRemoved',
  imageload: 'CornerstoneImageLoaded',
  imagerender: 'CornerstoneImageRendered',
  invalidate: 'CornerstoneInvalidated',
  layeradd: 'CornerstoneLayerAdded',
  layerremove: 'CornerstoneLayerRemoved',
  newimage: 'CornerstoneNewImage',
  prerender: 'CornerstonePreRender',
  webgltexturecachefull: 'CornerstoneWebGLTextureCacheFull',
  webgltextureremove: 'CornerstoneWebGLTextureRemoved'
};

export function createAndDispatchEvent (element, eventType, eventData) {
  const event = new CustomEvent(eventType, { detail: eventData });

  element.dispatchEvent(event);

  // DEPRECATE: Support legacy jQuery listeners
  const oldEventType = LEGACY_EVENT_TYPES[eventType];

  // DEPRECATE: Trigger legacy jQuery event
  $(element).trigger(oldEventType, eventData);
}

export default {
  addEventListener,
  dispatchEvent
};
