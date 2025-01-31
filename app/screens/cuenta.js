import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Animatable from "react-native-animatable";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { auth, db, storage } from "../../FirebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BackgroundShapes from '../../components/BackgroundShapes';
import loadGif from "../../assets/images/load.gif";  // Importar la imagen de carga

const AccountDetailsScreen = () => {
  const router = useRouter();
  const [state, setState] = useState({
    nombre: null,
    email: null,
    moneda: "CLP",
    totalCigarettesSmoked: 0,
    totalMoneySpentSinceSmoking: 0,
    totalMoneySpentSinceAccountCreation: 0,
    timeLostInDays: 0,
    timeLostInHours: 0,
    timeLostInMinutes: 0,
    photoURL: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setState(prevState => ({ ...prevState, email: user.email }));
        getUserData(user.uid);
        getTotalCigarettesSmoked(user.uid);
      } else {
        setState({
          nombre: "Usuario invitado",
          email: "No disponible",
          moneda: "CLP",
          totalCigarettesSmoked: 0,
          totalMoneySpentSinceSmoking: 0,
          totalMoneySpentSinceAccountCreation: 0,
          timeLostInDays: 0,
          timeLostInHours: 0,
          timeLostInMinutes: 0,
          photoURL: null,
        });
      }
    });
    return unsubscribe;
  }, []);

  const getUserData = useCallback(async (uid) => {
    try {
      const q = query(collection(db, "usuarios"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setState(prevState => ({
          ...prevState,
          nombre: userData.nombre || "Usuario",
          moneda: userData.moneda || "CLP",
          photoURL: userData.photoURL,
    
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          nombre: "Usuario desconocido"
        }));
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        nombre: "Error al obtener datos"
      }));
    }
  }, []);

  const getTotalCigarettesSmoked = useCallback(async (uid) => {
    try {
      const userQuery = query(collection(db, "usuarios"), where("uid", "==", uid));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const cigaretteHistoryRef = collection(userDoc.ref, "CigaretteHistory");

        const cigaretteHistorySnapshot = await getDocs(cigaretteHistoryRef);

        let totalCigarettes = 0;
        let totalMoneySpent = 0;

        cigaretteHistorySnapshot.forEach((doc) => {
          const data = doc.data();
          totalCigarettes += data.cigarettesSmoked || 0;
          totalMoneySpent += (data.cigarettesSmoked || 0) * (data.pricePerCigarette || 0);
        });

        const timeLostInMinutesTotal = totalCigarettes * 7;
        const days = Math.floor(timeLostInMinutesTotal / 1440);
        const hours = Math.floor((timeLostInMinutesTotal % 1440) / 60);
        const minutes = timeLostInMinutesTotal % 60;

        setState(prevState => ({
          ...prevState,
          totalCigarettesSmoked: totalCigarettes,
          timeLostInDays: days,
          timeLostInHours: hours,
          timeLostInMinutes: minutes
        }));
      } else {
        console.log("Usuario no encontrado");
      }
    } catch (error) {
      console.error("Error al obtener cigarrillos fumados y dinero gastado:", error);
    }
  }, []);

  const getTotalMoneySpent = useCallback(async (userId) => {
    try {
      const userSnap = await getDocs(query(collection(db, "usuarios"), where("uid", "==", userId)));

      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();

        const yearsSmoking = parseInt(userData.añosFumando) || 0;
        const cigarettesPerDay = parseInt(userData.cigarrillosPorDía) || 0;
        const pricePerPack = parseFloat(userData.precioPorPaquete) || 0;
        const cigarettesPerPack = parseInt(userData.cigarrillosPorPaquete) || 1;

        if (!yearsSmoking || !cigarettesPerDay || !pricePerPack || !cigarettesPerPack) {
          console.warn("Faltan datos para calcular el gasto total.");
          return;
        }

        const totalSpentSinceSmoking = yearsSmoking * 365 * cigarettesPerDay * (pricePerPack / cigarettesPerPack);

        const cigaretteHistoryRef = collection(userSnap.docs[0].ref, "CigaretteHistory");
        const cigaretteHistorySnap = await getDocs(cigaretteHistoryRef);

        let totalSpentSinceAccountCreation = 0;

        cigaretteHistorySnap.forEach((doc) => {
          const data = doc.data();
          totalSpentSinceAccountCreation += (parseInt(data.cigarettesSmoked) || 0) * (pricePerPack / cigarettesPerPack);
        });

        setState(prevState => ({
          ...prevState,
          totalMoneySpentSinceSmoking: totalSpentSinceSmoking,
          totalMoneySpentSinceAccountCreation: totalSpentSinceAccountCreation
        }));
      }
    } catch (error) {
      console.error("Error al calcular el gasto total:", error);
    }
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      getTotalMoneySpent(auth.currentUser.uid);
    }
  }, [getTotalMoneySpent]);

  const handlePhotoPick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  }, []);

  const uploadImage = useCallback(async (uri) => {
    const user = auth.currentUser;
    try {
      const userRef = doc(db, "usuarios", user.uid);
      const blob = await fetch(uri).then((res) => res.blob());
      const photoRef = ref(storage, `profile_pictures/${user.uid}.jpg`);

      await uploadBytes(photoRef, blob);
      const newPhotoURL = await getDownloadURL(photoRef);

      await updateDoc(userRef, { photoURL: newPhotoURL });
      setState(prevState => ({
        ...prevState,
        photoURL: newPhotoURL
      }));
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  }, []);

  useEffect(() => {
    if (state.photoURL) {
      console.log("URL de la foto que se está mostrando:", state.photoURL);
    }
  }, [state.photoURL]);

  const formatMoney = useCallback((amount) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: state.moneda }).format(amount);
  }, [state.moneda]);

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <BackgroundShapesMemo />

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
          {/* Mostrar imagen de perfil */}
          {state.photoURL ? (
            <Image source={{ uri: `${state.photoURL}?ts=${Date.now()}` }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder} />
          )}
          <Text style={styles.cardText}>{state.nombre || "Cargando..."}</Text>
          <Text style={styles.cardSubText}>{state.email || "Cargando..."}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handlePhotoPick}>
            <Ionicons name="camera-outline" size={16} color="white" />
            <Text style={styles.editButtonText}>Cambiar foto</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200} duration={800} style={styles.stats}>
          <Animatable.View animation="bounceIn" delay={300} style={styles.statCard}>
            <Text style={styles.statTitle}>Cigarrillos fumados</Text>
            <Text style={styles.statValue}>{state.totalCigarettesSmoked}</Text>
          </Animatable.View>
          <Animatable.View animation="bounceIn" delay={400} style={styles.statCard}>
            <Text style={styles.statTitle}>Dinero gastado desde que comenzó a fumar</Text>
            <Text style={styles.statValue}>{formatMoney(state.totalMoneySpentSinceSmoking)}</Text>
          </Animatable.View>
          <Animatable.View animation="bounceIn" delay={600} style={styles.statCard}>
            <Text style={styles.statTitle}>Dinero gastado desde la creación de la cuenta</Text>
            <Text style={styles.statValue}>{formatMoney(state.totalMoneySpentSinceAccountCreation)}</Text>
          </Animatable.View>
          <Animatable.View animation="bounceIn" delay={500} style={styles.statCard}>
            <Text style={styles.statTitle}>Tiempo de vida perdido</Text>
            <Text style={styles.statValue}>{state.timeLostInDays} días, {state.timeLostInHours} horas y {state.timeLostInMinutes} minutos</Text>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

const BackgroundShapesMemo = React.memo(() => {
  return <BackgroundShapes />;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7595BF",
    padding: 0,
    zIndex: -1,
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
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 0, // Agregado para dar espacio desde la parte superior (debajo del header)
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.4)",
    elevation: 8,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#4F59FF",
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ccc",
    marginBottom: 10,
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
    borderRadius: 10,
    marginBottom: 10,
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.4)",
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
  loader: {
    width: 30,
    height: 30,
  },
});

export default AccountDetailsScreen;