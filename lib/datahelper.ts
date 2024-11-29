// export const removeNullValues = <T>(obj: T): Partial<T> => {
//   return Object.fromEntries(
//     Object.entries(obj).filter(([_, value]) => value != null)
//   ) as Partial<T>;
// };

export const removeNullValues = <T extends Record<string, unknown>>(
  obj: T
): T => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined
    )
  ) as T;
};
