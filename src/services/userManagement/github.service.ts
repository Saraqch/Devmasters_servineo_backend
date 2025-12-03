import fetch from "node-fetch";
import { User } from "../../models/user.model";
import { IUser } from "../../models/user.model";

interface GitHubUser {
  email: string;
  name: string;
  picture?: string;
  githubId: number;
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser | null> {
  const userResp = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${accessToken}` },
  });

  const userData = await userResp.json();

  const emailResp = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `token ${accessToken}` },
  });

  const emails = await emailResp.json();
  const primaryEmail = emails.find((e: any) => e.primary)?.email;

  if (!primaryEmail) return null;

  return {
    githubId: userData.id,
    email: primaryEmail,
    name: userData.name || userData.login,
    picture: userData.avatar_url,
  };
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return await User.findOne({
    "authProviders.provider": "github",
    "authProviders.providerId": email,
  });
}

export async function checkUserExists(email: string) {
  return !!(await findUserByEmail(email));
}

export async function createUser(githubUser: GitHubUser): Promise<IUser> {
  const newUser = await User.create({
    name: githubUser.name,
    email: githubUser.email,
    url_photo: githubUser.picture || "",
    role: "requester",

    authProviders: [
      {
        provider: "github",
        providerId: githubUser.email,
        password: "",
      },
    ],

    telefono: "",
    servicios: [],

    ubicacion: {
      lat: null,
      lng: null,
      direccion: "",
      departamento: "",
      pais: "",
    },

    ci: "",

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
