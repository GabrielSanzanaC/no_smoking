import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AccountDetailsScreen = () => {
  const router = useRouter();

  const handleEditProfilePicture = () => {
    // Aquí agregar lógica para cambiar la foto de perfil
    console.log("Editar foto de perfil");
  };

  const handleChangePassword = () => {
    // Aquí agregar lógica para cambiar la contraseña
    console.log("Cambiar contraseña");
  };

  const handleBackToProfile = () => {
    router.push("./ProfileScreen");
  };

  // Datos de ejemplo
  const userDetails = {
    username: "JohnDoe",
    email: "johndoe@example.com",
    cigarrillosFumados: 50,
    dineroAhorrado: 1000, // en pesos o la moneda que uses
    fotoPerfil:
      "https://example.com/user.jpg", // Reemplazar con la URL de la foto de perfil
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToProfile}>
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de la Cuenta</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <Image
          source={{ uri: userDetails.fotoPerfil }}
          style={styles.profileImage}
        />
        <Text style={styles.cardText}>{userDetails.username}</Text>
        <Text style={styles.cardSubText}>{userDetails.email}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditProfilePicture}
        >
          <Ionicons name="camera-outline" size={16} color="white" />
          <Text style={styles.editButtonText}>Cambiar foto</Text>
        </TouchableOpacity>
      </View>

      {/* Account Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Cigarrillos fumados</Text>
          <Text style={styles.statValue}>{userDetails.cigarrillosFumados}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Dinero ahorrado</Text>
          <Text style={styles.statValue}>{userDetails.dineroAhorrado} CLP</Text>
        </View>
      </View>

      {/* Change Password Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleChangePassword}
      >
        <Ionicons name="lock-closed-outline" size={16} color="white" />
        <Text style={styles.actionButtonText}>Cambiar contraseña</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0F0F2D",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#33334D",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  cardText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardSubText: {
    color: "#B0C4DE",
    fontSize: 14,
    marginBottom: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F59FF",
    padding: 8,
    borderRadius: 5,
  },
  editButtonText: {
    color: "white",
    marginLeft: 5,
    fontSize: 12,
  },
  stats: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#33334D",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  statTitle: {
    color: "#B0C4DE",
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F59FF",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default AccountDetailsScreen;