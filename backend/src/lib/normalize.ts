export const normalizeDocument = <T extends object>(document: T | null) => {
  if (!document) return null;

  const { _id, ...rest } = document as Record<string, unknown> & { _id?: unknown };
  return {
    ...rest,
    id: typeof rest.id === "string" ? rest.id : String(_id ?? ""),
  } as T & { id: string };
};

export const buildSearchFilter = (query: any, fields: string[]) => {
  const value = String(query?.q ?? "").trim();
  if (!value) return {};

  return {
    $or: fields.map((field) => ({ [field]: { $regex: value, $options: "i" } })),
  };
};