export const removeNullValues = <T extends Record<string, unknown>>(
  obj: T
): T => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined
    )
  ) as T;
};
