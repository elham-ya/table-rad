export const findString = (
  str: string | undefined | null,
  stringCollection?: Record<string, string> | null,
) => {
  if (!str) return null;

  if (stringCollection && str in stringCollection) {
    return stringCollection[str];
  }
  return str;
};
