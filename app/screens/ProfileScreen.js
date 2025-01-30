import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, Modal, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../FirebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, setDoc, updateDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";
import FullMonthChart from "./FullMonthChart";
import moment from "moment";  // Importar moment.js


const screenWidth = Dimensions.get("window").width;

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
  const [isFullMonthChartVisible, setFullMonthChartVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cigarettesData, setCigarettesData] = useState(Array(31).fill(0));
  const [last7DaysData, setLast7DaysData] = useState(Array(7).fill(0));
  
  const handleExitApp = () => {
    setIsModalVisible(true);
  };

  const confirmExit = () => {
    BackHandler.exitApp();
  };

  const cancelExit = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
        await getUserData(user.uid);
        await getCigarettesForToday(user.uid);
        await getCigarettesData(user.uid);
        await calculateTimeWithoutSmoking(user.uid);
        await updateStreak(user.uid);
      } else {
        setNombre("Usuario invitado");
        setCigarettesSmokedToday(0);
      }
    });

    return unsubscribe;
  }, []);

  const getCigarettesData = async (uid) => {
    try {
      const userDocRef = doc(db, "usuarios", uid);
      const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

      const q = query(cigarettesCollectionRef);
      const querySnapshot = await getDocs(q);

      const data = {};
      querySnapshot.forEach((doc) => {
        const date = moment(doc.data().fecha);
        const dayOfMonth = date.date();
        const cigarettesSmoked = doc.data().cigarettesSmoked || 0;

        if (!data[dayOfMonth]) {
          data[dayOfMonth] = 0;
        }
        data[dayOfMonth] += cigarettesSmoked;
      });

      const currentDate = moment();
      const last7Days = Array(7).fill(0);

      for (let i = 0; i < 7; i++) {
        const date = currentDate.clone().subtract(i, 'days');
        const dayOfMonth = date.date();
        if (data[dayOfMonth]) {
          last7Days[6 - i] = data[dayOfMonth];
        }
      }

      setLast7DaysData(last7Days);

      const daysInMonth = currentDate.daysInMonth();
      const monthData = Array(daysInMonth).fill(0);

      for (let i = 0; i < daysInMonth; i++) {
        if (data[i + 1]) {
          monthData[i] = data[i + 1];
        }
      }

      setCigarettesData(monthData);
    } catch (error) {
      console.error("Error al obtener datos de los cigarrillos:", error);
    }
  };
  
  const updateStreak = async (uid) => {
    const streakRef = doc(db, "usuarios", uid, "racha", "latest");
    const docSnap = await getDoc(streakRef);
  
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // Obtener solo la fecha (yyyy-mm-dd)
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      const lastLogin = data.lastLogin;
  
      if (lastLogin === todayDate) {
        setStreakDays(data.streak);
        console.log("La racha no cambia, ya es el mismo día.");
      } else {
        if (lastLogin === getYesterday(todayDate)) {
          const newStreak = (data.streak || 0) + 1;
          await updateDoc(streakRef, {
            streak: newStreak,
            lastLogin: todayDate,
          });
          console.log(`Racha incrementada: ${newStreak} días.`);
          setStreakDays(newStreak);  // Actualiza el estado de la racha
        } else {
          await updateDoc(streakRef, {
            streak: 1,
            lastLogin: todayDate,
          });
          console.log("Racha reiniciada.");
          setStreakDays(1);  // Reinicia el estado de la racha
        }
      }
    } else {
      await setDoc(streakRef, {
        streak: 1,
        lastLogin: todayDate,
      });
      console.log("Primer login, racha iniciada.");
      setStreakDays(1);  // Inicializa la racha
    }
  };
  
  // Función para obtener la fecha del día anterior
  const getYesterday = (date) => {
    const dateObj = new Date(date);
    dateObj.setDate(dateObj.getDate() - 1);
    return dateObj.toISOString().split('T')[0]; // Solo la fecha (yyyy-mm-dd)
  };

  const calculateTimeWithoutSmoking = async (uid) => {
    try {
      const userDocRef = doc(db, "usuarios", uid);
      const TiempoSinFumarRef = collection(userDocRef, "TiempoSinFumar");

      // Aquí obtenemos todos los documentos dentro de la colección TiempoSinFumar
      const querySnapshot = await getDocs(TiempoSinFumarRef);

      if (!querySnapshot.empty) {
        // Tomamos el primer documento de la colección
        const tiempoDoc = querySnapshot.docs[0];

        const ultimoRegistro = tiempoDoc.data()?.ultimoRegistro;

        if (ultimoRegistro) {
          const currentTime = Timestamp.now();
          const difference = currentTime.seconds - ultimoRegistro.seconds;
          setTimeWithoutSmoking(difference);

          // Actualizar el cronómetro cada segundo
          const interval = setInterval(() => {
            setTimeWithoutSmoking(prevTime => prevTime + 1);
          }, 1000);

          setIntervalId(interval); // Guardamos el ID del intervalo para poder cancelarlo más tarde
        } else {
          setTimeWithoutSmoking(0);
        }
      } else {
        console.error("No se encontró el documento en la colección.");
      }
    } catch (error) {
      console.error("Error al calcular el tiempo sin fumar:", error);
    }
  };

  useEffect(() => {
    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  

  const getMonthlySavings = async (uid) => {
    try {
      const currentDate = moment();
      const firstDayOfMonth = currentDate.clone().startOf('month');
      const lastDayOfMonth = currentDate.clone().endOf('month');

      const userDocRef = doc(db, "usuarios", uid);
      const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

      const q = query(
        cigarettesCollectionRef,
        where("fecha", ">=", firstDayOfMonth.format("YYYY-MM-DD")),
        where("fecha", "<=", lastDayOfMonth.format("YYYY-MM-DD"))
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
        const diasEnElMes = lastDayOfMonth.date();
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
      const currentDate = moment().format("YYYY-MM-DD");

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
      const q = query(collection(db, "usuarios"), where("uid", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNombre(userData.nombre || "Usuario");
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
      const currentDate = moment().format("YYYY-MM-DD");
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

  const getLast7DaysLabels = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = moment().subtract(i, 'days');
      return date.format('ddd');
    }).reverse();
  };

  const last7DaysChartData = {
    labels: getLast7DaysLabels(),
    datasets: [
      {
        data: last7DaysData,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartData = {
    labels: Array.from({ length: moment().endOf('month').date() }, (_, i) => i + 1),
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
    strokeWidth: 2, // Grosor de las líneas
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
    yAxisInterval: 1, // Define el intervalo del eje Y
    decimalPlaces: 0,
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Svg height="130" width="18">
                  <SvgText
                    x="20"
                    y="100"
                    fill="white"
                    fontSize="12"
                    rotation="-90"
                    origin="10, 100"
                  >
                    N° de Cigarros
                  </SvgText>
                </Svg>
                <LineChart
                  data={last7DaysChartData}
                  width={screenWidth * 0.75} // Ajustar al ancho del statBox
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  fromZero={true} // Start Y axis from zero
                  transparent={true} // Fondo transparente para el gráfico
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.chartInfo}>Toca el gráfico para más detalles</Text>
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
    boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.4)",
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
    boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.3)",
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
    width: "60%",
    alignItems: "center",
    letf: 5,
  },
  chart: {
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Fondo igual al de los cuadros de estadísticas
  },
  chartInfo: {
    fontSize: 12,
    color: "#F2F2F2",
    textAlign: "center",
    marginTop: 5,
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
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
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