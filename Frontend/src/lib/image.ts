export type ProcessAvatarOptions = {
  /** Maximum size in pixels for the longest edge. */
  maxDimension?: number;
  /** JPEG quality (0-1). */
  quality?: number;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('Failed to read file.'));
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unsupported file format.'));
      }
    };
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image could not be loaded.'));
    image.src = src;
  });

export const processAvatarFile = async (
  file: File,
  options: ProcessAvatarOptions = {}
): Promise<string> => {
  const { maxDimension = 320, quality = 0.88 } = options;

  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const longestEdge = Math.max(img.width, img.height);
  const scale = longestEdge > maxDimension ? maxDimension / longestEdge : 1;
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable.');
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  try {
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return canvas.toDataURL('image/png');
  }
};

