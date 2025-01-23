import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, query, where } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig"; // Asegúrate de que 'auth' y 'db' estén exportados correctamente

const AccountDetailsScreen = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState(null);
  const [email, setEmail] = useState(null);
  const [totalCigarettesSmoked, setTotalCigarettesSmoked] = useState(0);
  const [totalMoneySpent, setTotalMoneySpent] = useState(0);
  const [totalMoneySpentSinceSmoking, setTotalMoneySpentSinceSmoking] = useState(0);
  const [totalMoneySpentSinceAccountCreation, setTotalMoneySpentSinceAccountCreation] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        getUserData(user.email);
        getTotalCigarettesSmokedAndMoneySpent(user.uid);
        calculateMoneySpentSinceSmoking(user.uid);
        calculateMoneySpentSinceAccountCreation(user.uid);
      } else {
        setNombre("Usuario invitado");
        setEmail("No disponible");
      }
    });

    return unsubscribe;
  }, []);

  const getUserData = async (email) => {
    try {
      const q = query(collection(db, "usuarios"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNombre(userData.nombre || "Usuario");
      } else {
        setNombre("Usuario desconocido");
      }
    } catch (error) {
      setNombre("Error al obtener datos");
    }
  };

  const getTotalCigarettesSmokedAndMoneySpent = async (uid) => {
    try {
      const userDocRef = doc(db, "usuarios", uid);
      const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

      const querySnapshot = await getDocs(cigarettesCollectionRef);
      let totalCigarettes = 0;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        totalCigarettes += data.cigarettesSmoked;
      });
      setTotalCigarettesSmoked(totalCigarettes);

      // Obtener datos del usuario para cálculos
      const userDoc = await getDocs(query(collection(db, "usuarios"), where("uid", "==", uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        const { añosFumando, cigarrillosPorDía, cigarrillosPorPaquete, precioPorPaquete } = userData;

        // Calcular el costo total
        const totalDaysSmoking = añosFumando * 365;
        const totalCigarettesSmoked = totalDaysSmoking * cigarrillosPorDía;
        const totalCost = (totalCigarettesSmoked / cigarrillosPorPaquete) * precioPorPaquete;
        setTotalMoneySpent(totalCost);
      }
    } catch (error) {
      console.error("Error al obtener el total de cigarrillos fumados y el costo total:", error);
    }
  };

  const calculateMoneySpentSinceSmoking = async (uid) => {
    try {
      const userDoc = await getDocs(query(collection(db, "usuarios"), where("uid", "==", uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        const { añosFumando, cigarrillosPorDía, cigarrillosPorPaquete, precioPorPaquete } = userData;

        // Calcular el costo total desde que comenzó a fumar
        const totalDaysSmoking = añosFumando * 365;
        const totalCigarettesSmoked = totalDaysSmoking * cigarrillosPorDía;
        const totalCost = (totalCigarettesSmoked / cigarrillosPorPaquete) * precioPorPaquete;
        setTotalMoneySpentSinceSmoking(totalCost);
      }
    } catch (error) {
      console.error("Error al calcular el dinero gastado desde que comenzó a fumar:", error);
    }
  };

  const calculateMoneySpentSinceAccountCreation = async (uid) => {
    try {
      const userDocRef = doc(db, "usuarios", uid);
      const cigarettesCollectionRef = collection(userDocRef, "CigaretteHistory");

      const querySnapshot = await getDocs(cigarettesCollectionRef);
      let totalCigarettes = 0;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        totalCigarettes += data.cigarettesSmoked;
      });

      // Obtener datos del usuario para cálculos
      const userDoc = await getDocs(query(collection(db, "usuarios"), where("uid", "==", uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        const { cigarrillosPorPaquete, precioPorPaquete } = userData;

        // Calcular el costo total desde la creación de la cuenta de cigaretteHistory
        const totalCost = (totalCigarettes / cigarrillosPorPaquete) * precioPorPaquete;
        setTotalMoneySpentSinceAccountCreation(totalCost);
      }
    } catch (error) {
      console.error("Error al calcular el dinero gastado desde la creación de la cuenta:", error);
    }
  };

  const handleGoogleContinue = () => {
    router.push("./DiaryScreen");
  };

  const handleEditProfilePicture = () => {
    console.log("Editar foto de perfil");
  };

  const handleChangePassword = () => {
    router.push("./reestablecerContrasena");
  };

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("./settingsScreen")} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
    
        {/* Todo el contenido ahora está dentro de ScrollView */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Foto de perfil y datos */}
          <View style={styles.card}>
            <Image
              source={{ uri: "https://example.com/user.jpg" }} // Foto de perfil predeterminada
              style={styles.profileImage}
            />
            <Text style={styles.cardText}>{nombre || "Cargando..."}</Text>
            <Text style={styles.cardSubText}>{email || "Cargando..."}</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfilePicture}>
              <Ionicons name="camera-outline" size={16} color="white" />
              <Text style={styles.editButtonText}>Cambiar foto</Text>
            </TouchableOpacity>
          </View>
    
          {/* Estadísticas */}
          <View style={styles.stats}>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Cigarrillos fumados</Text>
              <Text style={styles.statValue}>{totalCigarettesSmoked}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Dinero gastado desde que comenzó a fumar</Text>
              <Text style={styles.statValue}>{totalMoneySpentSinceSmoking.toFixed(2)} CLP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Dinero gastado desde la creación de la cuenta</Text>
              <Text style={styles.statValue}>{totalMoneySpentSinceAccountCreation.toFixed(2)} CLP</Text>
            </View>
          </View>
        </ScrollView>
    
        {/* Barra de navegación */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push("./ProfileScreen")}>
            <Ionicons name="home-outline" size={28} color="white" />
            <Text style={styles.navText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push("./DiaryScreen")}>
            <Ionicons name="chatbox-ellipses-outline" size={28} color="white" />
            <Text style={styles.navText}>Diario</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Asegúrate de que el contenedor principal ocupe todo el espacio disponible
    backgroundColor: "#0F0F2D",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#1F3A93",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
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
    backgroundColor: "#4F59FF",
    padding: 8,
    borderRadius: 5,
  },
  editButtonText: {
    color: "white",
    marginLeft: 5,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  stats: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#253873",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  statTitle: {
    color: "#B0C4DE",
    fontSize: 14,
  },
  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F59FF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    color: "white",
    marginLeft: 10,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1F3A93",
    paddingVertical: 15,
    borderRadius: 10,
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    color: "white",
    marginTop: 5,
  },
  settingsButton: {
    backgroundColor: "#4F59FF",
    padding: 10,
    borderRadius: 20,
  },
});

export default AccountDetailsScreen;
