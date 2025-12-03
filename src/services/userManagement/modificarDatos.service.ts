import jwt, { JwtPayload } from "jsonwebtoken";
import { connectDB } from "../../config/db/mongoClient";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

interface TokenPayload extends JwtPayload {
  id: string;
}

interface Ubicacion {
  lat: number;
  lng: number;
  direccion: string;
  departamento: string;
  pais: string;
}

interface UpdateRequesterData {
  telefono: string;
  ubicacion: Ubicacion;
}

const normalizeTelefono = (telefono?: string) => (telefono ?? "").replace(/\D/g, "");
// quita todo lo que no sea dígito

// ✅ Obtener datos del usuario logueado
export const obtenerDatosUsuarioService = async (token: string) => {
  const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  const db = await connectDB();

  const usuario = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
  if (!usuario) throw new Error("Usuario no encontrado");

  delete usuario.password;

  return {
    requesterId: usuario._id,
    telefono: usuario.telefono || "",
    ubicacion: usuario.ubicacion || {
      lat: 0,
      lng: 0,
      direccion: "",
      departamento: "",
      pais: "",
    },
  };
};

// ✅ Actualizar datos del usuario logueado
export const actualizarDatosUsuarioService = async (token: string, nuevosDatos: UpdateRequesterData) => {
  const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  const db = await connectDB();

  // --- comprobación de teléfono duplicado ---
  const userIdStr = decoded.id; // id del usuario autenticado
  const normalizedNewTelefono = normalizeTelefono(nuevosDatos.telefono || "");

  if (normalizedNewTelefono) {
    // 1) búsqueda directa
    let existing = await db.collection("users").findOne({ telefono: normalizedNewTelefono });

    // 2) si no se encuentra, comparar números normalizados
    if (!existing) {
      const cursor = db
        .collection("users")
        .find({ telefono: { $exists: true, $ne: "" } }, { projection: { telefono: 1 } });

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        if (doc && normalizeTelefono(doc.telefono) === normalizedNewTelefono) {
          existing = doc;
          break;
        }
      }
    }

    // 3) si existe y no es el mismo usuario -> error
    if (existing && existing._id.toString() !== userIdStr) {
      const err: any = new Error("Número de teléfono ya registrado por otro usuario");
      err.code = "PHONE_TAKEN";
      throw err;
    }
  }
  // --- fin de comprobación ---

  // ✅ Actualizar en MongoDB con el nuevo formato
  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(decoded.id) },
    {
      $set: {
        telefono: nuevosDatos.telefono,
        ubicacion: nuevosDatos.ubicacion, // 👈 nuevo campo reemplaza direction + coordinates
      },
    }
  );

  if (result.matchedCount === 0) throw new Error("Usuario no encontrado");

  return { success: true, message: "Perfil actualizado con éxito." };
};