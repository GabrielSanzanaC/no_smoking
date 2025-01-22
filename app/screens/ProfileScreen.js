import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs, updateDoc, setDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../FirebaseConfig";

export default function ProfileScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState(null); // Estado para almacenar el nombre del usuario
  const [userEmail, setUserEmail] = useState(null); // Estado para almacenar el email del usuario
  const [userId, setUserId] = useState(null); // Estado para almacenar el UID del usuario autenticado
  const [timeWithoutSmoking, setTimeWithoutSmoking] = useState(0); // Tiempo sin fumar
  const [cigarettesSmoked, setCigarettesSmoked] = useState(0); // Número de cigarros fumados

  const getUserData = async (email) => {
    try {
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNombre(userData.nombre || "Usuario");
      } else {
        setNombre("Usuario");
      }
    } catch (error) {
      setNombre("Error al obtener datos");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
        getUserData(user.email);
        getCigarettesSmoked(user.uid); // Obtén los cigarros fumados al cargar el componente
      } else {
        setNombre("Usuario invitado");
      }
    });

    return unsubscribe;
  }, []);

  const getCigarettesSmoked = async (uid) => {
    try {
      const docRef = doc(db, "usuarios", uid); // Referencia al documento del usuario
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCigarettesSmoked(data.cigarettesSmoked || 0); // Asigna el valor o 0 si no existe
      } else {
        console.log("No se encontró el documento del usuario.");
      }
    } catch (error) {
      console.error("Error al obtener los cigarros fumados:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeWithoutSmoking((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleContinue = () => {
    router.push("./dailyQuestionP1"); // Navega a la pantalla
  };

  const historialContinue = () => {
    router.push("./historial"); // Navega a la pantalla
  };

  const cuentaContinue = () => {
    router.push("./cuenta");
  };

  const saveCigaretteToDB = async () => {
    if (!userId) return;

    const currentDate = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

    try {
      // Busca si ya existe un registro para el usuario y la fecha actual
      const q = query(
        collection(db, "cigarettesHistory"),
        where("userId", "==", userId),
        where("fecha", "==", currentDate)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Si ya existe un registro, actualiza el contador
        const docRef = querySnapshot.docs[0].ref;
        const data = querySnapshot.docs[0].data();
        await updateDoc(docRef, {
          cigarettesSmoked: data.cigarettesSmoked + 1,
        });
      } else {
        // Si no existe un registro, crea uno nuevo
        await setDoc(doc(collection(db, "cigarettesHistory")), {
          userId: userId,
          fecha: currentDate,
          cigarettesSmoked: 1,
        });
      }

      // También actualiza el número total de cigarros fumados en el documento del usuario
      const userDocRef = doc(db, "usuarios", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        await updateDoc(userDocRef, {
          cigarettesSmoked: userData.cigarettesSmoked + 1,
        });
        setCigarettesSmoked(userData.cigarettesSmoked + 1); // Actualiza el estado con el nuevo valor
      }
    } catch (error) {
      console.error("Error al guardar datos:", error);
    }
  };

  const handleSmokeButtonPress = () => {
    setTimeWithoutSmoking(0);
    setCigarettesSmoked((prevCount) => prevCount + 1);
    saveCigaretteToDB(); // Guarda los datos en Firestore
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progreso</Text>
        <Ionicons name="settings-outline" size={24} color="white" />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Tablero</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={historialContinue}>
          <Text style={styles.tabText}>Historial</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Card */}
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

      {/* Statistics Section */}
      <View style={styles.statistics}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Tiempo sin fumar</Text>
            <Text style={styles.statValue}>{formatTime(timeWithoutSmoking)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Cigarros fumados</Text>
            <Text style={styles.statValue}>{cigarettesSmoked}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.smokeButton} onPress={handleSmokeButtonPress}>
          <Text style={styles.smokeButtonText}>He fumado un cigarro</Text>
        </TouchableOpacity>
      </View>
        {/* Navigation Bar */}
            <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={handleGoogleContinue}>
          <Ionicons name="chatbox-ellipses-outline" size={28} color="white" />
          <Text style={styles.navText}>Diario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={cuentaContinue}>
          <Ionicons name="person-outline" size={28} color="white" />
          <Text style={styles.navText}>Cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
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
