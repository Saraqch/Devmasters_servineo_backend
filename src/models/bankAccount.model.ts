// servineo-backend/src/models/bankAccount.model.ts
import { Schema, model, Document } from 'mongoose';

// Interfaz para definir la estructura del documento en TypeScript
export interface IBankAccount extends Document {
    fixerId: string;
    nameFixer: string;
    identification: string;
    accountType: 'Cuenta de Ahorros' | 'Cuenta Corriente';
    accountNumber: string;
    bankName: string;
    createdAt: Date;
    updatedAt: Date;
}

// Esquema de Mongoose para el modelo de Cuenta Bancaria
const BankAccountSchema = new Schema<IBankAccount>({
    // ID del Fixer al que pertenece esta cuenta (referencia al usuario)
    fixerId: { 
        type: String, 
        required: [true, 'El ID del Fixer es obligatorio.'] 
    },
    // Nombre del titular de la cuenta
    nameFixer: { 
        type: String, 
        required: [true, 'El nombre del titular es obligatorio.'] 
    },
    // Identificación del titular (CI o similar)
    identification: { 
        type: String, 
        required: [true, 'La identificación es obligatoria.'] 
    },
    // Tipo de cuenta (Ahorros o Corriente)
    accountType: { 
        type: String, 
        enum: ['Cuenta de Ahorros', 'Cuenta Corriente'],
        default: 'Cuenta de Ahorros',
        required: [true, 'El tipo de cuenta es obligatorio.']
    },
    // Número de cuenta bancaria
    accountNumber: { 
        type: String, 
        required: [true, 'El número de cuenta es obligatorio.'], 
        unique: true, // Asumimos que el número de cuenta debe ser único
        trim: true
    },
    // Nombre del banco
    bankName: { 
        type: String, 
        required: [true, 'El nombre del banco es obligatorio.'] 
    },
    // Indicador si es la cuenta favorita o principal
    
}, {
    timestamps: true // Añade campos createdAt y updatedAt automáticamente
});

// Crear y exportar el modelo
export const BankAccount = model<IBankAccount>('BankAccount', BankAccountSchema);
