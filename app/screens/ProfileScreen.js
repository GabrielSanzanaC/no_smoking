import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../FirebaseConfig";

export default function ProfileScreen() {
  const router = useRouter();
  const [nombre, setnombre] = useState(null); // Estado para almacenar el nombre del usuario
  const [userEmail, setUserEmail] = useState(null); // Estado para almacenar el email del usuario

  const getUserData = async (email) => {
    try {
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setnombre(userData.nombre || "Usuario");
      } else {
        setnombre("Usuario");
      }
    } catch (error) {
      setnombre("Error al obtener datos");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        getUserData(user.email);
      } else {
        setnombre("Usuario invitado");
      }
    });

    return unsubscribe;
  }, []);

  const handleGoogleContinue = () => {
    router.push("./dailyQuestionP1");
  };

  const historialContinue = () => {
    router.push("./historial");
  };

  const cuentaContinue = () => {
    router.push("./cuenta");
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
        <Ionicons nombre="settings-outline" size={24} color="white" />
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
            <Text style={styles.statTitle}>Dinero ahorrado en el mes</Text>
            <Text style={styles.statValue}>213.713</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Tiempo sin fumar</Text>
            <Text style={styles.statValue}>1h24m</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Racha</Text>
            <Text style={styles.statValue}>8</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Cigarros fumados</Text>
            <Text style={styles.statValue}>23</Text>
          </View>
        </View>
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
