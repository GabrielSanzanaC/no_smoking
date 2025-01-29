import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Animatable from "react-native-animatable";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { auth, db, storage } from "../../FirebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BackgroundShapes from '../../components/BackgroundShapes';

const AccountDetailsScreen = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState(null);
  const [email, setEmail] = useState(null);
  const [moneda, setMoneda] = useState("CLP");
  const [totalCigarettesSmoked, setTotalCigarettesSmoked] = useState(0);
  const [totalMoneySpentSinceSmoking, setTotalMoneySpentSinceSmoking] = useState(0);
  const [totalMoneySpentSinceAccountCreation, setTotalMoneySpentSinceAccountCreation] = useState(0);
  const [timeLostInDays, setTimeLostInDays] = useState(0);
  const [timeLostInHours, setTimeLostInHours] = useState(0);
  const [timeLostInMinutes, setTimeLostInMinutes] = useState(0);
  const [photoURL, setPhotoURL] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        getUserData(user.uid); // Cambiado a UID
        getTotalCigarettesSmoked(user.uid); // Cambiado a UID
      } else {
        setNombre("Usuario invitado");
        setEmail("No disponible");
      }
    });
    return unsubscribe;
  }, []);


  const getUserData = async (email) => {
    try {
      const q = query(collection(db, "usuarios"), where("uid", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNombre(userData.nombre || "Usuario");
        setMoneda(userData.moneda || "CLP");
        setPhotoURL(userData.photoURL);  // Cargar la foto desde Firestore
      } else {
        setNombre("Usuario desconocido");
      }
    } catch (error) {
      setNombre("Error al obtener datos");
    }
  };

  const getTotalCigarettesSmoked = async (email) => {
    try {
      const userQuery = query(collection(db, "usuarios"), where("uid", "==", email));
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

        setTotalCigarettesSmoked(totalCigarettes);
        setTotalMoneySpentSinceSmoking(totalMoneySpent);

        const timeLostInMinutesTotal = totalCigarettes * 7;
        const days = Math.floor(timeLostInMinutesTotal / 1440);
        const hours = Math.floor((timeLostInMinutesTotal % 1440) / 60);
        const minutes = timeLostInMinutesTotal % 60;

        setTimeLostInDays(days);
        setTimeLostInHours(hours);
        setTimeLostInMinutes(minutes);
      } else {
        console.log("Usuario no encontrado");
      }
    } catch (error) {
      console.error("Error al obtener cigarrillos fumados y dinero gastado:", error);
    }
  };

  const handlePhotoPick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const user = auth.currentUser;
    try {
      const userRef = doc(db, "usuarios", user.uid);
      const blob = await fetch(uri).then((res) => res.blob());
      const photoRef = ref(storage, `profile_pictures/${user.uid}.jpg`);
      
      await uploadBytes(photoRef, blob);
      const newPhotoURL = await getDownloadURL(photoRef);
      
      await updateDoc(userRef, { photoURL: newPhotoURL });
      setPhotoURL(newPhotoURL);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  useEffect(() => {
    if (photoURL) {
      console.log("URL de la foto que se está mostrando:", photoURL);
    }
  }, [photoURL]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: moneda }).format(amount);
  };

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
        <Image 
            source={{ uri: photoURL ? `${photoURL}?ts=${Date.now()}` : null }} 
            style={styles.profileImage} 
          />
          <Text style={styles.cardText}>{nombre || "Cargando..."}</Text>
          <Text style={styles.cardSubText}>{email || "Cargando..."}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handlePhotoPick}>
            <Ionicons name="camera-outline" size={16} color="white" />
            <Text style={styles.editButtonText}>Cambiar foto</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200} duration={800} style={styles.stats}>
          <Animatable.View animation="bounceIn" delay={300} style={styles.statCard}>
            <Text style={styles.statTitle}>Cigarrillos fumados</Text>
            <Text style={styles.statValue}>{totalCigarettesSmoked}</Text>
          </Animatable.View>
          <Animatable.View animation="bounceIn" delay={400} style={styles.statCard}>
            <Text style={styles.statTitle}>Dinero gastado desde que comenzó a fumar</Text>
            <Text style={styles.statValue}>{formatMoney(totalMoneySpentSinceSmoking)}</Text>
          </Animatable.View>
          <Animatable.View animation="bounceIn" delay={600} style={styles.statCard}>
            <Text style={styles.statTitle}>Dinero gastado desde la creación de la cuenta</Text>
            <Text style={styles.statValue}>{formatMoney(totalMoneySpentSinceAccountCreation)}</Text>
          </Animatable.View>
          <Animatable.View animation="bounceIn" delay={500} style={styles.statCard}>
            <Text style={styles.statTitle}>Tiempo de vida perdido</Text>
            <Text style={styles.statValue}>{timeLostInDays} días, {timeLostInHours} horas y {timeLostInMinutes} minutos</Text>
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
    borderRadius: 100,
    marginBottom: 20,
    marginTop: 0, // Agregado para dar espacio desde la parte superior (debajo del header)
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.4)",
    elevation: 8,
  },
  profileImageContainer: {
    position: "absolute",
    top: -45,  // Ajusta la distancia según lo que necesites
    left: "50%",
    transform: [{ translateX: -45 }],  // Centra la imagen
    zIndex: 1, // Asegúrate de que esté sobre el nombre
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#4F59FF",
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
    borderRadius: 100,
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
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle: {
    position: "absolute",
    borderRadius: 50,
  },
});

export default AccountDetailsScreen;
