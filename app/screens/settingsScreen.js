import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../FirebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

const SettingsScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    router.push("./reestablecerContrasena"); // Cambia "./reestablecerContrasena" por la ruta exacta de tu archivo si es necesario
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("./AccountDetailsScreen")}> {/* Botón para volver */}
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Configuración</Text>
      </View>

        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Ionicons name="lock-closed-outline" size={16} color="white" />
          <Text style={styles.buttonText}>Restablecer contraseña</Text>
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
  content: {
    marginTop: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#1F3A93",
    color: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F59FF",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    marginLeft: 10,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
