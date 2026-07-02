import { compressImage } from './storage.service';

function canvasFile(width: number, height: number, type: string, name: string): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#c8a882';
  ctx.fillRect(0, 0, width, height);
  return new Promise(resolve =>
    canvas.toBlob(blob => resolve(new File([blob!], name, { type })), type)
  );
}

describe('compressImage', () => {
  it('downscales oversized images to max 1600px wide and re-encodes as JPEG', async () => {
    const file = await canvasFile(3200, 1800, 'image/png', 'big.png');
    // force the jpeg path by lying about the type
    const jpegFile = new File([file], 'big.jpg', { type: 'image/jpeg' });

    const { blob, extension } = await compressImage(jpegFile);
    const bitmap = await createImageBitmap(blob);

    expect(bitmap.width).toBe(1600);
    expect(bitmap.height).toBe(900);
    expect(extension).toBe('jpg');
    expect(blob.type).toBe('image/jpeg');
    bitmap.close();
  });

  it('keeps PNG format (transparency) when resizing', async () => {
    const file = await canvasFile(2000, 1000, 'image/png', 'wide.png');
    const { blob, extension } = await compressImage(file);
    expect(blob.type).toBe('image/png');
    expect(extension).toBe('png');
  });

  it('passes small files through untouched', async () => {
    const file = await canvasFile(800, 600, 'image/png', 'small.png');
    const { blob } = await compressImage(file);
    expect(blob).toBe(file);
  });

  it('passes GIF through untouched', async () => {
    const file = new File([new Uint8Array([0x47, 0x49, 0x46])], 'a.gif', { type: 'image/gif' });
    const { blob, extension } = await compressImage(file);
    expect(blob).toBe(file);
    expect(extension).toBe('gif');
  });
});
