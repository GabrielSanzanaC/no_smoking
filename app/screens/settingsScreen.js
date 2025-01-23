import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../FirebaseConfig";
import { signOut, deleteUser } from "firebase/auth";

const SettingsScreen = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState("es"); // Idioma por defecto: español

  // Restablecer contraseña
  const handlePasswordReset = () => {
    router.push("./reestablecerContrasena");
  };

  // Cerrar sesión
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Cerraste sesión correctamente.");
      router.push("/"); // Redirige a la pantalla de inicio de sesión
    } catch (error) {
      Alert.alert("Error al cerrar sesión:", error.message);
    }
  };

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (user) {
                await deleteUser(user);
                Alert.alert("Tu cuenta ha sido eliminada.");
                router.push("/"); // Redirige a la pantalla de inicio
              }
            } catch (error) {
              Alert.alert("Error al eliminar la cuenta:", error.message);
            }
          },
        },
      ]
    );
  };

  // Cambiar tema
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
    Alert.alert(`Tema cambiado a ${isDarkMode ? "claro" : "oscuro"}.`);
  };

  // Cambiar idioma
  const handleChangeLanguage = () => {
    const newLanguage = language === "es" ? "en" : "es";
    setLanguage(newLanguage);
    Alert.alert(`Idioma cambiado a ${newLanguage === "es" ? "Español" : "Inglés"}.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("./cuenta")}>
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Configuración</Text>
      </View>

      {/* Cambiar contraseña */}
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Ionicons name="lock-closed-outline" size={16} color="white" />
        <Text style={styles.buttonText}>Restablecer contraseña</Text>
      </TouchableOpacity>

      {/* Cambiar tema */}
      <View style={styles.option}>
        <Text style={styles.optionText}>Modo oscuro</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>

      {/* Cambiar idioma */}
      <TouchableOpacity style={styles.button} onPress={handleChangeLanguage}>
        <Ionicons name="language-outline" size={16} color="white" />
        <Text style={styles.buttonText}>Cambiar idioma</Text>
      </TouchableOpacity>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={16} color="white" />
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* Eliminar cuenta */}
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeleteAccount}
      >
        <Ionicons name="trash-outline" size={16} color="white" />
        <Text style={styles.buttonText}>Eliminar cuenta</Text>
      </TouchableOpacity>
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
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F59FF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: "#FF4D4D",
  },
  buttonText: {
    color: "white",
    marginLeft: 10,
    fontWeight: "bold",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#253873",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  optionText: {
    color: "white",
    fontSize: 16,
  },
});

export default SettingsScreen;