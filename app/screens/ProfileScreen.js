import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs, updateDoc, setDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../FirebaseConfig";

export default function ProfileScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [timeWithoutSmoking, setTimeWithoutSmoking] = useState(0); // Tiempo sin fumar en segundos
  const [cigarettesSmokedToday, setCigarettesSmokedToday] = useState(null);
  const [startTime, setStartTime] = useState(Date.now()); // Marca de tiempo inicial
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

  const saveCigaretteToDB = async () => {
    if (!userId) return;

    const currentDate = getCurrentDate();
    const userDocRef = doc(db, "usuarios", userId);
    const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

    try {
      const q = query(cigarettesCollectionRef, where("fecha", "==", currentDate));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const data = querySnapshot.docs[0].data();
        await updateDoc(docRef, { cigarettesSmoked: data.cigarettesSmoked + 1 });
        setCigarettesSmokedToday(data.cigarettesSmoked + 1);
      } else {
        await setDoc(doc(cigarettesCollectionRef), { fecha: currentDate, cigarettesSmoked: 1 });
        setCigarettesSmokedToday(1);
      }
    } catch (error) {
      console.error("Error al guardar cigarro:", error);
    }
  };

  const handleSmokeButtonPress = async () => {
    saveCigaretteToDB();
    const newStartTime = Date.now();
    setStartTime(newStartTime); // Reinicia el cronómetro
    await AsyncStorage.setItem("startTime", newStartTime.toString()); // Guarda la nueva marca de tiempo
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progreso</Text>
        <Ionicons name="settings-outline" size={24} color="white" />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Tablero</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.push("./historial")}>
          <Text style={styles.tabText}>Historial</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Image
          source={{ uri: "https://example.com/user.jpg" }}
          style={styles.profileImage}
        />
        <Text style={styles.cardText}>
          Hola {nombre || "Cargando..."}! buen día.
        </Text>
        <Text style={styles.cardDate}>{formattedDate}</Text>
      </View>

      <View style={styles.statistics}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Tiempo sin fumar</Text>
            <Text style={styles.statValue}>{formatTime(timeWithoutSmoking)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Cigarros fumados hoy</Text>
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
        <TouchableOpacity style={styles.smokeButton} onPress={handleSmokeButtonPress}>
          <Text style={styles.smokeButtonText}>He fumado un cigarro</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("./dailyQuestionP1")}>
          <Ionicons name="chatbox-ellipses-outline" size={28} color="white" />
          <Text style={styles.navText}>Diario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("./cuenta")}>
          <Ionicons name="person-outline" size={28} color="white" />
          <Text style={styles.navText}>Cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    width: 30,
    height: 30,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#0F0F2D",
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#071E50",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#0C2B80",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "white",
  },
  tabText: {
    color: "white",
    fontSize: 14,
  },
  activeTabText: {
    color: "#004080",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1F3A93",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
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
    textAlign: "center",
    marginBottom: 5,
  },
  cardDate: {
    color: "#B0C4DE",
    fontSize: 14,
  },
  statistics: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: "#1F3A93",
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  statTitle: {
    color: "#B0C4DE",
    fontSize: 14,
    textAlign: "center",
  },
  statValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  smokeButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  smokeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "#0C2B80",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
});