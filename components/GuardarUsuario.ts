import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";

interface GuardarUsuarioProps {
  email: string;
  password: string;
  user: string;
  reason: string;
  age: number;
  yearsSmoking: number;
  cigarettesPerDay: number;
  cigarettesPerPack: number;
  packPrice: number;
}

export const GuardarUsuario = async ({ email, password, user, reason, age, yearsSmoking, cigarettesPerDay, cigarettesPerPack, packPrice }: GuardarUsuarioProps): Promise<void> => {
  try {
    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Guardar información del usuario en Firestore
    await setDoc(doc(db, "usuarios", uid), {
      uid: uid,
      nombre: user,
      email: email,
      motivo: reason,
      edad: age,
      añosFumando: yearsSmoking,
      cigarrillosPorDía: cigarettesPerDay,
      cigarrillosPorPaquete: cigarettesPerPack,
      precioPorPaquete: packPrice,
    });

    // Obtener solo la fecha (sin la hora)
    const fechaCreacion = new Date().toISOString().split('T')[0]; // Formato "YYYY-MM-DD"
    
    // Agregar subcolección CigaretteHistory con fecha de creación y cigarrillos fumados en ese día
    await addDoc(collection(db, "usuarios", uid, "CigaretteHistory"), {
      fecha: fechaCreacion,
      cigarettesSmoked: 0, // Inicializamos con 0 cigarrillos fumados
    });

    console.log('Usuario y su historial de cigarrillos guardados exitosamente.');

  } catch (err: unknown) {
    if (err instanceof Error) {
      // Lanza errores específicos según el tipo
      const errorMessage = (err as any).code === "auth/email-already-in-use"
        ? "El correo electrónico ya está registrado."
        : (err as any).code === "auth/invalid-email"
        ? "El correo electrónico no es válido."
        : (err as any).code === "auth/weak-password"
        ? "La contraseña es demasiado débil. Debe tener al menos 6 caracteres."
        : "Hubo un problema al registrar la cuenta.";

      console.error(errorMessage);
      throw new Error(errorMessage);
    } else {
      console.error("Error desconocido:", err);
      throw new Error("Ocurrió un error inesperado.");
    }
  }
};
