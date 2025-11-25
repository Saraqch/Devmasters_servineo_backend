import mongoose, { Schema, Document } from 'mongoose';

export interface Filter extends Document {
  is_reset: boolean;
  fixer_name: string;
  city: string;
  job_type: string;
  search_count: number;
}

export interface Search extends Document {
  user_type: string;
  search_query: string;
  search_type: string;
  filters: {
    [key: string]: Filter;
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FilterSchema: Schema = new Schema(
  {
    is_reset: {
      type: Boolean,
      required: true,
      default: false,
    },
    fixer_name: {
      type: String,
      required: true,
      default: 'not_applied',
    },
    city: {
      type: String,
      required: true,
      default: 'not_applied',
    },
    job_type: {
      type: String,
      required: true,
      default: 'not_applied',
    },
    search_count: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false },
);

const SearchSchema: Schema = new Schema(
  {
    user_type: {
      type: String,
      required: true,
      default: 'not_applied',
    },
    search_query: {
      type: String,
      required: true,
      default: 'not_applied',
    },
    search_type: {
      type: String,
      required: true,
      default: 'not_applied',
    },
    filters: {
      type: Schema.Types.Mixed,
      required: false,
      default: {},
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

SearchSchema.methods.toJSON = function () {
  const search = this.toObject();

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  if (search.createdAt) {
    search.createdAt = new Date(search.createdAt).toLocaleString('es-BO', options);
  }

  if (search.updatedAt) {
    search.updatedAt = new Date(search.updatedAt).toLocaleString('es-BO', options);
  }

  if (search.timestamp) {
    search.timestamp = new Date(search.timestamp).toISOString();
  }

  // Asegurar que filters sea un objeto, no un Map
  if (search.filters instanceof Map) {
    search.filters = Object.fromEntries(search.filters.entries());
  }

  return search;
};

SearchSchema.index({ user_type: 1 });
SearchSchema.index({ search_query: 1 });
SearchSchema.index({ timestamp: -1 });

const Search = mongoose.model<Search>('search', SearchSchema);
export default Search;
