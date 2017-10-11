/* eslint-disable no-unused-expressions */
import { assert } from 'chai';
import Promise from 'core-js/library/es6/promise';

import { registerImageLoader,
       registerUnknownImageLoader,
       loadImage,
       loadAndCacheImage } from '../src/index';

describe('imageLoader registration module', function () {
  beforeEach(function () {
    this.exampleImageLoader1 = (imageId, options) => {
      console.log('loading via exampleImageLoader1');
      console.log(options);

      return Promise.resolve();
    };

    this.exampleImageLoader2 = (imageId, options) => {
      console.log('loading via exampleImageLoader2');
      console.log(options);

      return Promise.resolve();
    };

    this.exampleScheme1 = 'example1';
    this.exampleScheme2 = 'example2';

    this.exampleScheme1ImageId = `${this.exampleScheme1}://image1`;
    this.exampleScheme2ImageId = `${this.exampleScheme2}://image2`;

    this.options = {};
  });

  it('allows registration of new image loader', function () {
    registerImageLoader(this.exampleScheme1, this.exampleImageLoader1);
    registerImageLoader(this.exampleScheme2, this.exampleImageLoader2);

    const imagePromise1 = loadImage(this.exampleScheme1ImageId, this.options);

    assert.isDefined(imagePromise1);

    const imagePromise2 = loadImage(this.exampleScheme2ImageId, this.options);

    assert.isDefined(imagePromise2);
  });

  it('allows registration of unknown image loader', function () {
    let oldUnknownImageLoader = registerUnknownImageLoader(this.exampleImageLoader1);

    assert.isUndefined(oldUnknownImageLoader);

    // Check that it returns the old value for the unknown image loader
    oldUnknownImageLoader = registerUnknownImageLoader(this.exampleImageLoader1);
    assert.equal(oldUnknownImageLoader, this.exampleImageLoader1);
  });
});

describe('imageLoader loading module', function () {
  beforeEach(function () {
    this.exampleImageLoader3 = (imageId, options) => {
      console.log('loading via exampleImageLoader3');
      console.log(options);

      return Promise.resolve({
        imageId,
        sizeInBytes: 100
      });
    };

    this.exampleImageLoader4 = (imageId, options) => {
      console.log('loading via exampleImageLoader4');
      console.log(options);

      return Promise.resolve({
        imageId,
        sizeInBytes: 100
      });
    };

    this.exampleScheme3 = 'example3';
    this.exampleScheme4 = 'example4';

    this.exampleScheme3ImageId = `${this.exampleScheme3}://image3`;
    this.exampleScheme4ImageId = `${this.exampleScheme4}://image4`;

    this.options = {};
  });

  it('allows loading with storage in image cache (loadImage)', function () {
    registerImageLoader(this.exampleScheme3, this.exampleImageLoader3);
    const imagePromise3 = loadImage(this.exampleScheme3ImageId, this.options);

    assert.isDefined(imagePromise3);
  });

  it('allows loading without storage in image cache (loadAndCacheImage)', function () {
    registerImageLoader(this.exampleScheme3, this.exampleImageLoader3);
    const imagePromise3 = loadAndCacheImage(this.exampleScheme3ImageId, this.options);

    assert.isDefined(imagePromise3);
  });

  it('falls back to the unknownImageLoader if no appropriate scheme is present', function () {
    registerImageLoader(this.exampleScheme3, this.exampleImageLoader3);
    registerUnknownImageLoader(this.exampleImageLoader4);
    const imagePromise4 = loadAndCacheImage(this.exampleScheme4ImageId, this.options);

    assert.isDefined(imagePromise4);
  });
});
