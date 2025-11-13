import { Request, Response } from 'express';
import Search from '../../models/search.model';

// GET - Obtener todas las búsquedas
export async function getSearches(req: Request, res: Response): Promise<void> {
  try {
    const searches = await Search.find({}).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: searches.length,
      data: searches,
    });
  } catch (error) {
    console.error('Error getting searches: ', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching searches',
    });
  }
}

// POST - Crear nueva búsqueda (siempre crea nuevo registro)
export async function createSearch(req: Request, res: Response): Promise<void> {
  try {
    const { user_type, search_query, search_type, filters, timestamp } = req.body;

    // Validaciones
    if (!search_query) {
      res.status(400).json({
        success: false,
        error: 'search_query is required',
      });
      return;
    }

    // Si viene timestamp como string ISO, convertirlo a Date
    const currentTimestamp = timestamp ? new Date(timestamp) : new Date();

    // Preparar datos para nueva búsqueda
    // Si filters ya viene con filter_1, usarlo directamente
    // Si no, crear filter_1 con los valores proporcionados
    let filtersData: any = {};

    if (filters && filters.filter_1) {
      // Ya viene con la estructura filter_1
      filtersData = filters;
    } else if (filters) {
      // Viene como objeto plano, crear filter_1
      filtersData = {
        filter_1: {
          is_reset: filters.is_reset !== undefined ? filters.is_reset : false,
          fixer_name: filters.fixer_name || 'not_applied',
          city: filters.city || 'not_applied',
          job_type: filters.job_type || 'not_applied',
          search_count: filters.search_count || 0,
        },
      };
    } else {
      // Si no viene filters, crear uno por defecto
      filtersData = {
        filter_1: {
          is_reset: false,
          fixer_name: 'not_applied',
          city: 'not_applied',
          job_type: 'not_applied',
          search_count: 0,
        },
      };
    }

    const searchData = {
      user_type: user_type || 'visitor',
      search_query,
      search_type: search_type || 'search_box',
      filters: filtersData,
      timestamp: currentTimestamp,
    };

    const newSearch = await Search.create(searchData);

    res.status(201).json({
      success: true,
      message: 'Search created successfully',
      data: newSearch,
    });
  } catch (error) {
    console.error('Error creating search: ', error);
    res.status(500).json({
      success: false,
      error: 'Error creating search',
    });
  }
}

// PATCH - Actualizar el ÚLTIMO registro de búsqueda agregando filtros
export async function updateSearch(req: Request, res: Response): Promise<void> {
  try {
    const { filters: newFilterData } = req.body;

    if (!newFilterData) {
      res.status(400).json({
        success: false,
        error: 'filters data is required',
      });
      return;
    }

    // Buscar el ÚLTIMO registro (más reciente) sin filtros específicos
    const lastSearch = await Search.findOne({}).sort({ timestamp: -1 }); // Ordenar por timestamp descendente para obtener el más reciente

    if (!lastSearch) {
      res.status(404).json({
        success: false,
        message: 'No search found to update',
      });
      return;
    }

    // Obtener filters actuales (manejar tanto Map como Object)
    let currentFilters: any = {};

    if (lastSearch.filters instanceof Map) {
      currentFilters = Object.fromEntries(lastSearch.filters.entries());
    } else if (lastSearch.filters && typeof lastSearch.filters === 'object') {
      currentFilters = { ...lastSearch.filters };
    }

    // Obtener el número del próximo filtro
    // Buscar el número más alto de filter_X existente
    const filterKeys = Object.keys(currentFilters).filter((key) => key.startsWith('filter_'));
    let maxFilterNumber = 0;

    filterKeys.forEach((key) => {
      const match = key.match(/^filter_(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxFilterNumber) {
          maxFilterNumber = num;
        }
      }
    });

    const newFilterKey = `filter_${maxFilterNumber + 1}`;

    // Preparar nuevo filtro con estructura exacta
    // Normalizar fixer_name: convertir "a-c" a "A-C"
    let fixerName = newFilterData.fixer_name || 'not_applied';
    if (fixerName !== 'not_applied' && fixerName.includes('-')) {
      // Convertir "a-c" a "A-C"
      fixerName = fixerName
        .split('-')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
    }

    const newFilter = {
      is_reset: newFilterData.is_reset !== undefined ? newFilterData.is_reset : false,
      fixer_name: fixerName,
      city: newFilterData.city || 'not_applied',
      job_type: newFilterData.job_type || 'not_applied',
      search_count: newFilterData.search_count || 0,
    };

    // Agregar el nuevo filtro manteniendo la estructura
    const updatedFilters = {
      ...currentFilters,
      [newFilterKey]: newFilter,
    };

    // Actualizar la búsqueda
    lastSearch.filters = updatedFilters;
    lastSearch.timestamp = new Date();

    const updatedSearch = await lastSearch.save();

    res.status(200).json({
      success: true,
      message: 'Last search updated successfully with new filter',
      filter_added: newFilterKey,
      total_filters: Object.keys(updatedFilters).length,
      search_id: updatedSearch._id,
      data: updatedSearch,
    });
  } catch (error) {
    console.error('Error updating search: ', error);
    res.status(500).json({
      success: false,
      error: 'Error updating search',
    });
  }
}
// DELETE - Eliminar búsqueda(s)
export async function deleteSearch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (id) {
      // Eliminar una búsqueda específica por ID
      const deletedSearch = await Search.findByIdAndDelete(id);

      if (!deletedSearch) {
        res.status(404).json({
          success: false,
          message: 'Search not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Search deleted successfully',
        data: deletedSearch,
      });
    } else {
      // Si no se pasa un ID, eliminar todas las búsquedas
      const result = await Search.deleteMany({});

      res.status(200).json({
        success: true,
        message: 'All searches deleted successfully',
        deletedCount: result.deletedCount,
      });
    }
  } catch (error) {
    console.error('Error deleting search: ', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting search',
    });
  }
}
