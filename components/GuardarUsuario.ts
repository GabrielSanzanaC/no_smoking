import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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

export const GuardarUsuario = async ({ email, password, user, reason,  age, yearsSmoking, cigarettesPerDay, cigarettesPerPack, packPrice}: GuardarUsuarioProps): Promise<void> => {
  try {
    // Crear usuario en Firebase
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Lanza errores específicos según el tipo
      if ((err as any).code === "auth/email-already-in-use") {
        throw new Error("El correo electrónico ya está registrado.");
      } else if ((err as any).code === "auth/invalid-email") {
        throw new Error("El correo electrónico no es válido.");
      } else if ((err as any).code === "auth/weak-password") {
        throw new Error("La contraseña es demasiado débil. Debe tener al menos 6 caracteres.");
      } else {
        throw new Error("Hubo un problema al registrar la cuenta.");
      }
    } else {
      console.error("Error desconocido:", err);
      throw new Error("Ocurrió un error inesperado.");
    }
  }
};
