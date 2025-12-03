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

// GET - Búsquedas de la última semana
// GET - Búsquedas de la última semana
export async function getLastWeekSearches(req: Request, res: Response): Promise<void> {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const searches = await Search.find({
      timestamp: { $gte: oneWeekAgo },
    }).sort({ timestamp: -1 });

    // Inicializar contadores
    const filterStats = {
      fixer_name: {
        'A-C': 0,
        'D-F': 0,
        'G-I': 0,
        'J-L': 0,
        'M-N': 0,
        'O-Q': 0,
        'R-T': 0,
        'U-W': 0,
        'X-Z': 0,
      },
      city: {
        Cochabamba: 0,
        'La Paz': 0,
        'Santa Cruz': 0,
        Pando: 0,
        Potosi: 0,
        Sucre: 0,
        Beni: 0,
        Oruro: 0,
        Tarija: 0,
      },
      job_type: {
        Carpintero: 0,
        Electricista: 0,
        Plomeria: 0,
        Albañil: 0,
        Mecanico: 0,
        Jardinero: 0,
        Fontanero: 0,
        Pintor: 0,
        Cerrajero: 0,
        Decorador: 0,
      },
    };

    // Inicializar contadores de tipos de usuario
    const userTypeStats = {
      visitor: 0,
      requester: 0,
      fixer: 0,
    };

    // Procesar cada búsqueda y sus filtros
    searches.forEach((search) => {
      // Contar tipo de usuario
      if (search.user_type) {
        const userType = search.user_type.toLowerCase();
        if (userType === 'visitor') userTypeStats.visitor++;
        else if (userType === 'requester') userTypeStats.requester++;
        else if (userType === 'fixer') userTypeStats.fixer++;
      }

      const filters = search.filters;

      if (filters && typeof filters === 'object') {
        // Iterar sobre todos los filtros (filter_1, filter_2, etc.)
        Object.values(filters).forEach((filter: any) => {
          if (filter && typeof filter === 'object') {
            // Procesar fixer_name (puede contener múltiples valores separados por coma)
            if (filter.fixer_name && filter.fixer_name !== 'not_applied') {
              const fixerNames = filter.fixer_name.split(',').map((name: string) => name.trim());
              fixerNames.forEach((name: string) => {
                const normalizedName = name.toUpperCase();
                if (normalizedName === 'A-C') filterStats.fixer_name['A-C']++;
                else if (normalizedName === 'D-F') filterStats.fixer_name['D-F']++;
                else if (normalizedName === 'G-I') filterStats.fixer_name['G-I']++;
                else if (normalizedName === 'J-L') filterStats.fixer_name['J-L']++;
                else if (normalizedName === 'M-N') filterStats.fixer_name['M-N']++;
                else if (normalizedName === 'O-Q') filterStats.fixer_name['O-Q']++;
                else if (normalizedName === 'R-T') filterStats.fixer_name['R-T']++;
                else if (normalizedName === 'U-W') filterStats.fixer_name['U-W']++;
                else if (normalizedName === 'X-Z') filterStats.fixer_name['X-Z']++;
              });
            }

            // Procesar city
            if (filter.city && filter.city !== 'not_applied') {
              const cities = filter.city.split(',').map((city: string) => city.trim());
              cities.forEach((city: string) => {
                // Normalizar nombre de ciudad
                let normalizedCity = city.toLowerCase();
                // Mapear variantes
                if (normalizedCity.includes('cochabamba')) filterStats.city['Cochabamba']++;
                else if (normalizedCity.includes('la paz')) filterStats.city['La Paz']++;
                else if (normalizedCity.includes('santa cruz')) filterStats.city['Santa Cruz']++;
                else if (normalizedCity.includes('pando')) filterStats.city['Pando']++;
                else if (normalizedCity.includes('potosi') || normalizedCity.includes('potosí'))
                  filterStats.city['Potosi']++;
                else if (normalizedCity.includes('sucre')) filterStats.city['Sucre']++;
                else if (normalizedCity.includes('beni')) filterStats.city['Beni']++;
                else if (normalizedCity.includes('oruro')) filterStats.city['Oruro']++;
                else if (normalizedCity.includes('tarija')) filterStats.city['Tarija']++;
                else if (normalizedCity.includes('chuquisaca')) filterStats.city['Sucre']++; // Chuquisaca = Sucre
              });
            }

            // Procesar job_type
            if (filter.job_type && filter.job_type !== 'not_applied') {
              const jobTypes = filter.job_type.split(',').map((job: string) => job.trim());
              jobTypes.forEach((job: string) => {
                const normalizedJob = job.toLowerCase();
                if (normalizedJob.includes('carpintero')) filterStats.job_type['Carpintero']++;
                else if (normalizedJob.includes('electricista'))
                  filterStats.job_type['Electricista']++;
                else if (normalizedJob.includes('plomer') || normalizedJob.includes('plomería'))
                  filterStats.job_type['Plomeria']++;
                else if (normalizedJob.includes('albañil')) filterStats.job_type['Albañil']++;
                else if (normalizedJob.includes('mecanico') || normalizedJob.includes('mecánico'))
                  filterStats.job_type['Mecanico']++;
                else if (normalizedJob.includes('jardinero')) filterStats.job_type['Jardinero']++;
                else if (normalizedJob.includes('fontanero')) filterStats.job_type['Fontanero']++;
                else if (normalizedJob.includes('pintor')) filterStats.job_type['Pintor']++;
                else if (normalizedJob.includes('cerrajero')) filterStats.job_type['Cerrajero']++;
                else if (normalizedJob.includes('decorador')) filterStats.job_type['Decorador']++;
              });
            }
          }
        });
      }
    });

    res.status(200).json({
      success: true,
      count: searches.length,
      period: 'last_week',
      start_date: oneWeekAgo,
      end_date: new Date(),
      filter_statistics: filterStats,
      user_type_statistics: userTypeStats,
    });
  } catch (error) {
    console.error('Error getting last week searches: ', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching last week searches',
    });
  }
}

// GET - Búsquedas del último mes
export async function getLastMonthSearches(req: Request, res: Response): Promise<void> {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const searches = await Search.find({
      timestamp: { $gte: oneMonthAgo },
    }).sort({ timestamp: -1 });

    // Inicializar contadores
    const filterStats = {
      fixer_name: {
        'A-C': 0,
        'D-F': 0,
        'G-I': 0,
        'J-L': 0,
        'M-N': 0,
        'O-Q': 0,
        'R-T': 0,
        'U-W': 0,
        'X-Z': 0,
      },
      city: {
        Cochabamba: 0,
        'La Paz': 0,
        'Santa Cruz': 0,
        Pando: 0,
        Potosi: 0,
        Sucre: 0,
        Beni: 0,
        Oruro: 0,
        Tarija: 0,
      },
      job_type: {
        Carpintero: 0,
        Electricista: 0,
        Plomeria: 0,
        Albañil: 0,
        Mecanico: 0,
        Jardinero: 0,
        Fontanero: 0,
        Pintor: 0,
        Cerrajero: 0,
        Decorador: 0,
      },
    };

    // Inicializar contadores de tipos de usuario
    const userTypeStats = {
      visitor: 0,
      requester: 0,
      fixer: 0,
    };

    // Procesar cada búsqueda y sus filtros
    searches.forEach((search) => {
      // Contar tipo de usuario
      if (search.user_type) {
        const userType = search.user_type.toLowerCase();
        if (userType === 'visitor') userTypeStats.visitor++;
        else if (userType === 'requester') userTypeStats.requester++;
        else if (userType === 'fixer') userTypeStats.fixer++;
      }

      const filters = search.filters;

      if (filters && typeof filters === 'object') {
        // Iterar sobre todos los filtros (filter_1, filter_2, etc.)
        Object.values(filters).forEach((filter: any) => {
          if (filter && typeof filter === 'object') {
            // Procesar fixer_name (puede contener múltiples valores separados por coma)
            if (filter.fixer_name && filter.fixer_name !== 'not_applied') {
              const fixerNames = filter.fixer_name.split(',').map((name: string) => name.trim());
              fixerNames.forEach((name: string) => {
                const normalizedName = name.toUpperCase();
                if (normalizedName === 'A-C') filterStats.fixer_name['A-C']++;
                else if (normalizedName === 'D-F') filterStats.fixer_name['D-F']++;
                else if (normalizedName === 'G-I') filterStats.fixer_name['G-I']++;
                else if (normalizedName === 'J-L') filterStats.fixer_name['J-L']++;
                else if (normalizedName === 'M-N') filterStats.fixer_name['M-N']++;
                else if (normalizedName === 'O-Q') filterStats.fixer_name['O-Q']++;
                else if (normalizedName === 'R-T') filterStats.fixer_name['R-T']++;
                else if (normalizedName === 'U-W') filterStats.fixer_name['U-W']++;
                else if (normalizedName === 'X-Z') filterStats.fixer_name['X-Z']++;
              });
            }

            // Procesar city
            if (filter.city && filter.city !== 'not_applied') {
              const cities = filter.city.split(',').map((city: string) => city.trim());
              cities.forEach((city: string) => {
                // Normalizar nombre de ciudad
                let normalizedCity = city.toLowerCase();
                // Mapear variantes
                if (normalizedCity.includes('cochabamba')) filterStats.city['Cochabamba']++;
                else if (normalizedCity.includes('la paz')) filterStats.city['La Paz']++;
                else if (normalizedCity.includes('santa cruz')) filterStats.city['Santa Cruz']++;
                else if (normalizedCity.includes('pando')) filterStats.city['Pando']++;
                else if (normalizedCity.includes('potosi') || normalizedCity.includes('potosí'))
                  filterStats.city['Potosi']++;
                else if (normalizedCity.includes('sucre')) filterStats.city['Sucre']++;
                else if (normalizedCity.includes('beni')) filterStats.city['Beni']++;
                else if (normalizedCity.includes('oruro')) filterStats.city['Oruro']++;
                else if (normalizedCity.includes('tarija')) filterStats.city['Tarija']++;
                else if (normalizedCity.includes('chuquisaca')) filterStats.city['Sucre']++;
              });
            }

            // Procesar job_type
            if (filter.job_type && filter.job_type !== 'not_applied') {
              const jobTypes = filter.job_type.split(',').map((job: string) => job.trim());
              jobTypes.forEach((job: string) => {
                const normalizedJob = job.toLowerCase();
                if (normalizedJob.includes('carpintero')) filterStats.job_type['Carpintero']++;
                else if (normalizedJob.includes('electricista'))
                  filterStats.job_type['Electricista']++;
                else if (normalizedJob.includes('plomer') || normalizedJob.includes('plomería'))
                  filterStats.job_type['Plomeria']++;
                else if (normalizedJob.includes('albañil')) filterStats.job_type['Albañil']++;
                else if (normalizedJob.includes('mecanico') || normalizedJob.includes('mecánico'))
                  filterStats.job_type['Mecanico']++;
                else if (normalizedJob.includes('jardinero')) filterStats.job_type['Jardinero']++;
                else if (normalizedJob.includes('fontanero')) filterStats.job_type['Fontanero']++;
                else if (normalizedJob.includes('pintor')) filterStats.job_type['Pintor']++;
                else if (normalizedJob.includes('cerrajero')) filterStats.job_type['Cerrajero']++;
                else if (normalizedJob.includes('decorador')) filterStats.job_type['Decorador']++;
              });
            }
          }
        });
      }
    });

    res.status(200).json({
      success: true,
      count: searches.length,
      period: 'last_month',
      start_date: oneMonthAgo,
      end_date: new Date(),
      filter_statistics: filterStats,
      user_type_statistics: userTypeStats,
    });
  } catch (error) {
    console.error('Error getting last month searches: ', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching last month searches',
    });
  }
}
// GET - Búsquedas del último año
export async function getLastYearSearches(req: Request, res: Response): Promise<void> {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const searches = await Search.find({
      timestamp: { $gte: oneYearAgo },
    }).sort({ timestamp: -1 });

    // Inicializar contadores
    const filterStats = {
      fixer_name: {
        'A-C': 0,
        'D-F': 0,
        'G-I': 0,
        'J-L': 0,
        'M-N': 0,
        'O-Q': 0,
        'R-T': 0,
        'U-W': 0,
        'X-Z': 0,
      },
      city: {
        Cochabamba: 0,
        'La Paz': 0,
        'Santa Cruz': 0,
        Pando: 0,
        Potosi: 0,
        Sucre: 0,
        Beni: 0,
        Oruro: 0,
        Tarija: 0,
      },
      job_type: {
        Carpintero: 0,
        Electricista: 0,
        Plomeria: 0,
        Albañil: 0,
        Mecanico: 0,
        Jardinero: 0,
        Fontanero: 0,
        Pintor: 0,
        Cerrajero: 0,
        Decorador: 0,
      },
    };

    // Inicializar contadores de tipos de usuario
    const userTypeStats = {
      visitor: 0,
      requester: 0,
      fixer: 0,
    };

    // Procesar cada búsqueda y sus filtros
    searches.forEach((search) => {
      // Contar tipo de usuario
      if (search.user_type) {
        const userType = search.user_type.toLowerCase();
        if (userType === 'visitor') userTypeStats.visitor++;
        else if (userType === 'requester') userTypeStats.requester++;
        else if (userType === 'fixer') userTypeStats.fixer++;
      }

      const filters = search.filters;

      if (filters && typeof filters === 'object') {
        // Iterar sobre todos los filtros (filter_1, filter_2, etc.)
        Object.values(filters).forEach((filter: any) => {
          if (filter && typeof filter === 'object') {
            // Procesar fixer_name (puede contener múltiples valores separados por coma)
            if (filter.fixer_name && filter.fixer_name !== 'not_applied') {
              const fixerNames = filter.fixer_name.split(',').map((name: string) => name.trim());
              fixerNames.forEach((name: string) => {
                const normalizedName = name.toUpperCase();
                if (normalizedName === 'A-C') filterStats.fixer_name['A-C']++;
                else if (normalizedName === 'D-F') filterStats.fixer_name['D-F']++;
                else if (normalizedName === 'G-I') filterStats.fixer_name['G-I']++;
                else if (normalizedName === 'J-L') filterStats.fixer_name['J-L']++;
                else if (normalizedName === 'M-N') filterStats.fixer_name['M-N']++;
                else if (normalizedName === 'O-Q') filterStats.fixer_name['O-Q']++;
                else if (normalizedName === 'R-T') filterStats.fixer_name['R-T']++;
                else if (normalizedName === 'U-W') filterStats.fixer_name['U-W']++;
                else if (normalizedName === 'X-Z') filterStats.fixer_name['X-Z']++;
              });
            }

            // Procesar city
            if (filter.city && filter.city !== 'not_applied') {
              const cities = filter.city.split(',').map((city: string) => city.trim());
              cities.forEach((city: string) => {
                // Normalizar nombre de ciudad
                let normalizedCity = city.toLowerCase();
                // Mapear variantes
                if (normalizedCity.includes('cochabamba')) filterStats.city['Cochabamba']++;
                else if (normalizedCity.includes('la paz')) filterStats.city['La Paz']++;
                else if (normalizedCity.includes('santa cruz')) filterStats.city['Santa Cruz']++;
                else if (normalizedCity.includes('pando')) filterStats.city['Pando']++;
                else if (normalizedCity.includes('potosi') || normalizedCity.includes('potosí'))
                  filterStats.city['Potosi']++;
                else if (normalizedCity.includes('sucre')) filterStats.city['Sucre']++;
                else if (normalizedCity.includes('beni')) filterStats.city['Beni']++;
                else if (normalizedCity.includes('oruro')) filterStats.city['Oruro']++;
                else if (normalizedCity.includes('tarija')) filterStats.city['Tarija']++;
                else if (normalizedCity.includes('chuquisaca')) filterStats.city['Sucre']++; // Chuquisaca = Sucre
              });
            }

            // Procesar job_type
            if (filter.job_type && filter.job_type !== 'not_applied') {
              const jobTypes = filter.job_type.split(',').map((job: string) => job.trim());
              jobTypes.forEach((job: string) => {
                const normalizedJob = job.toLowerCase();
                if (normalizedJob.includes('carpintero')) filterStats.job_type['Carpintero']++;
                else if (normalizedJob.includes('electricista'))
                  filterStats.job_type['Electricista']++;
                else if (normalizedJob.includes('plomer') || normalizedJob.includes('plomería'))
                  filterStats.job_type['Plomeria']++;
                else if (normalizedJob.includes('albañil')) filterStats.job_type['Albañil']++;
                else if (normalizedJob.includes('mecanico') || normalizedJob.includes('mecánico'))
                  filterStats.job_type['Mecanico']++;
                else if (normalizedJob.includes('jardinero')) filterStats.job_type['Jardinero']++;
                else if (normalizedJob.includes('fontanero')) filterStats.job_type['Fontanero']++;
                else if (normalizedJob.includes('pintor')) filterStats.job_type['Pintor']++;
                else if (normalizedJob.includes('cerrajero')) filterStats.job_type['Cerrajero']++;
                else if (normalizedJob.includes('decorador')) filterStats.job_type['Decorador']++;
              });
            }
          }
        });
      }
    });

    res.status(200).json({
      success: true,
      count: searches.length,
      period: 'last_year',
      start_date: oneYearAgo,
      end_date: new Date(),
      filter_statistics: filterStats,
      user_type_statistics: userTypeStats,
    });
  } catch (error) {
    console.error('Error getting last year searches: ', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching last year searches',
    });
  }
}

// GET - Búsquedas por rango de fecha
export async function getSearchesByDateRange(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required',
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Validar que las fechas sean válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use ISO format (YYYY-MM-DD)',
      });
      return;
    }

    // Ajustar la fecha final para incluir todo el día
    end.setHours(23, 59, 59, 999);

    const searches = await Search.find({
      timestamp: {
        $gte: start,
        $lte: end,
      },
    }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: searches.length,
      period: 'custom_range',
      start_date: start,
      end_date: end,
      data: searches,
    });
  } catch (error) {
    console.error('Error getting searches by date range: ', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching searches by date range',
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
    const lastSearch = await Search.findOne({}).sort({ timestamp: -1 });

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
    let fixerName = newFilterData.fixer_name || 'not_applied';
    if (fixerName !== 'not_applied' && fixerName.includes('-')) {
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
