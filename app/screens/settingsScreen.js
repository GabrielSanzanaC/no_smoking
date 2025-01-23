import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, Switch, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../FirebaseConfig";
import { signOut, deleteUser } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState("es");
  const [notifications, setNotifications] = useState(true);
  const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);

  // Funciones
  const handlePasswordReset = () => {
    router.push("./reestablecerContrasena");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Cerraste sesión correctamente.");
      await AsyncStorage.removeItem('isLoggedIn'); // Eliminar estado de sesión
      await AsyncStorage.removeItem('userData');
      router.push("/");
    } catch (error) {
      Alert.alert("Error al cerrar sesión:", error.message);
    }
  };

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
                router.push("/");
              }
            } catch (error) {
              Alert.alert("Error al eliminar la cuenta:", error.message);
            }
          },
        },
      ]
    );
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
    Alert.alert(`Tema cambiado a ${isDarkMode ? "claro" : "oscuro"}.`);
  };

  const handleChangeLanguage = () => {
    const newLanguage = language === "es" ? "en" : "es";
    setLanguage(newLanguage);
    Alert.alert(`Idioma cambiado a ${newLanguage === "es" ? "Español" : "Inglés"}.`);
  };

  const toggleNotifications = () => {
    setNotifications((prev) => !prev);
    Alert.alert(`Notificaciones ${notifications ? "desactivadas" : "activadas"}.`);
  };

  const handleSupport = () => {
    router.push("./SupportScreen");
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

      {/* Activar/Desactivar notificaciones */}
      <View style={styles.option}>
        <Text style={styles.optionText}>Notificaciones</Text>
        <Switch value={notifications} onValueChange={toggleNotifications} />
      </View>

      {/* Soporte técnico */}
      <TouchableOpacity style={styles.button} onPress={handleSupport}>
        <Ionicons name="help-circle-outline" size={16} color="white" />
        <Text style={styles.buttonText}>Soporte técnico</Text>
      </TouchableOpacity>

      {/* Mostrar políticas de privacidad */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setPrivacyModalVisible(true)}
      >
        <Ionicons name="document-text-outline" size={16} color="white" />
        <Text style={styles.buttonText}>Políticas de privacidad</Text>
      </TouchableOpacity>

      {/* Modal de políticas de privacidad */}
      <Modal
        visible={isPrivacyModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Políticas de privacidad</Text>
            <Text style={styles.modalText}>
              Aquí van los detalles sobre cómo manejamos tus datos y respetamos
              tu privacidad.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Eliminar cuenta */}
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeleteAccount}
      >
        <Ionicons name="trash-outline" size={16} color="white" />
        <Text style={styles.buttonText}>Eliminar cuenta</Text>
      </TouchableOpacity>

      {/* Cerrar sesión */}
      <TouchableOpacity
        style={[styles.button, styles.signOutButton]}
        onPress={handleSignOut}
      >
        <Ionicons name="exit-outline" size={16} color="white" />
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* Versión de la aplicación */}
      <Text style={styles.versionText}>Versión: 1.0.0</Text>
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
  signOutButton: {
    backgroundColor: "#FFA500",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#4F59FF",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  versionText: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});

export default SettingsScreen;
