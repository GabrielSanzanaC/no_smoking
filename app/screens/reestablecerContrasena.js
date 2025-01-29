import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";
import { auth } from "../../FirebaseConfig"; // Asegúrate de que 'auth' esté exportado correctamente

// Componente de las pelotas moviéndose
const BackgroundCircles = () => {
  const circles = Array.from({ length: 15 });
  const circleRefs = useRef([]);

  useEffect(() => {
    const moveCircles = () => {
      circleRefs.current.forEach((circle) => {
        const randomX = Math.random() * 2 - 1;
        const randomY = Math.random() * 2 - 1;
        const duration = Math.random() * 3000 + 2000;
        const moveAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(circle, {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(circle, {
              toValue: 0,
              duration: duration,
              useNativeDriver: true,
            }),
          ])
        );
        moveAnimation.start();
      });
    };

    moveCircles();
  }, []);

  return (
    <View style={styles.backgroundContainer}>
      {circles.map((_, index) => {
        const circleAnimation = useRef(new Animated.Value(0)).current;
        circleRefs.current[index] = circleAnimation;

        const size = Math.random() * 50 + 50;
        const opacity = Math.random() * 0.5 + 0.3;
        const color = `rgba(7, 32, 64, ${opacity})`;

        return (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              {
                width: size,
                height: size,
                backgroundColor: color,
                borderColor: "#ffffff",
                borderWidth: 2,
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                transform: [
                  {
                    translateX: circleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.random() * 100 * (Math.random() < 0.5 ? 1 : -1)],
                    }),
                  },
                  {
                    translateY: circleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.random() * 100 * (Math.random() < 0.5 ? 1 : -1)],
                    }),
                  },
                  {
                    rotate: circleAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", `${Math.random() * 360}deg`],
                    }),
                  },
                ],
                opacity: circleAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const ResetPasswordScreen = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  // Animaciones de aparición
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateYAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

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
      <BackgroundCircles /> {/* Agregado el componente de las pelotas aquí */}

      <TouchableOpacity onPress={() => router.push("./settingsScreen")} style={styles.backButton}>
        <Ionicons name="arrow-back-outline" size={24} color="white" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Contraseña actual"
          placeholderTextColor="black"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          placeholderTextColor="black"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
          <Text style={styles.actionButtonText}>Actualizar contraseña</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );  
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row", // Para que el ícono y el texto estén en una fila
    alignItems: "center", // Centra verticalmente el ícono y el texto
    marginBottom: 20, // Espacio entre el botón y los otros elementos
  },
  backText: {
    color: "white", // Color blanco para el texto
    fontSize: 16, // Tamaño de fuente
    marginLeft: 8, // Espacio entre el ícono y el texto
  },
  container: {
    flex: 1,
    backgroundColor: "#7595BF",
    padding: 20,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#072040",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#A9A9A9",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "beige",
    color: "black",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#059E9E",
    width: "100%",
  },
  actionButton: {
    backgroundColor: "#059E9E",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle: {
    position: "absolute",
    borderRadius: 50,
  },
});

export default ResetPasswordScreen;
