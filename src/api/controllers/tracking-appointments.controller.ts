import { Request, Response } from 'express';

import Appointment from '../../models/appointment.model';
import { User } from '../../models/user.model'; 


export const getMapLocations = async (req: Request, res: Response) => {
  try {
  
    const appointments = await Appointment.find({
      lat: { $nin: [null, ''] },
      lon: { $nin: [null, ''] }
    }).lean();


    let userMap: Record<string, string> = {};
    
    try {
      if (appointments.length > 0) {
          const fixerIds = [...new Set(appointments.map((app: any) => app.id_fixer))];
         
          const validIds = fixerIds.filter(id => id && typeof id === 'string');

          if (validIds.length > 0) {
             
             const users = await User.find({ _id: { $in: validIds } }).select('_id name');
             users.forEach((user: any) => {
                userMap[user._id.toString()] = user.name;
             });
          }
      }
    } catch (error) {
      console.error(" Error cargando nombres de fixers:", error);
    }

    
    const mappedAppointments = appointments.map((appointment: any) => ({
      _id: appointment._id,
      lat: appointment.lat,
      lon: appointment.lon,
      status: appointment.schedule_state,
      
      fixerName: userMap[appointment.id_fixer] || 'Fixer Desconocido', 
      requesterName: appointment.current_requester_name,
      date: appointment.starting_time
    }));

    res.json(mappedAppointments);

  } catch (error) {
    console.error(' Error en getMapLocations:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


export const getTrackingMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    let matchStage: any = {};

    if (startDate || endDate) {
      matchStage.starting_time = {};
      if (startDate) matchStage.starting_time.$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59);
        matchStage.starting_time.$lte = end;
      }
    }

    const metrics = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$schedule_state', 'booked'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$schedule_state', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);

    const result = metrics[0] || { total: 0, active: 0, cancelled: 0 };
    res.json(result);

  } catch (error) {
    console.error(' Error en getTrackingMetrics:', error);
    res.status(500).json({ error: 'Error calculando métricas' });
  }
};


export const getFixerStats = async (req: Request, res: Response) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: "$id_fixer",
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$schedule_state", "booked"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$schedule_state", "cancelled"] }, 1, 0] } },
          rescheduled: { 
            $sum: { 
              $cond: [
                { $and: [{ $ne: ["$reprogram_reason", ""] }, { $ne: ["$reprogram_reason", null] }] }, 
                1, 
                0 
              ] 
            } 
          }
        }
      },
      // Ordenar por TOTAL de citas (Descendente: -1)
      { $sort: { total: -1 } }, 
      
      //Solo traer los primeros 10
      { $limit: 10 } 
    ]);
    
    const fixerIds = stats.map(s => s._id).filter(id => id);
    
    // Solo buscamos nombres para estos 10, mucho más rápido
    const users = await User.find({ _id: { $in: fixerIds } }).select('_id name');
    
    const userMap: Record<string, string> = {};
    users.forEach(u => { userMap[u._id.toString()] = u.name; });

    const finalStats = stats.map(stat => {
      const name = userMap[stat._id] || 'Desconocido';
      const rate = stat.total > 0 ? ((stat.cancelled / stat.total) * 100).toFixed(1) : "0";
      
      return {
        id: stat._id,
        name,
        total: stat.total,
        active: stat.active,
        cancelled: stat.cancelled,
        rescheduled: stat.rescheduled,
        rate: `${rate}%`
      };
    });

    res.json(finalStats);

  } catch (error) {
    console.error(' Error en getFixerStats:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};