import { Schema, model, models } from 'mongoose';

const searchHistorySchema = new Schema(
  {
    sessionId: {
      type: String,
      required: false,
      index: true,
    },
    userId: {
      type: String,
      required: false,
      index: true,
    },
    searchTerm: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedTerm: {
      type: String,
      required: true,
      index: true,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeletedManually: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

// Índices compuestos para mejorar rendimiento
searchHistorySchema.index({ sessionId: 1, searchedAt: -1 });
searchHistorySchema.index({ userId: 1, searchedAt: -1 });
searchHistorySchema.index({ sessionId: 1, isArchived: 1, searchedAt: -1 });

searchHistorySchema.pre('save', function (next) {
  if (!this.sessionId && !this.userId) {
    next(new Error('Se requiere sessionId o userId'));
  } else {
    next();
  }
});

// Evitar recompilación del modelo
const SearchHistoryModel =
  models.SearchHistory || model('SearchHistory', searchHistorySchema, 'searchHistory');

export const SearchHistory = SearchHistoryModel;
