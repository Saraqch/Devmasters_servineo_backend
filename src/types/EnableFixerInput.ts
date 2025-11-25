export type EnableFixerInput = {
  userId: string;
  ci: string;
  location?: { lat: number; lng: number } | null;
  services: string[];
  payments: ('cash' | 'qr' | 'card')[];
  accountInfo?: string;
  experiences: {
    title: string;
    years: number;
    description?: string;
  }[];
  hasVehicle: boolean;
  vehicleType?: string;
  photoUrl?: string;
  phone?: string;
};