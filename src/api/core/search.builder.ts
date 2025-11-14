// src/api/core/search.builder.ts

type MongoRegexQuery = Record<string, RegExp>;
type MongoSearchQuery =
  | Record<string, never>
  | { $or: MongoRegexQuery[] }
  | { $or: { $and: MongoRegexQuery[] }[] }
  | { $text: { $search: string } };

export class SearchBuilder {
  /**
   * Búsqueda básica con regex simple
   */
  static build(searchText: string | undefined, fields: string[]): MongoSearchQuery {
    if (!searchText?.trim()) return {};

    const regex = new RegExp(searchText.trim(), 'i');
    return {
      $or: fields.map((field) => ({ [field]: regex })),
    };
  }

  /**
   * Búsqueda con normalizador (para acentos, etc)
   */
  static buildWithNormalizer(
    searchText: string | undefined,
    fields: string[],
    normalizer: (text: string) => string,
  ): MongoSearchQuery {
    if (!searchText?.trim()) return {};

    const normalized = normalizer(searchText.trim());
    const regex = new RegExp(normalized, 'i');
    return {
      $or: fields.map((field) => ({ [field]: regex })),
    };
  }

  /**
   * Búsqueda por tokens (palabras separadas)
   */
  static buildTokenSearch(
    searchText: string | undefined,
    fields: string[],
    normalizer?: (text: string) => string,
  ): MongoSearchQuery {
    if (!searchText?.trim()) return {};

    const tokens = searchText
      .trim()
      .split(/[\s,\-_.]+/)
      .filter((token) => token.length > 0);

    if (tokens.length === 0) return {};

    if (tokens.length === 1) {
      const token = tokens[0];
      const basePattern = normalizer ? normalizer(token) : token;
      const bounded = `\\b${basePattern}\\b`;

      return {
        $or: fields.map((field) => ({ [field]: new RegExp(bounded, 'i') })),
      };
    }

    return {
      $or: fields.map((field) => ({
        $and: tokens.map((token) => {
          const part = normalizer ? normalizer(token) : token;
          const pattern = `\\b${part}\\b`;
          return { [field]: new RegExp(pattern, 'i') };
        }),
      })),
    };
  }

  /**
   * Búsqueda inteligente: detecta si debe buscar por tokens o simple
   */
  static buildSmartSearch(
    searchText: string | undefined,
    fields: string[],
    normalizer?: (text: string) => string,
  ): MongoSearchQuery {
    if (!searchText?.trim()) return {};

    const trimmed = searchText.trim();

    if (/[,\-_.\s]/.test(trimmed)) {
      return this.buildTokenSearch(trimmed, fields, normalizer);
    }

    const pattern = normalizer ? normalizer(trimmed) : trimmed;
    const bounded = `\\b${pattern}\\b`;
    return {
      $or: fields.map((field) => ({ [field]: new RegExp(bounded, 'i') })),
    };
  }

  static buildWeightedSearch(searchText: string | undefined): MongoSearchQuery {
    if (!searchText?.trim()) return {};

    return {
      $text: { $search: searchText.trim() },
    };
  }
}
