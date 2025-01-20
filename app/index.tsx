import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from 'expo-router'; // Asegúrate de importar el hook useRouter

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(""); // Estado para el correo
  const [password, setPassword] = useState(""); // Estado para la contraseña
  const router = useRouter(); // Inicializa el hook useRouter

  const handleLogin = () => {
    router.push('./screens/ProfileScreen'); // Navega a la pantalla ProfileScreen
  };

  const handleContinue = () => {
    // Navega a la pantalla CreateAccountScreen, pasando el correo y la contraseña como parámetros
    router.push({
      pathname: './screens/CreateAccountScreen',
      query: { email, password }
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Encabezado con botones de login y register */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tab, isLogin && styles.activeTab]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={styles.tabText}>🔒 Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, !isLogin && styles.activeTab]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={styles.tabText}>👤 Register</Text>
        </TouchableOpacity>
      </View>

      {/* Título centrado con ícono encima */}
      <View style={styles.titleContainer}>
        <Text style={styles.iconText}>🚭</Text>
        <Text style={styles.titleText}>No Smoke</Text>
      </View>

      {/* Contenido del formulario */}
      <View style={styles.formContainer}>
        {isLogin ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail} // Actualiza el estado del correo
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword} // Actualiza el estado de la contraseña
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail} // Actualiza el estado del correo
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword} // Actualiza el estado de la contraseña
            />
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    fontSize: 48, // Tamaño del ícono
    color: "#fff",
    marginBottom: 10, // Espaciado entre el ícono y el texto
  },
  titleText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start", // Coloca los elementos más hacia arriba
    marginTop: 20, // Ajusta este valor para controlar cuánto suben
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
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
});

export default App;


