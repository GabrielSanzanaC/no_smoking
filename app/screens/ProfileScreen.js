import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../FirebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState("Cargando...");
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [timeWithoutSmoking, setTimeWithoutSmoking] = useState(0);
  const [cigarettesSmokedToday, setCigarettesSmokedToday] = useState(null);
  const [streakDays, setStreakDays] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [intervalId, setIntervalId] = useState(null);

  const handleExitApp = () => {
    BackHandler.exitApp();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
        await getUserData(user.email);
        await getCigarettesForToday(user.uid);
      } else {
        setNombre("Usuario invitado");
        setCigarettesSmokedToday(0);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Inicia el cronómetro
    const loadStartTime = async () => {
      try {
        const savedStartTime = await AsyncStorage.getItem("startTime");
        if (savedStartTime) {
          setStartTime(parseInt(savedStartTime, 10));
        }
      } catch (error) {
        console.error("Error al cargar la marca de tiempo:", error);
      }
    };

    loadStartTime();

    const id = setInterval(() => {
      setTimeWithoutSmoking(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    setIntervalId(id);

    return () => clearInterval(id);
  }, [startTime]);

  useEffect(() => {
    const dailyMessage = () => {
      const messages = [
        "Cada día sin fumar es una victoria.",
        "Tu salud es lo más importante.",
        "Recuerda por qué comenzaste este viaje.",
        "¡Sigue así, estás haciendo un gran trabajo!",
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    };

    const checkAndUpdateMessage = async () => {
      const lastShownDate = await AsyncStorage.getItem("lastShownDate");
      const currentDate = new Date().toISOString().split("T")[0];

      if (lastShownDate !== currentDate) {
        const newMessage = dailyMessage();
        setMotivationalMessage(newMessage);
        await AsyncStorage.setItem("lastShownDate", currentDate);
        await AsyncStorage.setItem("motivationalMessage", newMessage);
      } else {
        const savedMessage = await AsyncStorage.getItem("motivationalMessage");
        setMotivationalMessage(savedMessage || dailyMessage());
      }
    };

    checkAndUpdateMessage();
  }, []);

  const handleSmokeButtonPress = async () => {
    const newStartTime = Date.now();
    setStartTime(newStartTime); // Reinicia el cronómetro
    await AsyncStorage.setItem("startTime", newStartTime.toString()); // Guarda la nueva marca de tiempo
    await router.push("./dailyQuestionP1"); // Navega a la siguiente pantalla
  };

  const getUserData = async (email) => {
    try {
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNombre(userData.nombre || "Usuario");
        setStreakDays(userData.streakDays || 0);
        setMonthlySavings(userData.monthlySavings || 0);
      } else {
        setNombre("Usuario");
      }
    } catch (error) {
      setNombre("Error al obtener datos");
    }
  };

  const getCigarettesForToday = async (uid) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const userDocRef = doc(db, "usuarios", uid);
      const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

      const q = query(cigarettesCollectionRef, where("fecha", "==", currentDate));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setCigarettesSmokedToday(data.cigarettesSmoked || 0);
      } else {
        setCigarettesSmokedToday(0);
      }
    } catch (error) {
      console.error("Error al obtener cigarros para hoy:", error);
      setCigarettesSmokedToday(0);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={500}
        style={styles.animatedCircle1}
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        style={styles.animatedCircle2}
      />
      <Animatable.View animation="fadeIn" style={styles.rectangle}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleExitApp}>
          <Ionicons name="exit-outline" size={24} color="#F2F2F2" />
        </TouchableOpacity>
        <Animatable.Text animation="bounceIn" style={styles.welcomeText}>¡Hola, {nombre}!</Animatable.Text>
        <Animatable.View animation="fadeInUp" style={styles.formContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="time" size={40} color="#FF6F61" />
              <Text style={styles.statLabel}>Tiempo sin fumar</Text>
              <Text style={styles.statValue}>{formatTime(timeWithoutSmoking)}</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="logo-no-smoking" size={40} color="#059E9E" />
              <Text style={styles.statLabel}>Cigarros fumados hoy</Text>
              {cigarettesSmokedToday === null ? (
                <View style={styles.loader} />
              ) : (
                <Text style={styles.statValue}>{cigarettesSmokedToday}</Text>
              )}
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle" size={40} color="#059E9E" />
              <Text style={styles.statLabel}>Racha de días</Text>
              <Text style={styles.statValue}>{streakDays} días</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="cash" size={40} color="#FF6F61" />
              <Text style={styles.statLabel}>Ahorro del mes</Text>
              <Text style={styles.statValue}>${monthlySavings}</Text>
            </View>
          </View>
          <Animatable.Text animation="fadeIn" duration={1000} style={styles.motivationalText}>
            {motivationalMessage}
          </Animatable.Text>
        </Animatable.View>
      </Animatable.View>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("./historial")}>
          <Ionicons name="calendar" size={24} color="#F2F2F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton} onPress={handleSmokeButtonPress}>
          <View style={styles.circle}>
            <Ionicons name="add-outline" size={24} color="#F2F2F2" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("./cuenta")}>
          <Ionicons name="person" size={24} color="#F2F2F2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7595BF",
    alignItems: "center",
    justifyContent: "center",
  },
  animatedCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "#072040", // Contrast Black
    borderRadius: 150,
    opacity: 0.2,
    top: -50,
    left: -50,
  },
  animatedCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "#1F82BF",
    borderRadius: 100,
    opacity: 0.3,
    bottom: -50,
    right: -50,
  },
  rectangle: {
    width: "90%",
    backgroundColor: "#072040",
    borderRadius: 20,
    padding: 20,
    paddingTop: 60, // Add padding at the top for the greeting and sign out button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
    marginBottom: 80, // Add space for nav bar
  },
  welcomeText: {
    color: "#F2F2F2",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10, // Add margin bottom to separate from the stats
  },
  formContainer: {
    width: "100%",
  },
  statsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: "45%",
  },
  statLabel: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 10,
    textAlign: "center",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
  },
  motivationalText: {
    fontSize: 20,
    color: "#FFD700",
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
  signOutButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6F61',
    padding: 10,
    borderRadius: 5,
  },
  loader: {
    width: 30,
    height: 30,
  },
  navBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  navButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 50,
  },
  circleButton: {
    backgroundColor: "#FF6F61",
    padding: 20,
    borderRadius: 50,
  },
  circle: {
    backgroundColor: '#FF6F61',
    borderRadius: 35,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItem: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 5,
    borderRadius: 10,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyDate: {
    fontSize: 14,
    color: "#555",
  },
  historyCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6F61",
  },
});

export default ProfileScreen;