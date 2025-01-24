import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router'; // Importa useLocalSearchParams
import { getAuth } from 'firebase/auth'; // Para obtener el usuario autenticado
import { db } from '../../FirebaseConfig'; // Asegúrate de importar la configuración de Firebase
import { collection, doc, getDocs, query, setDoc, where, serverTimestamp, updateDoc } from 'firebase/firestore';

export default function DailyQuestionP5() {
  const [guiltRating, setGuiltRating] = useState(3); 
  const router = useRouter();
  const { emotion, moodRating, location , activity} = useLocalSearchParams();

  // Obtener el usuario actual desde Firebase Authentication
  const auth = getAuth();
  const userId = auth.currentUser?.uid; 

  // Si no hay usuario autenticado, muestra un mensaje o redirige
  if (!userId) {
    console.error("Usuario no autenticado");
    return null; // O redirigir a una pantalla de login
  }

  // Función para obtener la fecha actual en formato 'YYYY-MM-DD'
  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Retorna la fecha en formato 'YYYY-MM-DD'
  };

  const handleSaveToDB = async () => {
    const currentDate = getCurrentDate();
    const userDocRef = doc(db, "usuarios", userId);
    const cigaretteHistoryRef = collection(userDocRef, "CigaretteHistory");

    try {
      const q = query(cigaretteHistoryRef, where("fecha", "==", currentDate));
      const querySnapshot = await getDocs(q);
  
      let cigaretteDocRef;
  
      if (!querySnapshot.empty) {
        // Si ya existe un documento para hoy, actualiza el contador de cigarrillos
        cigaretteDocRef = querySnapshot.docs[0].ref;
        const data = querySnapshot.docs[0].data();
        const newCigarettesSmoked = data.cigarettesSmoked + 1;
        await updateDoc(cigaretteDocRef, { cigarettesSmoked: newCigarettesSmoked });
      } else {
        // Si no existe un documento para hoy, crea uno nuevo
        cigaretteDocRef = doc(cigaretteHistoryRef);
        await addDoc(cigaretteDocRef, {
          fecha: currentDate,
          cigarettesSmoked: 1,
        });
        console.log("Nuevo documento creado con 1 cigarro fumado");
      }
  
      // Guarda los datos adicionales dentro de la subcolección 'datosPorCigarro'
      const datosPorCigarroRef = collection(cigaretteDocRef, "datosPorCigarro");
      await setDoc(doc(datosPorCigarroRef), {
        emotion,
        moodRating,
        location,
        activity,
        guiltRating,
        timestamp: serverTimestamp(),
      });
      console.log("Datos adicionales guardados en 'datosPorCigarro'");
  
      router.push("./ProfileScreen");
    } catch (error) {
      console.error("Error al guardar los datos en la base de datos: ", error);
    }
  };  

  return (
    <View style={styles.container}>
      {/* Step Counter */}
      <View style={styles.stepContainer}>
        {['01', '02', '03', '04', '05'].map((step, index) => (
          <View
            key={index}
            style={[styles.stepCircle, index === 4 && styles.activeStepCircle]}
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Title */}
      <Text style={styles.title}>¿Te sentiste culpable después de fumar?</Text>
      <Text style={styles.subtitle}>(Escala del 1 al 5: 1 = Nada, 5 = Mucho)</Text>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={guiltRating}
          onValueChange={setGuiltRating}
          minimumTrackTintColor="#4F59FF"
          maximumTrackTintColor="#33334D"
          thumbTintColor="#4F59FF"
        />
        <View style={styles.sliderLabels}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Text key={value} style={styles.sliderLabel}>{value}</Text>
          ))}
        </View>
        <Text style={styles.guiltRatingText}>Tu calificación: {guiltRating}</Text>
      </View>

      {/* Save Data Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleSaveToDB}>
        <Text style={styles.nextButtonText}>Ir al Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F2D',
    padding: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    marginBottom: 20,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#33334D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: {
    backgroundColor: '#4F59FF',
  },
  stepText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0C4DE',
    textAlign: 'center',
    marginBottom: 20,
  },
  sliderContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 30,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sliderLabel: {
    color: '#FFF',
    fontSize: 12,
  },
  guiltRatingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 10,
  },
  nextButton: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F59FF',
  },
});
