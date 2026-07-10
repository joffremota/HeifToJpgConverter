import { describe, expect, it } from 'vitest';
import { formatFileSize, getFileStem, isHeifFile, toJpegFileName } from './files';

describe('file utilities', () => {
  it('identifica arquivos HEIF por extensao ou tipo MIME', () => {
    expect(isHeifFile({ name: 'IMG_001.HEIC', type: '' })).toBe(true);
    expect(isHeifFile({ name: 'photo.bin', type: 'image/heif' })).toBe(true);
    expect(isHeifFile({ name: 'photo.jpg', type: 'image/jpeg' })).toBe(false);
  });

  it('gera nomes JPG preservando o nome base', () => {
    expect(getFileStem('C:\\Fotos\\imagem.heic')).toBe('imagem');
    expect(toJpegFileName('imagem.final.heif')).toBe('imagem.final.jpg');
    expect(toJpegFileName('')).toBe('converted-image.jpg');
  });

  it('formata tamanhos de arquivo de forma compacta', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(12 * 1024 * 1024)).toBe('12 MB');
  });
});
