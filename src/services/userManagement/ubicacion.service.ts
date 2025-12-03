import clientPromise from "../../config/db/mongodb";

export const guardarUbicacionUsuario = async (
  email: string,
  lat: number,
  lng: number,
  direccion: string | null,
  departamento: string | null,
  pais: string | null
) => {
  const mongoClient = await clientPromise;
  const db = mongoClient.db("ServineoBD");

  await db.collection("users").updateOne(
    { email },
    {
      $set: {
        ubicacion: { lat, lng, direccion, departamento, pais },
        updatedAt: new Date(),
      },
    }
  );

  console.log(`Ubicación guardada para ${email}: [${lat}, ${lng}] ${direccion || ""}, ${departamento || ""}, ${pais || ""}`);
};