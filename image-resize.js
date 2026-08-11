// Client-side image resizing, applied before anything reaches Storage.
//
// Uploads averaged 2.9 MB last semester because phone photos went up at full
// resolution, which put 735 MB in the bucket for a single term across two
// classes. Nothing on screen needs more than about 2000px on the long edge.
//
// Two side effects worth knowing about, both wanted:
//
// 1. Re-encoding through a canvas drops EXIF, which includes the GPS
//    coordinates a phone writes into a photo. Student work is published to a
//    public portfolio, so shedding location data is a feature.
//
// 2. Dropping EXIF also drops the orientation flag, which is how portrait
//    photos end up sideways. createImageBitmap is asked to bake the rotation
//    into the pixels first, so the visible result is correct.

const MAX_EDGE = 2000;
const JPEG_QUALITY = 0.82;
const OUTPUT_TYPE = 'image/jpeg';

function scaledSize(width, height, maxEdge) {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) {
    return { width, height, scaled: false };
  }
  const ratio = maxEdge / longest;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
    scaled: true
  };
}

function renameToJpeg(name) {
  const base = String(name || 'image').replace(/\.[^.]+$/, '');
  return `${base}.jpg`;
}

async function decode(file) {
  // imageOrientation bakes the EXIF rotation into the bitmap so the re-encoded
  // file is the right way up without carrying the metadata forward.
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return await createImageBitmap(file);
  }
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Resize an image file for upload.
 *
 * Never throws and never blocks an upload. Anything it cannot decode, such as a
 * format the browser has no support for, comes back untouched so the original
 * still uploads and Storage rules stay the backstop.
 */
export async function resizeImage(file, options = {}) {
  const maxEdge = options.maxEdge ?? MAX_EDGE;
  const quality = options.quality ?? JPEG_QUALITY;

  if (!file || !file.type?.startsWith('image/')) {
    return file;
  }

  let bitmap;
  try {
    bitmap = await decode(file);
  } catch (error) {
    console.warn('Could not decode image, uploading original:', error?.message || error);
    return file;
  }

  try {
    const { width, height, scaled } = scaledSize(bitmap.width, bitmap.height, maxEdge);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await toBlob(canvas, OUTPUT_TYPE, quality);
    if (!blob) return file;

    // A small, already-compressed JPEG can come back bigger after re-encoding.
    // Only take the new one when it actually helps, unless a resize happened,
    // in which case the smaller pixel count is the point.
    if (!scaled && blob.size >= file.size) {
      return file;
    }

    return new File([blob], renameToJpeg(file.name), {
      type: OUTPUT_TYPE,
      lastModified: Date.now()
    });
  } catch (error) {
    console.warn('Could not resize image, uploading original:', error?.message || error);
    return file;
  } finally {
    bitmap.close?.();
  }
}

/** Resize a list of files, preserving order. */
export async function resizeImages(files, options = {}) {
  return Promise.all(Array.from(files).map((file) => resizeImage(file, options)));
}

/**
 * True when a file will not display for most people who open the portfolio.
 *
 * iPhones shoot HEIC by default and it renders in Safari but not in Chrome or
 * Firefox. Six images from last semester went up this way and have been broken
 * for most viewers ever since, with nothing anywhere saying so.
 *
 * Call this AFTER resizing. On Safari the resize decodes the HEIC and re-encodes
 * it as JPEG, which fixes the problem silently and this returns false. It only
 * returns true when the conversion could not happen, which is exactly when the
 * student needs telling.
 */
export function isUndisplayable(file) {
  const type = (file?.type || '').toLowerCase();
  const name = (file?.name || '').toLowerCase();
  return type.includes('heic') || type.includes('heif') ||
    name.endsWith('.heic') || name.endsWith('.heif');
}
