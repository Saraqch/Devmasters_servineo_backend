import { User } from "../../models/user.model";
import { IUser } from "../../models/user.model";
import { Job } from "../../models/job.model";
import Certification from "../../models/certification.model";
import Experience from "../../models/experience.model";
import bcrypt from "bcryptjs";

interface ManualUser {
  email: string;
  name: string;
  picture?: string;
  password: string;
}

interface InsertedUser {
  email: string;
  name: string;
}

export async function checkUserExists(email: string): Promise<boolean> {
  const user = await User.findOne({
    "authProviders.provider": "email",
    "authProviders.providerId": email,
  });

  return !!user;
}

export async function createManualUser(
  user: ManualUser
): Promise<InsertedUser & { _id: string; picture?: string }> {

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const newUserData: Partial<IUser> = {
    name: user.name,
    email: user.email,
    url_photo: user.picture || "",
    role: "requester",

    authProviders: [
      {
        provider: "email",
        providerId: user.email,
        password: hashedPassword,
      },
    ],

    telefono: "",
    servicios: [],

    ubicacion: {
      lat: 0,
      lng: 0,
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



    workLocation: {
      lat: 0,
      lng: 0,
      direccion: "",
      departamento: "",
      pais: "",
    },

    fixerProfile: "",
  };

  const created = await User.create(newUserData);

  console.log("Usuario manual creado:", user.email);

  // Initialize related collections
  try {
    // Default Job (Offer)
    await Job.create({
      title: "Bienvenido a Servineo",
      description: "Registro inicial completado",
      status: "pending",
      requesterId: created._id.toString(),
      price: 0,
      department: "La Paz", // Default department
      jobType: "Albañil" // Default job type
    });

    // Default Certification
    await Certification.create({
      fixerId: created._id,
      name: "Sin certificación inicial",
      institution: "Servineo",
      issueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Default Experience
    await Experience.create({
      fixerId: created._id,
      jobTitle: "Sin experiencia inicial",
      jobType: "General",
      isCurrent: false,
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Colecciones relacionadas inicializadas para:", user.email);
  } catch (error) {
    console.error("Error inicializando colecciones relacionadas:", error);
    // No lanzamos error para no revertir la creación del usuario, pero lo logueamos
  }

  return {
    _id: created._id.toString(),
    name: created.name,
    email: created.email,
    picture: created.url_photo,
  };
}

export async function getUserById(usuarioId: string): Promise<IUser | null> {
  const user = await User.findById(usuarioId);
  return user;
}
