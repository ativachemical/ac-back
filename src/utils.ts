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
