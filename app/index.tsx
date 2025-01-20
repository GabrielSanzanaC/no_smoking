import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

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
      hasError = true;
    } else {
      setEmailError(false);
    }

    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
    } else {
      setPasswordError(false);
    }

    if (hasError) {
      setError("Por favor ingresa todos los campos obligatorios.");
      return;
    }

    setError(""); // Limpiar mensaje de error
    router.push("./screens/ProfileScreen");
  };

  const handleContinue = () => {
    let hasError = false;

    if (!user.trim()) {
      setUserError(true);
      hasError = true;
    } else {
      setUserError(false);
    }

    if (!email.trim()) {
      setEmailError(true);
      hasError = true;
    } else {
      setEmailError(false);
    }

    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
    } else {
      setPasswordError(false);
    }

    if (hasError) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }

    setError("");
    router.push({
      pathname: "./screens/CreateAccountScreen",
      query: { email, password, user },
    });
  };

  // Limpiar el error al cambiar entre Login y Register
  const handleTabChange = (isLoginTab) => {
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
              <Text style={styles.buttonText}>Continuar</Text>
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
