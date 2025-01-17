import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LaunchScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("./screens/CreateAccountScreen"); // Navega a la pantalla CreateAccountScreen
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: "https://example.com/lotus_background.jpg" }} // Reemplaza con tu imagen o usa require('./ruta_a_tu_imagen.png')
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.iconContainer}>
          <Ionicons name="ios-remove-circle-outline" size={60} color="white" />
          <Text style={styles.title}>No Smoke</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 50,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 150,
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#5E5DF0",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
