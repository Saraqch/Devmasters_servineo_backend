import { Schema, model, models, Document } from 'mongoose';
// Modelo de citas por mientras, similar a lo que estan usando

export interface IAppointment extends Document {
  id_fixer: string;
  id_requester: string;
  selected_date: Date;
  current_requester_name: string;
  appointment_type: 'virtual' | 'presential';
  appointment_description?: string;
  link_id?: string;
  current_requester_phone: string;
  starting_time: Date;
  finishing_time?: Date;
  schedule_state: 'cancelled' | 'booked';
  display_name_location?: string;
  lat?: string;
  lon?: string;
  cancelled_fixer: boolean;
  reprogram_reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    id_fixer: { type: String, required: true },
    id_requester: { type: String, required: true },
    
    selected_date: { type: Date, required: true, default: Date.now },
    current_requester_name: { type: String, required: true },
    
    appointment_type: { 
      type: String, 
      enum: ['virtual', 'presential'], 
      required: true, 
      default: 'virtual' 
    },
    
    appointment_description: { type: String },
    link_id: { type: String },
    current_requester_phone: { type: String, required: true },
    
    starting_time: { type: Date, required: true },
    finishing_time: { type: Date },
    
    schedule_state: { 
      type: String, 
      enum: ['cancelled', 'booked'], 
      required: true, 
      default: 'booked' 
    },
    
    display_name_location: { type: String },
    lat: { type: String },
    lon: { type: String },
    
    cancelled_fixer: { type: Boolean, default: false },
    reprogram_reason: { type: String, default: '' }
  },
  { 
    timestamps: true 
  }
);


export const Appointment = models.Appointment || model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;