import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Platform } from "react-native";
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

  const handleBackToProfile = () => {
    router.push("./ProfileScreen");
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirige a la pantalla de inicio de sesión
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToProfile}>
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de la Cuenta</Text>
      </View>

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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
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

        <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
          <Ionicons name="lock-closed-outline" size={16} color="white" />
          <Text style={styles.actionButtonText}>Cambiar contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={16} color="white" />
          <Text style={styles.actionButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

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
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
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
    fontSize: 12,
  },
  scrollContainer: {
    flexGrow: 1, // Permitir que el contenido crezca y sea desplazable
  },
  stats: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#1F3A93",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  statTitle: {
    color: "#B0C4DE",
    fontSize: 14,
    marginBottom: 5,
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
    justifyContent: "center",
    marginBottom: 20,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#0C2B80",
    paddingVertical: 10,
    borderRadius: 10,
    position: "absolute", // Hace que la barra sea fija
    bottom: 0, // Coloca la barra en la parte inferior de la pantalla
    left: 0,
    right: 0,
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

export default AccountDetailsScreen;