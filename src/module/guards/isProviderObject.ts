
export const isProviderObject = (x: any): x is { name: string | symbol, value: any } => {
  return x && x.name && x.value
};

export default isProviderObject