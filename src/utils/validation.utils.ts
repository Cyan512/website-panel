export const isEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isRequired = (value: string) => {
  return value.trim().length > 0;
};
