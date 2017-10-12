import { assert } from 'chai';
import Promise from 'core-js/library/es6/promise';

import { setMaximumSizeBytes,
         putImagePromise,
         getImagePromise,
         removeImagePromise,
         getCacheInfo,
         purgeCache,
         changeImageIdCacheSize } from '../src/imageCache.js';

import events from '../src/events.js';

describe('Set maximum cache size', function () {
  it('should allow setting of cache size', function () {
    // Arrange
    const maximumSizeInBytes = 1024 * 1024 * 1024;

    // Act
    setMaximumSizeBytes(maximumSizeInBytes);

    // Assert
    const cacheInfo = getCacheInfo();

    assert.equal(cacheInfo.maximumSizeInBytes, maximumSizeInBytes);
  });

  it('should fail if numBytes is not defined', function () {
    assert.throws(() => setMaximumSizeBytes(undefined));
  });

  it('should fail if numBytes is not a number', function () {
    assert.throws(() => setMaximumSizeBytes('10000'));
  });
});

describe('Store, retrieve, and remove imagePromises from the cache', function () {
  before(function () {
    // Act
    purgeCache();
  });

  beforeEach(function () {
    // Arrange

    this.imagePromise = new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
    this.image = {
      imageId: 'anImageId',
      sizeInBytes: 100
    };

    purgeCache();
  });

  it('should allow image promises to be added to the cache (putImagePromise)', function () {
    const image = this.image;
    const imagePromise = this.imagePromise;

    // Act
    putImagePromise(image.imageId, imagePromise);
    this.resolvePromise(image);

    // Assert
    return imagePromise.then(() => {
      const cacheInfo = getCacheInfo();

      assert.equal(cacheInfo.numberOfImagesCached, 1);
      assert.equal(cacheInfo.cacheSizeInBytes, this.image.sizeInBytes);
    });
  });

  it('should throw an error if sizeInBytes is undefined (putImagePromise)', function () {
    // Arrange
    this.image.sizeInBytes = undefined;

    const putPromise = putImagePromise(this.image.imageId, this.imagePromise);

    // Act
    this.resolvePromise(this.image);

    // Assert
    return putPromise.then(assert.fail, assert.isDefined);
  });

  it('should throw an error if sizeInBytes is not a number (putImagePromise)', function () {
    // Arrange
    this.image.sizeInBytes = '10000';

    const putPromise = putImagePromise(this.image.imageId, this.imagePromise);

    // Act
    this.resolvePromise(this.image);

    // Assert
    return putPromise.then(assert.fail, assert.isDefined);
  });

  it('should throw an error if imageId is not defined (putImagePromise)', function () {
    // Assert
    assert.throws(() => putImagePromise(undefined, this.imagePromise));
  });

  it('should throw an error if imagePromise is not defined (putImagePromise)', function () {
    // Assert
    assert.throws(() => putImagePromise(this.image.imageId, undefined));
  });

  it('should throw an error if imageId is already in the cache (putImagePromise)', function () {
    // Arrange
    putImagePromise(this.image.imageId, this.imagePromise);

    // Assert
    assert.throws(() => putImagePromise(this.image.imageId, this.imagePromise));
  });

  it('should allow image promises to be retrieved from the cache (getImagePromise)', function () {
    const image = this.image;
    const imagePromise = this.imagePromise;

    // Act
    putImagePromise(image.imageId, imagePromise);

    // Assert
    const retrievedPromise = getImagePromise(image.imageId);

    assert.equal(imagePromise, retrievedPromise);
  });

  it('should throw an error if imageId is not defined (getImagePromise)', function () {
    // Assert
    assert.throws(() => getImagePromise(undefined));
  });

  it('should fail silently to retrieve a promise for an imageId not in the cache', function () {
    // Act
    const retrievedPromise = getImagePromise('AnImageIdNotInCache');

    // Assert
    assert.isUndefined(retrievedPromise, undefined);
  });

  it('should allow image promises to be removed from the cache (removeImagePromise)', function () {
    const image = this.image;
    const imagePromise = this.imagePromise;

    // Arrange
    putImagePromise(image.imageId, imagePromise);

    // Act
    removeImagePromise(image.imageId);

    // Assert
    imagePromise.then(() => {
      // Fail if the Promise is resolved.
      assert.equal(true, false);
    });

    // Make sure that the cache is now empty
    const cacheInfo = getCacheInfo();

    assert.equal(cacheInfo.numberOfImagesCached, 0);
    assert.equal(cacheInfo.cacheSizeInBytes, 0);
  });

  it('should fail if imageId is not defined (removeImagePromise)', function () {
    assert.throws(() => removeImagePromise(undefined));
  });

  it('should fail if imageId is not in cache (removeImagePromise)', function () {
    assert.throws(() => removeImagePromise('RandomImageId'));
  });

  it('should allow image promises to have their cache size changed', function () {
    const image = this.image;
    const imagePromise = this.imagePromise;

    // Arrange
    putImagePromise(image.imageId, imagePromise);
    this.resolvePromise(image);

    return imagePromise.then(() => {
      const newCacheSize = 500;

      // Act
      return changeImageIdCacheSize(image.imageId, newCacheSize).then(() => {
        // Assert
        const cacheInfo = getCacheInfo();

        assert.equal(cacheInfo.numberOfImagesCached, 1);
        assert.equal(cacheInfo.cacheSizeInBytes, newCacheSize);
      });
    });
  });

  it('should be able to purge the entire cache', function () {
    const image = this.image;
    const imagePromise = this.imagePromise;

    // Arrange
    putImagePromise(image.imageId, imagePromise);
    this.resolvePromise(image);

    // Act
    purgeCache();

    // Make sure that the cache is now empty
    const cacheInfo = getCacheInfo();

    assert.equal(cacheInfo.numberOfImagesCached, 0);
    assert.equal(cacheInfo.cacheSizeInBytes, 0);
  });

  it('should be able to kick the oldest image out of the cache', function () {
    // Arrange
    setMaximumSizeBytes(1000);

    for (let i = 0; i < 10; i++) {
      // Create the image
      const image = {
        imageId: `imageId-${i}`,
        sizeInBytes: 100
      };
      const imagePromise = Promise.resolve(image);

      image.decache = () => console.log('decaching image');

      // Add it to the cache
      putImagePromise(image.imageId, imagePromise);
    }

    // Setup event listeners to check that the promise removed and cache full events have fired properly
    events.addEventListener('imagecachepromiseresolve', ({ detail }) => {
      // Detect that the earliest image added has been removed
      console.log('CornerstoneImageCachePromiseRemoved');

      assert.equal(detail.imageId, 'imageId-5');
      assert.isDefined(detail.imageId);
    });

    events.addEventListener('imagecachefull', ({ detail }) => {
      console.log('CornerstoneImageCacheFull');
      const currentInfo = getCacheInfo();

      assert.deepEqual(detail, currentInfo);
    });

    // Retrieve a few of the imagePromises in order to bump their timestamps
    getImagePromise('imageId-5');
    const bumpTimePromise = new Promise((resolve) => setTimeout(() => {
      // This way image 5 should have timestamp at least one ms lower
      getImagePromise('imageId-0');
      getImagePromise('imageId-4');
      getImagePromise('imageId-6');
      getImagePromise('imageId-3');
      getImagePromise('imageId-7');
      getImagePromise('imageId-2');
      getImagePromise('imageId-8');
      getImagePromise('imageId-1');
      getImagePromise('imageId-9');
      resolve();
    }, 1));

    // Act
    // Create another image which will push us over the cache limit
    const extraImage = {
      imageId: 'imageId-11',
      sizeInBytes: 100
    };

    // Wait for timestamps to be bumped
    return bumpTimePromise.then(() => {
      const extraImagePromise = Promise.resolve(extraImage);

      // Add extra image to the cache so it exceeds limit
      return putImagePromise(extraImage.imageId, extraImagePromise);
    }).then(() => {
      // Make sure that the cache has pushed out the first image
      const cacheInfo = getCacheInfo();

      assert.equal(cacheInfo.numberOfImagesCached, 10);
      assert.equal(cacheInfo.cacheSizeInBytes, 1000);
    });
  });
});
