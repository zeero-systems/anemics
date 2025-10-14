
export class Builder {
  public static assign(target: any, ...sources: any[]): any {
    sources.forEach((source: any) => {
      const descriptors: { [key: string | number | symbol]: any } = {} 

      while (source && source !== Object.prototype) {
          const propertyNames = Object.getOwnPropertyNames(source);

          for (const name of propertyNames) {
              const descriptor = Object.getOwnPropertyDescriptor(source, name);
              if (descriptor && !descriptors[name]) {
                  descriptors[name] = descriptor
              }
          }
          source = Object.getPrototypeOf(source);
      }

      Object.defineProperties(target, descriptors);
    });
    return target;
  }
}

export default Builder
