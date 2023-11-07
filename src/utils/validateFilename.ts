function validateFilename(filename: string): boolean {
  const pattern: RegExp = /^[a-z]+$/i;
  return pattern.test(filename);
}

export { validateFilename };