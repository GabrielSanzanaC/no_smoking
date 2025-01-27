import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { db } from '../../FirebaseConfig';
import { collection, doc, getDocs, query, setDoc, where, serverTimestamp, updateDoc } from 'firebase/firestore';

export default function DailyQuestion() {
  const [moodRating, setMoodRating] = useState(3); // Estado inicial del estado de ánimo
  const [guiltRating, setGuiltRating] = useState(3); // Estado inicial de la culpa
  const [loading, setLoading] = useState(false); // Estado para controlar el botón
  const router = useRouter();
  const { emotion, cigarettes, location, activity } = useLocalSearchParams(); // Incluimos 'cigarettes'

  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const cigarettesNumber = parseInt(cigarettes, 10);  // Convertimos el valor de 'cigarettes' a número en base 10

  if (!userId) {
    console.error("Usuario no autenticado");
    return null;
  }

  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  };

  const handleSaveToDB = async () => {
    if (loading) return;
  
    setLoading(true);
    const currentDate = getCurrentDate();
    const userDocRef = doc(db, "usuarios", userId);
    const cigaretteHistoryRef = collection(userDocRef, "CigaretteHistory");
  
    try {
      const q = query(cigaretteHistoryRef, where("fecha", "==", currentDate));
      const querySnapshot = await getDocs(q);
  
      let cigaretteDocRef;
      const cigarettesNumber = parseInt(cigarettes, 10);  // Convertimos 'cigarettes' a número
  
      if (isNaN(cigarettesNumber)) {
        console.error("El valor de 'cigarettes' no es un número válido.");
        return;  // Detenemos la ejecución si el valor no es válido
      }
  
      if (!querySnapshot.empty) {
        cigaretteDocRef = querySnapshot.docs[0].ref;
        const data = querySnapshot.docs[0].data();
        const currentCigarettesSmoked = parseInt(data.cigarettesSmoked, 10) || 0; // Aseguramos que sea un número
        const newCigarettesSmoked = currentCigarettesSmoked + cigarettesNumber; // Sumar correctamente como números
        await updateDoc(cigaretteDocRef, { cigarettesSmoked: newCigarettesSmoked });
      } else {
        cigaretteDocRef = doc(cigaretteHistoryRef);
        await setDoc(cigaretteDocRef, {
          fecha: currentDate,
          cigarettesSmoked: cigarettesNumber, // Guardamos como número
        });
      }
  
      const datosPorCigarroRef = collection(cigaretteDocRef, "datosPorCigarro");
      await setDoc(doc(datosPorCigarroRef), {
        emotion,
        cigarettes,
        location,
        activity,
        moodRating,
        guiltRating,
        timestamp: serverTimestamp(),
      });
  
      router.push("./ProfileScreen");
    } catch (error) {
      console.error("Error al guardar los datos: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Indicador de pasos */}
      <View style={styles.stepContainer}>
        {['01', '02', '03'].map((step, index) => (
          <View
            key={index}
            style={[styles.stepCircle, index === 2 && styles.activeStepCircle]} // Marca el paso activo
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Título */}
      <Text style={styles.title}>¿Cómo te sientes después de fumar?</Text>

      {/* Pregunta 1 */}
      <Text style={styles.subtitle}>¿Cuánto crees que el cigarro ayudó a tu estado de ánimo?</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={moodRating}
          onValueChange={setMoodRating}
          minimumTrackTintColor="#4F59FF"
          maximumTrackTintColor="#33334D"
          thumbTintColor="#4F59FF"
        />
        <View style={styles.sliderLabels}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Text key={value} style={styles.sliderLabel}>{value}</Text>
          ))}
        </View>
        <Text style={styles.ratingText}>Tu calificación: {moodRating}</Text>
      </View>

      {/* Pregunta 2 */}
      <Text style={styles.subtitle}>¿Te sentiste culpable después de fumar?</Text>
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
        <Text style={styles.ratingText}>Tu calificación: {guiltRating}</Text>
      </View>

      {/* Botón de guardar */}
      <TouchableOpacity
        style={[styles.nextButton, loading && { backgroundColor: '#ccc' }]}
        onPress={handleSaveToDB}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#4F59FF" />
        ) : (
          <Text style={styles.nextButtonText}>Ir al Perfil</Text>
        )}
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
    width: 150,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0C4DE',
    textAlign: 'center',
    marginBottom: 10,
  },
  sliderContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
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
  ratingText: {
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
