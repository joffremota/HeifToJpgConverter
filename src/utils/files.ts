const heifExtensions = ['.heic', '.heif'];
const heifMimeTypes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];

export function isHeifFile(file: Pick<File, 'name' | 'type'>): boolean {
  const lowerName = file.name.toLowerCase();
  const lowerType = file.type.toLowerCase();

  return heifExtensions.some((extension) => lowerName.endsWith(extension)) || heifMimeTypes.includes(lowerType);
}

export function getFileStem(fileName: string): string {
  const cleanName = fileName.split(/[\\/]/).pop()?.trim() ?? '';
  const dotIndex = cleanName.lastIndexOf('.');
  const stem = dotIndex > 0 ? cleanName.slice(0, dotIndex) : cleanName;

  return stem || 'converted-image';
}

export function toJpegFileName(fileName: string): string {
  return `${getFileStem(fileName)}.jpg`;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  const precision = unitIndex === 0 || value >= 10 ? 0 : 1;

  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

export function createFileId(file: Pick<File, 'name' | 'size' | 'lastModified'>): string {
  const randomValue =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${file.name}-${file.size}-${file.lastModified}-${randomValue}`;
}
