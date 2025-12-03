import { connectDB } from "../../config/db/mongoClient";
import { ObjectId } from "mongodb";

// FUNCIÓN para verificar si tiene contraseña en cualquier estructura
const tienePassword = (usuario: any): boolean => {
  // Verificar en authProviders (estructura nueva)
  const emailProvider = usuario.authProviders?.find((provider: any) => provider.provider === "email");
  if (emailProvider?.passwordHash) {
    return true;
  }
  
  // Verificar en password (estructura antigua)  
  if (usuario.password) {
    return true;
  }
  
  return false;
};

// FUNCIÓN para obtener fecha de último cambio
const obtenerFechaUltimoCambio = (usuario: any): Date | null => {
  // 1. Buscar en lastPasswordChange (más reciente)
  if (usuario.lastPasswordChange) {
    return new Date(usuario.lastPasswordChange);
  }
  
  // 2. Buscar en authProviders.linkedAt (estructura nueva)
  const emailProvider = usuario.authProviders?.find((provider: any) => provider.provider === "email");
  if (emailProvider?.linkedAt) {
    return new Date(emailProvider.linkedAt);
  }
  
  // 3. Fallback a createdAt si tiene password pero sin fecha específica
  if (usuario.password && usuario.createdAt) {
    return new Date(usuario.createdAt);
  }
  
  return null;
};

export const consultarUltimoCambioService = async (userId: string) => {
  try {
    const db = await connectDB();
    
    // BUSCAR con ambas estructuras
    const usuario = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { 
        projection: { 
          lastPasswordChange: 1,
          password: 1,              // ← Estructura antigua
          authProviders: 1,         // ← Estructura nueva
          name: 1,
          email: 1,
          createdAt: 1
        } 
      }
    );

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // 🔍 VERIFICAR si tiene contraseña en cualquier estructura
    const hasPassword = tienePassword(usuario);
    const fechaCambio = obtenerFechaUltimoCambio(usuario);
  
    // 📅 FORMATEAR la fecha
    let fechaFormateada = 'Nunca establecida';
    
    if (fechaCambio) {
      fechaFormateada = fechaCambio.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (hasPassword) {
      fechaFormateada = 'Establecida en el registro';
    } else {
      fechaFormateada = 'Sin contraseña (login social)';
    }

    // INFORMACIÓN ADICIONAL para debugging
    const emailProvider = usuario.authProviders?.find((provider: any) => provider.provider === "email");
    const estructuraDetalle = {
      tienePasswordAntiguo: !!usuario.password,
      tieneAuthProviders: !!usuario.authProviders?.length,
      tieneEmailProvider: !!emailProvider,
      tienePasswordHash: !!emailProvider?.passwordHash,
      lastPasswordChange: usuario.lastPasswordChange,
      linkedAt: emailProvider?.linkedAt
    };

    return {
      success: true,
      userId: usuario._id,
      userName: usuario.name,
      userEmail: usuario.email,
      hasPassword: hasPassword,
      lastPasswordChange: fechaCambio,
      fechaFormateada: fechaFormateada,
      // DATOS ADICIONALES para debugging
      estructura: estructuraDetalle
    };

  } catch (error: any) {
    console.error("Error en consultarUltimoCambioService:", error);
    throw error;
  }
};