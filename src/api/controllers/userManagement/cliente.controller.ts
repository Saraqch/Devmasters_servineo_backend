import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getClientById} from "../../../services/userManagement/cliente.service";
import bcrypt from "bcryptjs";
import clientPromise from "../../../config/db/mongodb";

export async function getClientProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const client = await getClientById(userId);

    if (!client) {
      return res.status(404).json({ status: "error", message: "Cliente no encontrado" });
    }
    const clientData = {
      ...client,
      loginMethods: client.authProviders || [],
    };

    return res.json({ status: "ok", client: clientData });
  } catch (err) {
    console.error("Error en getClientProfile:", err);
    return res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
}


export async function unlinkLoginMethod(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { provider } = req.body;

    console.log("🔹 unlinkLoginMethod: Inicio con provider =", provider, "y userId =", userId);

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado: userId no presente en el token.",
      });
    }

    if (!provider) {
      return res.status(400).json({
        status: "error",
        message: "Falta el provider",
      });
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db("ServineoBD");
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado.",
      });
    }

    const tieneProvider = user.authProviders?.some((p: any) => p.provider === provider);
    if (!tieneProvider) {
      return res.status(400).json({
        status: "error",
        message: `El método ${provider} no está vinculado.`,
      });
    }
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $pull: { authProviders: { provider } } } as unknown as import("mongodb").UpdateFilter<any>,
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(500).json({
        status: "error",
        message: "No se pudo actualizar el usuario.",
      });
    }

    const updated = result.value || result;

    if (!updated) {
      return res.status(500).json({
        status: "error",
        message: "No se pudo actualizar el usuario al desvincular el método.",
      });
    }

    let authProvidersSafe = [];
    try {
      authProvidersSafe = updated.authProviders?.map((p: any, idx: number) => {
        if (!p) {
          console.error(`authProviders[${idx}] es null o undefined:`, p);
          return { provider: "unknown", email: "", token: undefined, linkedAt: undefined };
        }
        return {
          provider: p.provider,
          email: p.email,
          token: p.token ?? undefined,
          linkedAt: p.linkedAt ? new Date(p.linkedAt).toISOString() : undefined,
        };
      }) || [];
    } catch (err) {
      console.error("Error mapeando authProvidersSafe:", err, updated.authProviders);
      return res.status(500).json({
        status: "error",
        message: "Error procesando métodos de autenticación",
      });
    }

    const clientResponse = {
      id: updated._id?.toString?.() || String(updated._id),
      name: updated.name,
      email: updated.email,
      authProviders: authProvidersSafe,
    };

    console.log("✅ Método desvinculado correctamente:", provider);
    return res.json({
      status: "ok",
      message: `Método ${provider} desvinculado correctamente.`,
      client: clientResponse,
    });
  } catch (err) {
    console.error("❌ Error en unlinkLoginMethod:", err);
    return res.status(500).json({
      status: "error",
      message: "Error interno al desvincular método.",
    });
  }
}


export async function linkEmailPasswordMethod(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    console.log("🧩 userId del token:", userId);

    if (!userId) {
      return res.status(401).json({ status: "error", message: "No autenticado: userId no presente en el token." });
    }

    const { email, password } = req.body;
    console.log("📥 Datos recibidos:", { email, password });

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Faltan datos (email o contraseña)" });
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db("ServineoBD");

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    console.log("🧩 Usuario encontrado en DB:", JSON.stringify(user, null, 2));

    if (!user) {
      return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
    }

    const yaVinculado = user.authProviders?.some((p: any) => p.provider === "email");
    console.log("🔹 Ya vinculado?", yaVinculado);

    if (yaVinculado) {
      return res.status(400).json({
        status: "error",
        message: "Ya tienes un método de correo vinculado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    console.log("🔑 Password hasheada:", passwordHash);

    const now = new Date();
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $push: {
          authProviders: {
            provider: "email",
            email,
            passwordHash,
            linkedAt: now,
          },
        },
      } as any,
      { returnDocument: "after" }
    );

    if (!result) {
      console.log("🔴 Falla: result es null");
      return res.status(500).json({
        status: "error",
        message: "No se pudo vincular el método email",
      });
    }

    // En tu versión de Mongo, el documento actualizado está en result, no en result.value
    const updated = result.value || result; // compatibilidad si actualizas driver
    console.log("🧩 Resultado update completo:", JSON.stringify(updated, null, 2));
    if (!updated?.authProviders) {
      console.log("🔴 Falla: updated.authProviders no existe o es falsy");
      return res.status(500).json({
        status: "error",
        message: "No se pudo vincular el método email",
      });
    }

    let authProvidersSafe = [];
    try {
      authProvidersSafe = updated.authProviders.map((p: any, idx: number) => {
        if (!p) {
          console.error(`authProviders[${idx}] es null o undefined:`, p);
          return { provider: 'unknown', email: '', token: undefined, linkedAt: undefined };
        }
        console.log(`🟢 authProvidersSafe[${idx}]:`, p);
        return {
          provider: p.provider,
          email: p.email,
          token: p.token ?? undefined,
          linkedAt: p.linkedAt ? new Date(p.linkedAt).toISOString() : undefined,
        };
      });
      console.log("🟢 authProvidersSafe final:", authProvidersSafe);
    } catch (err) {
      console.error('Error mapeando authProvidersSafe:', err, updated.authProviders);
      return res.status(500).json({ status: 'error', message: 'Error procesando métodos de autenticación' });
    }

    let clientResponse;
    try {
      clientResponse = {
        id: updated._id?.toString?.() || String(updated._id),
        name: updated.name,
        email: updated.email,
        authProviders: authProvidersSafe,
      };
      console.log("🟢 clientResponse construido:", clientResponse);
    } catch (err) {
      console.error('Error construyendo clientResponse:', err, updated);
      return res.status(500).json({ status: 'error', message: 'Error construyendo respuesta del cliente' });
    }

    console.log("📤 Respuesta final al frontend:", JSON.stringify(clientResponse, null, 2));
    try {
      return res.json({
        status: "ok",
        message: "Método email vinculado correctamente",
        client: clientResponse,
      });
    } catch (err) {
      console.error("Error serializando respuesta:", err);
      // Respuesta mínima para aislar el problema
      return res.status(200).send("ok-minimal");
    }

  } catch (err) {
    console.error("Error en linkEmailPasswordMethod:", err);
    // En desarrollo, puedes enviar el error real para depuración:
    // return res.status(500).json({ status: "error", message: err instanceof Error ? err.message : String(err) });
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
}


export async function linkGoogleMethod(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    console.log("🧩 userId del token:", userId);

    if (!userId) {
      return res
        .status(401)
        .json({ status: "error", message: "No autenticado: userId no presente en el token." });
    }

    const { tokenGoogle } = req.body;
    if (!tokenGoogle) {
      return res.status(400).json({
        status: "error",
        message: "Falta el token de Google",
      });
    }

    // 🔍 Verificar token con Google API
    const googleResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${tokenGoogle}`
    );
    const googleData = await googleResponse.json();

    if (!googleData.email || !googleData.sub) {
      console.error("❌ Token de Google inválido o corrupto:", googleData);
      return res.status(400).json({
        status: "error",
        message: "Token de Google inválido.",
      });
    }

    console.log("✅ Google token verificado:", googleData);

    const mongoClient = await clientPromise;
    const db = mongoClient.db("ServineoBD");

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    console.log("🧩 Usuario encontrado:", user?.email);

    if (!user) {
      return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
    }

    // Verificar si ya está vinculado con Google
    const yaVinculado = user.authProviders?.some((p: any) => p.provider === "google");
    if (yaVinculado) {
      return res.status(400).json({
        status: "error",
        message: "Ya tienes una cuenta de Google vinculada.",
      });
    }

    // Agregar nuevo método Google
    const now = new Date();
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $push: {
          authProviders: {
            provider: "google",
            email: googleData.email,
            token: googleData.sub, // ID único de Google
            linkedAt: now,
          },
        },
      } as any,
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(500).json({
        status: "error",
        message: "No se pudo vincular el método Google.",
      });
    }

    const updated = result.value || result;
    console.log("🟢 Usuario actualizado con Google:", JSON.stringify(updated, null, 2));

    const authProvidersSafe = (updated.authProviders || []).map((p: any) => ({
      provider: p.provider,
      email: p.email,
      token: p.token ?? undefined,
      linkedAt: p.linkedAt ? new Date(p.linkedAt).toISOString() : undefined,
    }));

    const clientResponse = {
      id: updated._id?.toString?.() || String(updated._id),
      name: updated.name,
      email: updated.email,
      authProviders: authProvidersSafe,
    };

    console.log("📤 Respuesta final:", JSON.stringify(clientResponse, null, 2));

    return res.json({
      status: "ok",
      message: "Cuenta de Google vinculada correctamente",
      client: clientResponse,
    });
  } catch (err) {
    console.error("Error en linkGoogleMethod:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
}