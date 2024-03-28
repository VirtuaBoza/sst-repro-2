export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type RecordObject = Record<string, Record<string, any> | null>;

type ObjectMappingWithNestedMap<T extends RecordObject, K extends keyof T> = {
  key: K & string;
  mapping?: Record<string, Mapping<T>>;
  notNull?: true;
};
type ObjectMapping<T extends RecordObject, K extends keyof T> =
  | ObjectMappingWithNestedMap<T, K>
  | (K & string);

type ArrayMapping<T extends RecordObject, K extends keyof T> = [
  key: K,
  primaryKey:
    | keyof NonNullable<T[K]>
    | [keyof NonNullable<T[K]>, ...(keyof NonNullable<T[K]>)[]],
  mapping?: Record<string, Mapping<T>>
];

type Mapping<T extends RecordObject> = {
  [K in keyof T]: ArrayMapping<T, K> | ObjectMapping<T, K>;
}[keyof T];

type TopMapping<T extends RecordObject> = {
  [K in keyof T]: ArrayMapping<T, K>;
}[keyof T];

type MappedProperties<T extends RecordObject, M> = M extends Record<
  string,
  Mapping<T>
>
  ? {
      [K in keyof M]: InnerMapToNestedResult<T, M[K]>;
    }
  : {};

type InnerMapToNestedResult<
  T extends RecordObject,
  M extends Mapping<T>
> = M extends ArrayMapping<T, any>
  ? Array<Prettify<T[M[0]] & MappedProperties<T, M[2]>>>
  : M extends ObjectMappingWithNestedMap<T, any>
  ? null extends T[M["key"]]
    ? M["notNull"] extends true
      ? Prettify<T[M["key"]] & MappedProperties<T, M["mapping"]>>
      : null | Prettify<T[M["key"]] & MappedProperties<T, M["mapping"]>>
    : Prettify<T[M["key"]] & MappedProperties<T, M["mapping"]>>
  : M extends keyof T
  ? Prettify<T[M]>
  : never;

type MapToNestedResult<T extends RecordObject, M extends TopMapping<T>> = Array<
  Prettify<T[M[0]] & MappedProperties<T, M[2]>>
>;

export function mapToNested<T extends RecordObject, M extends TopMapping<T>>(
  records: T[],
  map: M
): Prettify<MapToNestedResult<T, M>> {
  const results = {} as Record<string, Record<string, any>>;

  for (const record of records) {
    mapNestedArray(record, map, results);
  }

  // return results as any;
  return toArrays(results, map as any) as any;
}

function mapNestedArray<T extends RecordObject>(
  record: T,
  map: ArrayMapping<T, keyof T>,
  parent: Record<string, any>
) {
  const [key, primaryKey, mapping] = map;
  const primaryKeyValue = (() => {
    const keyObj = record[key];
    if (!keyObj) {
      return null;
    }
    if (Array.isArray(primaryKey)) {
      return primaryKey.reduce<string>(
        (acc, cur) => `${acc}_${keyObj[cur as string]}`,
        ""
      );
    }

    return keyObj[primaryKey as string] as string | number;
  })();

  if (primaryKeyValue === null) {
    return;
  }

  if (!(primaryKeyValue in parent)) {
    // This is the first time we've seen this primary key value

    parent[primaryKeyValue] = record[key];

    // Do mapping of primitives and objects and stub nested arrays
    if (mapping) {
      parent[primaryKeyValue] = {
        ...parent[primaryKeyValue],
        ...Object.entries(mapping).reduce((acc, [mapKey, objKeyOrMap]) => {
          if (typeof objKeyOrMap === "string") {
            acc[mapKey] = record[objKeyOrMap];
          } else if (!Array.isArray(objKeyOrMap)) {
            acc[mapKey] = record[objKeyOrMap.key];
            if (acc[mapKey] && objKeyOrMap.mapping) {
              acc[mapKey] = {
                ...acc[mapKey],
                ...mapNestedObject(record, objKeyOrMap.mapping),
              };
            } else if (objKeyOrMap.notNull) {
              throw new Error(`Key ${mapKey} is null`);
            }
          } else {
            acc[mapKey] = {};
          }
          return acc;
        }, {} as Record<string, any>),
      };
    }
  }

  // Do mapping of nested array properties
  if (mapping) {
    const result = parent[primaryKeyValue]!;
    for (const [mapKey, objKeyOrMap] of Object.entries(mapping)) {
      if (Array.isArray(objKeyOrMap)) {
        mapNestedArray(record, objKeyOrMap, result[mapKey]);
      }
    }
  }
}

function mapNestedObject<T extends Record<string, any>>(
  obj: T,
  mapping: Record<string, Mapping<T>>
) {
  return Object.entries(mapping).reduce((acc, [mapKey, objKeyOrMap]) => {
    if (typeof objKeyOrMap === "string") {
      acc[mapKey] = obj[objKeyOrMap];
    } else if (!Array.isArray(objKeyOrMap)) {
      acc[mapKey] = obj[objKeyOrMap.key];
      if (acc[mapKey] && objKeyOrMap.mapping) {
        acc[mapKey] = {
          ...acc[mapKey],
          ...mapNestedObject(obj, objKeyOrMap.mapping),
        };
      } else if (objKeyOrMap.notNull) {
        throw new Error(`Key ${mapKey} is null`);
      }
    } else {
      acc[mapKey] = {};
      mapNestedArray(obj, objKeyOrMap, acc[mapKey]);
    }
    return acc;
  }, {} as Record<string, any>);
}

function toArrays(
  mappedObjs: Record<string, Record<string, any>>,
  map: ArrayMapping<any, any>
) {
  return Object.values(mappedObjs).map((obj) => {
    if (map[2]) {
      for (const [mapKey, objKeyOrMap] of Object.entries(map[2])) {
        if (Array.isArray(objKeyOrMap)) {
          obj[mapKey] = toArrays(obj[mapKey], objKeyOrMap);
        } else if (
          typeof objKeyOrMap === "object" &&
          obj[objKeyOrMap.key] &&
          objKeyOrMap.mapping
        ) {
          diveIntoObjForArrays(obj[objKeyOrMap.key], objKeyOrMap.mapping);
        }
      }
    }
    return obj;
  });
}

function diveIntoObjForArrays(
  obj: Record<string, any>,
  mapping: Record<string, Mapping<any>>
) {
  for (const [mapKey, objKeyOrMap] of Object.entries(mapping)) {
    if (Array.isArray(objKeyOrMap)) {
      obj[mapKey] = toArrays(obj[mapKey], objKeyOrMap);
    } else if (
      objKeyOrMap &&
      typeof objKeyOrMap === "object" &&
      obj[objKeyOrMap.key] &&
      objKeyOrMap.mapping
    ) {
      diveIntoObjForArrays(obj[objKeyOrMap.key], objKeyOrMap.mapping);
    }
  }
}
