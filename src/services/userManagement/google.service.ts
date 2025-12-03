import { OAuth2Client } from "google-auth-library";
import { User } from "../../models/user.model";
import { IUser } from "../../models/user.model";

interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) return null;

  return {
    email: payload.email,
    name: payload.name || "Sin Nombre",
    picture: payload.picture || "",
  };
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return await User.findOne({
    "authProviders.provider": "google",
    "authProviders.providerId": email,
  });
}

export async function checkUserExists(email: string) {
  return !!(await findUserByEmail(email));
}

export async function createUser(googleUser: GoogleUser) {
  const newUser = await User.create({
    name: googleUser.name,
    email: googleUser.email,
    url_photo: googleUser.picture || "",
    role: "requester",

    authProviders: [
      {
        provider: "google",
        providerId: googleUser.email,
        password: "",
      },
    ],

    telefono: "",

    ubicacion: {
      lat: null,
      lng: null,
      direccion: "",
      departamento: "",
      pais: "",
    },

    ci: "",
    servicios: [],

    vehiculo: {
      hasVehiculo: false,
      tipoVehiculo: "",
    },

    acceptTerms: false,

    metodoPago: {
      hasEfectivo: false,
      qr: false,
      tarjetaCredito: false,
    },

    experience: {
      descripcion: "",
    },

    workLocation: {
      lat: null,
      lng: null,
      direccion: "",
      departamento: "",
      pais: "",
    },

    fixerProfile: "",
  });

  return newUser;
}

