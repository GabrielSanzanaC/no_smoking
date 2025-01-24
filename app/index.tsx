import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Image } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem("isLoggedIn");
        const userData = await AsyncStorage.getItem("userData"); // Recuperar datos del usuario
  
        if (loggedIn === "true" && userData) {
          const { email, password } = JSON.parse(userData); // Extraer email y contraseña
  
          // Intentar iniciar sesión automáticamente
          await signInWithEmailAndPassword(auth, email, password);
  
          // Redirigir al perfil si el inicio de sesión fue exitoso
          router.push({
            pathname: "./screens/ProfileScreen",
          });
        }
      } catch (err) {
        console.error("Error during auto login:", err);
        // Puedes manejar el error aquí si deseas notificar al usuario
      }
    };
    
  
    checkLoginStatus();
  }, []);

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      const user = userCredential.user;
  
      // Guardar estado de sesión y datos del usuario
      await AsyncStorage.setItem("isLoggedIn", "true");
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({ email: user.email, uid: user.uid, password }) // Guardar contraseña también
      );
  
      setError("");
      router.push("./screens/ProfileScreen");
    } catch (err: unknown) {
      if (err instanceof Error) {
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

  const handleKeyPress = (event) => {
    if (event.nativeEvent.key === 'Enter') {
      Keyboard.dismiss();
      if (isLogin) {
        handleLogin();
      } else {
        handleContinue();
      }
    }
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

      {/* Contenedor del logo */}
      <View style={styles.titleContainer}>
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
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
              onKeyPress={handleKeyPress}
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
              onKeyPress={handleKeyPress}
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
              onKeyPress={handleKeyPress}
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
              onKeyPress={handleKeyPress}
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
              onKeyPress={handleKeyPress}
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
    backgroundColor: "#023E73", // Fondo principal
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#072040", // Fondo del header
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#1F82BF", // Tab activo
  },
  tabText: {
    color: "#F2F2F2", // Texto del tab
    fontWeight: "bold",
    fontSize: 16,
  },
  titleContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  iconText: {
    fontSize: 48,
    color: "#059E9E", // Icono destacado
    marginBottom: 10,
  },
  titleText: {
    color: "#F2F2F2", // Texto principal
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 20,
  },
  input: {
    backgroundColor: "#F2F2F2", // Fondo claro para inputs
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1F82BF", // Borde del input
    color: "#072040", // Texto del input
  },
  errorInput: {
    borderColor: "red", // Borde rojo en caso de error
  },
  button: {
    backgroundColor: "#059E9E", // Botón principal
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  buttonText: {
    color: "#F2F2F2", // Texto del botón
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
});

export default App;