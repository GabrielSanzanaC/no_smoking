import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Alert, BackHandler } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../FirebaseConfig";
import * as Animatable from 'react-native-animatable';

export default function ProfileScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("Cargando...");
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [timeWithoutSmoking, setTimeWithoutSmoking] = useState(0); // Tiempo sin fumar en segundos
  const [cigarettesSmokedToday, setCigarettesSmokedToday] = useState(null);
  const [streakDays, setStreakDays] = useState(0); // Racha de días
  const [monthlySavings, setMonthlySavings] = useState(0); // Ahorro de dinero
  const [startTime, setStartTime] = useState(Date.now()); // Marca de tiempo inicial
  const [smokingHistory, setSmokingHistory] = useState([]);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [intervalId, setIntervalId] = useState(null);

  const getCurrentDate = () => new Date().toISOString().split("T")[0];

  const getUserData = async (email) => {
    try {
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNombre(userData.nombre || "Usuario");
        setUserId(userData.uid);
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
      const currentDate = getCurrentDate();
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

  const handleExitApp = () => {
    Alert.alert(
      "Confirmar salida",
      "¿Estás seguro de que deseas salir de la aplicación?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Salir",
          onPress: () => BackHandler.exitApp(),
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
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
      const currentDate = getCurrentDate();

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

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });

  return (
    <View style={styles.background}>
      <View style={styles.container}>

        {/* Botón para salir de la aplicación */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleExitApp}>
          <Ionicons name="exit-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <Animatable.View animation="fadeIn" duration={1000} style={styles.header}>
          <Text style={styles.title}>¡Hola, {nombre}!</Text>
          <Text style={styles.subtitle}>Tu progreso contra el tabaco</Text>
        </Animatable.View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="time" size={40} color="#4CAF50" />
            <Text style={styles.statLabel}>Tiempo sin fumar</Text>
            <Text style={styles.statValue}>{formatTime(timeWithoutSmoking)}</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="logo-no-smoking" size={40} color="#FF6F61" /> {/* Cambio del icono del cigarro */}
            <Text style={styles.statLabel}>Cigarros fumados hoy</Text>
            {cigarettesSmokedToday === null ? (
              <Image
                source={require("../../assets/images/load.gif")}
                style={styles.loader}
              />
            ) : (
              <Text style={styles.statValue}>{cigarettesSmokedToday}</Text>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={40} color="#FF6F61" />
            <Text style={styles.statLabel}>Racha de días</Text>
            <Text style={styles.statValue}>{streakDays} días</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="cash" size={40} color="#4CAF50" />
            <Text style={styles.statLabel}>Ahorro del mes</Text>
            <Text style={styles.statValue}>${monthlySavings}</Text>
          </View>
        </View>

        <Animatable.Text animation="fadeIn" duration={1000} style={styles.motivationalText}>
          {motivationalMessage}
        </Animatable.Text>

        <FlatList
          data={smokingHistory}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyCount}>{item.count} cig.</Text>
            </View>
          )}
          keyExtractor={(item) => item.date}
          style={styles.historyList}
        />
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("./historial")}>
          <Ionicons name="calendar" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton} onPress={handleSmokeButtonPress}>
          <View style={styles.circle}>
            <Ionicons name="add-outline" size={24} color="#fff" /> {/* Cambio del icono de signo más */}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("./cuenta")}>
          <Ionicons name="person" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#2C2C3E',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    width: '90%',
    alignSelf: 'center',
  },
  signOutButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#FF6F61',
    padding: 10,
    borderRadius: 5,
  },
  header: {
    marginBottom: 40, // Aumenta el margen inferior
    marginTop: 30, // Aumenta el margen superior
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#f0f0f0',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: '45%',
  },
  statLabel: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 10,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  motivationalText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyList: {
    width: '100%',
    marginTop: 20,
  },
  historyItem: {
    backgroundColor: '#333',
    padding: 10,
    marginBottom: 5,
    borderRadius: 10,
  },
  historyDate: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyCount: {
    color: '#fff',
    marginTop: 5,
  },
  loader: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    backgroundColor: '#2C2C3E',
  },
  navButton: {
    padding: 10,
    backgroundColor: '#FF6F61',
    borderRadius: 50,
  },
  circleButton: {
    backgroundColor: '#FF6F61',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  circle: {
    backgroundColor: '#FF6F61',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
