export type CreateOfferInput = {
  fixerId: string;
  fixerName: string;
  description: string;
  services: string[];
  whatsapp: string;
  price: number;
  city: string;
  photos?: string[];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
};