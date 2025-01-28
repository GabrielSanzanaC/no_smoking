import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../FirebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import * as Animatable from "react-native-animatable";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from "@expo/vector-icons";
import BackgroundShapes from '../components/BackgroundShapes';


WebBrowser.maybeCompleteAuthSession();

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(""); // Estado para el nombre del usuario
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [userError, setUserError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    //expoClientId: 'YOUR_EXPO_CLIENT_ID',
    //iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: '571745550303-6485sga5adgjg24a48ijrdite1nf9mic.apps.googleusercontent.com',
    webClientId: '571745550303-84m79of6kn1vqd6g8i3jik57l183vla4.apps.googleusercontent.com',
    redirectUri: 'https://app-nosmoking.firebaseapp.com/__/auth/handler',
  });

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
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          const user = userCredential.user;
          // Guardar estado de sesión y datos del usuario
          AsyncStorage.setItem("isLoggedIn", "true");
          AsyncStorage.setItem(
            "userData",
            JSON.stringify({ email: user.email, uid: user.uid })
          );
          router.push("./screens/ProfileScreen");
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    }
  }, [response]);

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

  const handleKeyPress = (event: { nativeEvent: { key: string; }; }) => {
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
      {/* Animated Background */}
      <BackgroundShapesMemo />


      {/* Main Content */}
      <Animatable.View animation="fadeIn" style={styles.rectangle}>
        <Animatable.View animation="zoomIn" style={styles.logoContainer}>
          <Ionicons name="logo-no-smoking" size={50} color="#F2F2F2" />
          <Animatable.Text animation="bounceIn" style={styles.welcomeText}>
            ¡Bienvenido a Deja de Fumar!
          </Animatable.Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" style={styles.formContainer}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              placeholderTextColor="black"
              value={user}
              onChangeText={setUser}
            />
          )}
          <Animatable.View animation="slideInRight">
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="black"
              value={email}
              onChangeText={setEmail}
            />
          </Animatable.View>
          <Animatable.View animation="slideInLeft">
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="black"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </Animatable.View>
          {isLogin && (
            <Animatable.View animation="fadeIn" style={styles.checkboxContainer}>
              <Checkbox
                value={rememberMe}
                onValueChange={setRememberMe}
                color={rememberMe ? "#FF6F61" : undefined}
              />
              <Text style={styles.checkboxLabel}>Recuérdame</Text>
            </Animatable.View>
          )}
          <Animatable.View animation="zoomIn">
            <TouchableOpacity
              style={styles.button}
              onPress={isLogin ? handleLogin : handleContinue}
            >
              <Text style={styles.buttonText}>
                {isLogin ? "Iniciar Sesión" : "Registrarse"}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
          <Animatable.View animation="fadeInUp">
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchButtonText}>
                {isLogin
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </Text>
            </TouchableOpacity>
          </Animatable.View>
          <Animatable.View animation="bounceIn" style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => promptAsync()}
              disabled={!request}
            >
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </Animatable.View>
    </View>
  );
};

const BackgroundShapesMemo = React.memo(() => {
  return <BackgroundShapes />;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7595BF", // Background
    alignItems: "center",
    justifyContent: "center",
  },
  rectangle: {
    width: "90%",
    backgroundColor: "#072040", // Contrast Black
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center", // Centra horizontalmente el contenido dentro del rectángulo
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#059E9E", // Buttons
  },
  welcomeText: {
    color: "#F2F2F2", // Text
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "beige", // Contrast Light
    color: "black", // Text
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#059E9E", // Buttons
    width: "100%", // Asegurarse de que los inputs ocupen el ancho completo del contenedor
  },
  button: {
    backgroundColor: "#059E9E", // Buttons
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    width: "100%", // Asegurarse de que el botón ocupe el ancho completo del contenedor
  },
  buttonText: {
    color: "#F2F2F2", // Text
    fontWeight: "bold",
    fontSize: 16,
  },
  switchButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  switchButtonText: {
    color: "#F2F2F2", // Text
    textDecorationLine: "underline",
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    backgroundColor: "#1F82BF", // Contrast Light
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  socialButtonText: {
    color: "#F2F2F2", // Text
    fontWeight: "bold",
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxLabel: {
    color: "#F2F2F2", // Text
    marginLeft: 10,
    fontSize: 14,
  },
  errorInput: {
    borderColor: "red", // Borde rojo en caso de error
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
});

export default App;