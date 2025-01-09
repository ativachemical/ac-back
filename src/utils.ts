import * as path from 'path';

export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// export function toSnakeCase(str: string): string {
//   return str
//     .replace(/\s+/g, '_')
//     .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
//     .replace(/-+/g, '_')
//     .toLowerCase();
// }

export function toSnakeCase(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([A-Z])/g, (letter) => `${letter.toLowerCase()}`)
    .replace(/\s+/g, '_');
}

export function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export const limitString = (string: string | null, maxLength: number): string | null => {
  return string && string.length > maxLength ? string.substring(0, maxLength) + '...' : string;
};

export function getPath(relativePath: string): string {
  const normalizedPath = path.normalize(relativePath.replace(/^\.\//, '')); // Remove './' inicial, se existir
  return path.join(process.cwd(), normalizedPath);
}

export function currentDate() {
  const now = new Date();
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(now);
}
