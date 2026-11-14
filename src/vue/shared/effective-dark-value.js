export function effectiveDarkValue(darkValue, prefersDark) {
  if (darkValue === undefined || darkValue === null) {
    return prefersDark;
  }
  return darkValue;
}
