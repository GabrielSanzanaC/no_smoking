import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";


const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(""); // Estado para el nombre del usuario
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [userError, setUserError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    let hasError = false;
  
    if (!email.trim()) {
      setEmailError(true);
      setError("Por favor ingresa tu correo.");
      hasError = true;
    } else {
      setEmailError(false);
    }
  
    if (!password.trim()) {
      setPasswordError(true);
      setError("Por favor ingresa tu contraseña.");
      hasError = true;
    } else {
      setPasswordError(false);
    }
  
    if (hasError) {
      return;
    }
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
      router.push("./screens/ProfileScreen");
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Manejo de errores específicos de Firebase
        if ((err as any).code === "auth/user-not-found") {
          setError("No se encontró un usuario con este correo.");
        } else if ((err as any).code === "auth/wrong-password") {
          setError("Contraseña incorrecta.");
        } else {
          setError("Hubo un problema al iniciar sesión.");
        }
      } else {
        console.error("Error desconocido:", err);
        setError("Ocurrió un error inesperado.");
      }
    }
  };

  const handleContinue = async () => {
    let hasError = false;
  
    // Validación
    if (!user.trim()) {
      setUserError(true);
      hasError = true;
    } else {
      setUserError(false);
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError(true);
      setError("El correo no puede estar vacío.");
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError(true);
      setError("El formato del correo no es válido.");
      hasError = true;
    } else {
      setEmailError(false);
    }
  
    if (!password.trim()) {
      setPasswordError(true);
      setError("La contraseña no puede estar vacía.");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError(true);
      setError("La contraseña debe tener al menos 6 caracteres.");
      hasError = true;
    } else {
      setPasswordError(false);
    }
  
    if (hasError) {
      return;
    }

    try {
      // Verificar si el correo ya existe en la base de datos
      const usersCollection = collection(db, "usuarios");
      const emailQuery = query(usersCollection, where("email", "==", email));
      const querySnapshot = await getDocs(emailQuery);

      if (!querySnapshot.empty) {
        setError("El correo ya está registrado. Usa otro correo.");
        return;
      }

      const userProfile = {
        user: user,
        email: email,
        password: password,
      };

      const userProfileString = JSON.stringify(userProfile);

      setError("");
      router.push({
        pathname: '/screens/CreateAccountScreen',
        params: { userProfile: userProfileString },
      });
    } catch (err) {
      setError("Hubo un problema al registrar el usuario.");
      console.error(err);
    }
  };

  // Limpiar el error al cambiar entre Login y Register
  const handleTabChange = (isLoginTab: boolean | ((prevState: boolean) => boolean)) => {
    setIsLogin(isLoginTab);
    setError(""); // Limpiar el error al cambiar de pestaña
    setUserError(false);
    setEmailError(false);
    setPasswordError(false);
  };
    
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tab, isLogin && styles.activeTab]}
          onPress={() => handleTabChange(true)}
        >
          <Text style={styles.tabText}>🔒 Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, !isLogin && styles.activeTab]}
          onPress={() => handleTabChange(false)}
        >
          <Text style={styles.tabText}>👤 Registrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.iconText}>🚭</Text>
        <Text style={styles.titleText}>No Smoke</Text>
      </View>

      <View style={styles.formContainer}>
        {isLogin ? (
          <>
            <TextInput
              style={[styles.input, emailError && styles.errorInput]}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(false);
              }}
            />
            <TextInput
              style={[styles.input, passwordError && styles.errorInput]}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(false);
              }}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={[styles.input, userError && styles.errorInput]}
              placeholder="Nombre de usuario"
              value={user}
              onChangeText={(text) => {
                setUser(text);
                setUserError(false);
              }}
            />
            <TextInput
              style={[styles.input, emailError && styles.errorInput]}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(false);
              }}
            />
            <TextInput
              style={[styles.input, passwordError && styles.errorInput]}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(false);
              }}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F2D",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  activeTab: {
    backgroundColor: "#444",
    borderRadius: 10,
  },
  tabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  titleContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  iconText: {
    fontSize: 48,
    color: "#fff",
    marginBottom: 10,
  },
  titleText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 2,
  },
  button: {
    backgroundColor: "#1E90FF",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default App;
