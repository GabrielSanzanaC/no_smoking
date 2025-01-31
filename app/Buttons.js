import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../FirebaseConfig";

const handleLogin = async (formData, setFormData, router) => {
  const { email, password } = formData;

  if (!validateEmail(email) || !validatePassword(password)) {
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setFormData((prevState) => ({ ...prevState, error: "" }));
    router.push("./screens/ProfileScreen");  // Navegar sin hooks
  } catch (err) {
    let errorMessage = "Hubo un problema al iniciar sesión.";
    if (err.code === "auth/user-not-found") {
      errorMessage = "No se encontró un usuario con este correo.";
    } else if (err.code === "auth/wrong-password") {
      errorMessage = "Contraseña incorrecta.";
    }
    setFormData((prevState) => ({ ...prevState, error: errorMessage }));
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.trim().length >= 6;
};

export default handleLogin;


