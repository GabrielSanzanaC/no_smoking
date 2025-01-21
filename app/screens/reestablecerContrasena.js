import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";
import { auth } from "../FirebaseConfig"; // Asegúrate de que 'auth' esté exportado correctamente

const ResetPasswordScreen = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Contraseña actualizada exitosamente");
      router.push("./cuenta");
    } catch (error) {
      setError("Error al actualizar la contraseña. Verifica tus datos e intenta nuevamente.");
      console.error("Error al actualizar la contraseña: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("./cuenta")}>
        <Ionicons name="arrow-back-outline" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Contraseña actual"
        placeholderTextColor="#B0C4DE"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        placeholderTextColor="#B0C4DE"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
        <Text style={styles.actionButtonText}>Actualizar contraseña</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F2D",
    padding: 20,
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#33334D",
    color: "white",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#4F59FF",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default ResetPasswordScreen;