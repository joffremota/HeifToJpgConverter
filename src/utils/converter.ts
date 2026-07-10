export async function convertHeifToJpeg(file: Blob, quality: number): Promise<Blob> {
  const { default: heic2any } = await import('heic2any');
  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality
  });

  const convertedBlob = Array.isArray(result) ? result[0] : result;

  if (!convertedBlob) {
    throw new Error('Nao foi possivel ler a imagem HEIF.');
  }

  if (convertedBlob.type === 'image/jpeg') {
    return convertedBlob;
  }

  return new Blob([convertedBlob], { type: 'image/jpeg' });
}
