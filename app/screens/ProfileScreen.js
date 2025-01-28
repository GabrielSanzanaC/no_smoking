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
    setIsModalVisible(true); // Muestra el modal de confirmación
  };

  const confirmExit = () => {
    BackHandler.exitApp(); // Cierra la aplicación
  };
  
  const cancelExit = () => {
    setIsModalVisible(false); // Cierra el modal
  };
  
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
        await getUserData(user.email);
        await getCigarettesForToday(user.uid);
        await getCigarettesData(user.uid);
      } else {
        setNombre("Usuario invitado");
        setCigarettesSmokedToday(0);
      }
    });

    return unsubscribe;
  }, []);

  const getCigarettesData = async (uid) => {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const userDocRef = doc(db, "usuarios", uid);
      const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

      const q = query(
        cigarettesCollectionRef,
        where("fecha", ">=", firstDayOfMonth.toISOString().split("T")[0]),
        where("fecha", "<=", lastDayOfMonth.toISOString().split("T")[0])
      );
      const querySnapshot = await getDocs(q);

      const data = Array(lastDayOfMonth.getDate()).fill(0);
      querySnapshot.forEach((doc) => {
        const date = new Date(doc.data().fecha);
        const day = date.getDate();
        data[day - 1] = doc.data().cigarettesSmoked || 0;
      });

      setCigarettesData(data);
      setLast7DaysData(data.slice(-7).reverse()); // Reverse the last 7 days data
    } catch (error) {
      console.error("Error al obtener datos de los cigarrillos:", error);
    }
  };

  const getMonthlySavings = async (uid) => {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const userDocRef = doc(db, "usuarios", uid);
      const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

      const q = query(
        cigarettesCollectionRef,
        where("fecha", ">=", firstDayOfMonth.toISOString().split("T")[0]),
        where("fecha", "<=", lastDayOfMonth.toISOString().split("T")[0])
      );
      const querySnapshot = await getDocs(q);

      let totalCigarettesSmoked = 0;
      querySnapshot.forEach((doc) => {
        totalCigarettesSmoked += doc.data().cigarettesSmoked || 0;
      });

      const userDoc = await getDocs(query(collection(db, "usuarios"), where("uid", "==", uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        const cigarrillosPorDía = parseInt(userData.cigarrillosPorDía, 10);
        const cigarrillosPorPaquete = parseInt(userData.cigarrillosPorPaquete, 10);
        const precioPorPaquete = parseFloat(userData.precioPorPaquete);

        const precioPorCigarrillo = precioPorPaquete / cigarrillosPorPaquete;
        const diasEnElMes = lastDayOfMonth.getDate();
        const totalCigarettesExpected = cigarrillosPorDía * diasEnElMes;

        const dineroAhorrado = (totalCigarettesExpected - totalCigarettesSmoked) * precioPorCigarrillo;

        setMonthlySavings(dineroAhorrado.toFixed(2));
      } else {
        console.error("No se encontraron datos del usuario.");
      }
    } catch (error) {
      console.error("Error al calcular el dinero ahorrado:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      getMonthlySavings(userId);
    }
  }, [userId]);


  
  useEffect(() => {
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

  const last7DaysChartData = {
    labels: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    }).reverse(),
    datasets: [
      {
        data: last7DaysData,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartData = {
    labels: Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => i + 1),
    datasets: [
      {
        data: cigarettesData,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "transparent", // Fondo transparente
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "3",
      strokeWidth: "1",
      stroke: "#ffa726",
    },
    propsForBackgroundLines: {
      stroke: "transparent",
    },
    yAxisLabel: '',
    yAxisSuffix: '',
    yAxisInterval: Math.max(0,cigarettesSmokedToday), // Define el intervalo del eje Y basado en cigarettesSmokedToday
  };

  const handleChartPress = () => {
    setFullMonthChartVisible(true);
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
      <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={cancelExit}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>¿Estás seguro?</Text>
              <Text style={styles.modalMessage}>¿Quieres cerrar la aplicación?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={cancelExit} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmExit} style={[styles.modalButton, styles.confirmButton]}>
                  <Text style={styles.modalButtonText}>Salir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      <TouchableOpacity style={styles.navButtonLeft} onPress={handleExitApp}>
          <Ionicons name="exit" size={24} color="#F2F2F2" />
        </TouchableOpacity>
        <Animatable.Text animation="bounceIn" style={styles.welcomeText}>¡Hola, {nombre}!</Animatable.Text>
        <ScrollView 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
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
              <Text style={styles.statLabel}>
                {monthlySavings >= 0 ? "Ahorro del mes" : "Dinero gastado"}
              </Text>
              <Text style={[styles.statValue, monthlySavings < 0 && { color: "#FF0000" }]}>
                ${Math.abs(monthlySavings)}
              </Text>
            </View>
          </View>
          <Animatable.Text animation="fadeIn" duration={1000} style={styles.motivationalText}>
            {motivationalMessage}
          </Animatable.Text>
          <Text style={styles.chartTitle}>Cigarros fumados últimos 7 días</Text>
          <View style={styles.chartContainer}>
            <TouchableOpacity onPress={handleChartPress}>
              <LineChart
                data={last7DaysChartData}
                width={screenWidth * 0.8} // Ajustar al ancho del statBox
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                segments={6} // Number of horizontal grid lines
                fromZero={true} // Start Y axis from zero
                transparent={true} // Fondo transparente para el gráfico
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animatable.View>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("./historial")}>
          <Ionicons name="calendar" size={24} color="#F2F2F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton} onPress={() => router.push("./dailyQuestionP1")}>
          <View style={styles.circle}>
            <Ionicons name="add-outline" size={24} color="#F2F2F2" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("./cuenta")}>
          <Ionicons name="person" size={24} color="#F2F2F2" />
        </TouchableOpacity>
      </View>
      <FullMonthChart
        visible={isFullMonthChartVisible}
        onClose={() => setFullMonthChartVisible(false)}
        data={chartData}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7595BF",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 30,
  },
  animatedCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "#072040",
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
    height: "70%",
    backgroundColor: "#072040",
    borderRadius: 20,
    padding: 20,
    paddingTop: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
    marginBottom: 80,
  },
  welcomeText: {
    color: "#F2F2F2",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  scrollContentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 20,
  },
  statsContainer: {
    width: "90%",
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
  chartTitle: {
    fontSize: 18,
    color: "#F2F2F2",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  chartContainer: {
    width: "90%",
    alignItems: "center",
  },
  chart: {
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Fondo igual al de los cuadros de estadísticas
  },
  navButtonLeft: {
    position: "absolute",
    top: 20, // Ajusta esto según lo necesites
    left: 10,
    backgroundColor: "#FF6F61",
    padding: 10,
    borderRadius: 50,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    width: "45%",
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#FF6F61", // Color del botón
  },
  confirmButton: {
    backgroundColor: "#FF0000", // Botón de salir en color rojo
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ProfileScreen;