import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Animatable from "react-native-animatable";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

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
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
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

const AccountDetailsScreen = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState(null);
  const [email, setEmail] = useState(null);
  const [moneda, setMoneda] = useState("CLP");
  const [totalCigarettesSmoked, setTotalCigarettesSmoked] = useState(0);
  const [totalMoneySpentSinceSmoking, setTotalMoneySpentSinceSmoking] = useState(0);
  const [totalMoneySpentSinceAccountCreation, setTotalMoneySpentSinceAccountCreation] = useState(0);
  const [timeLostInDays, setTimeLostInDays] = useState(0);  // Estado para almacenar el tiempo perdido en días
  const [timeLostInHours, setTimeLostInHours] = useState(0); // Estado para almacenar las horas perdidas
  const [timeLostInMinutes, setTimeLostInMinutes] = useState(0); // Estado para almacenar los minutos perdidos

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        getUserData(user.email);
        getTotalCigarettesSmoked(user.email); // Obtener el total de cigarrillos fumados
      } else {
        setNombre("Usuario invitado");
        setEmail("No disponible");
      }
    });

    return unsubscribe;
  }, []);

  // Obtener datos del usuario desde Firebase
  const getUserData = async (email) => {
    try {
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNombre(userData.nombre || "Usuario");
        setMoneda(userData.moneda || "CLP");
      } else {
        setNombre("Usuario desconocido");
      }
    } catch (error) {
      setNombre("Error al obtener datos");
    }
  };

  // Función para obtener el total de cigarrillos fumados y dinero gastado
  const getTotalCigarettesSmoked = async (email) => {
    try {
      const userQuery = query(collection(db, "usuarios"), where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);
  
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];  // Obtenemos el documento del usuario
        const cigaretteHistoryRef = collection(userDoc.ref, "CigaretteHistory"); // Referencia a la subcolección CigaretteHistory
  
        const cigaretteHistorySnapshot = await getDocs(cigaretteHistoryRef);
  
        let totalCigarettes = 0;
        let totalMoneySpent = 0;
  
        cigaretteHistorySnapshot.forEach((doc) => {
          const data = doc.data();
          totalCigarettes += data.cigarettesSmoked || 0; // Sumar los cigarrillos fumados
          totalMoneySpent += (data.cigarettesSmoked || 0) * (data.pricePerCigarette || 0); // Sumar el dinero gastado
        });
  
        setTotalCigarettesSmoked(totalCigarettes);
        setTotalMoneySpentSinceSmoking(totalMoneySpent); // Guardamos el dinero total gastado

        // Calcular el tiempo perdido basado en cigarrillos fumados (7 minutos por cigarro)
        const timeLostInMinutesTotal = totalCigarettes * 7;
        const days = Math.floor(timeLostInMinutesTotal / 1440); // Número de días completos
        const hours = Math.floor((timeLostInMinutesTotal % 1440) / 60); // Número de horas restantes
        const minutes = timeLostInMinutesTotal % 60; // Restantes minutos

        setTimeLostInDays(days);
        setTimeLostInHours(hours);
        setTimeLostInMinutes(minutes); // Guardamos los minutos restantes
      } else {
        console.log("Usuario no encontrado");
      }
    } catch (error) {
      console.error("Error al obtener cigarrillos fumados y dinero gastado:", error);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: moneda }).format(amount);
  };

  return (
    <View style={styles.container}>
      <BackgroundCircles /> {/* Background Circles Component */}

      <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
        <View style={styles.profileTextContainer}>
          <TouchableOpacity onPress={() => router.push("./ProfileScreen")} style={styles.profileButton}>
            <Ionicons name="arrow-back-outline" size={24} color="white" />
            <Text style={styles.profileText}>Inicio</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("./settingsScreen")} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </Animatable.View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <Animatable.View animation="zoomIn" duration={1000} style={styles.card}>
          <Image source={{ uri: "https://example.com/user.jpg" }} style={styles.profileImage} />
          <Text style={styles.cardText}>{nombre || "Cargando..."}</Text>
          <Text style={styles.cardSubText}>{email || "Cargando..."}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="camera-outline" size={16} color="white" />
            <Text style={styles.editButtonText}>Cambiar foto</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200} duration={800} style={styles.stats}>
          <Animatable.View animation="bounceIn" delay={300} style={styles.statCard}>
            <Text style={styles.statTitle}>Cigarrillos fumados</Text>
            <Text style={styles.statValue}>{totalCigarettesSmoked}</Text>
          </Animatable.View>
          <Animatable.View animation="bounceIn" delay={400} style={styles.statCard}>
            <Text style={styles.statTitle}>Dinero gastado desde que comenzó a fumar</Text>
            <Text style={styles.statValue}>{formatMoney(totalMoneySpentSinceSmoking)}</Text>
          </Animatable.View>
          <Animatable.View animation="bounceIn" delay={600} style={styles.statCard}>
            <Text style={styles.statTitle}>Dinero gastado desde la creación de la cuenta</Text>
            <Text style={styles.statValue}>{formatMoney(totalMoneySpentSinceAccountCreation)}</Text>
          </Animatable.View>
          <Animatable.View animation="bounceIn" delay={500} style={styles.statCard}>
            <Text style={styles.statTitle}>Tiempo de vida perdido</Text>
            <Text style={styles.statValue}>{timeLostInDays} días, {timeLostInHours} horas y {timeLostInMinutes} minutos</Text>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7595BF",
    padding: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    position: "absolute",
    top: 10, // Fijo en la parte superior
    left: 20,
    right: 20,
    zIndex: 1, // Asegura que esté sobre otros elementos
    paddingHorizontal: 20,
  },
  profileTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileText: {
    color: "white",
    marginLeft: 5,
    fontWeight: "600",
    fontSize: 16,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#072040",
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
    marginTop: 0, // Agregado para dar espacio desde la parte superior (debajo del header)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#4F59FF",
  },
  cardText: {
    color: "white",
    fontSize: 18,
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
    backgroundColor: "#059E9E",
    padding: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: "white",
    marginLeft: 5,
    fontWeight: "600",
  },
  scrollContainer: {
    paddingBottom: 100,
    marginTop: 80, // Ajuste para dejar espacio debajo del header y card
  },
  stats: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#072040",
    padding: 20,
    borderRadius: 100,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  statTitle: {
    color: "#B0C4DE",
    fontSize: 14,
    fontWeight: "600",
  },
  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  settingsButton: {
    backgroundColor: "#4F59FF",
    padding: 10,
    borderRadius: 30,
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

export default AccountDetailsScreen;
