import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../FirebaseConfig';
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';

export default function dailyQuestionP1() {
  const [selectedEmotion, setSelectedEmotion] = useState(""); // Estado para la emoción seleccionada
  const router = useRouter();

  // Función para guardar los datos en Firestore
  const saveDataToFirestore = async () => {
    try {
      const auth = getAuth(); // Obtén la instancia de autenticación
      const user = auth.currentUser; // Usuario actualmente logueado

      if (!user) {
        console.error("No hay usuario logueado");
        return;
      }

      const userId = user.uid; // UID único del usuario logueado
      const dateString = new Date().toISOString().split('T')[0]; // Obtener la fecha en formato YYYY-MM-DD

      // Referencia a la colección "CigaretteHistory" dentro del usuario logueado
      const historyRef = collection(db, `usuarios/${userId}/CigaretteHistory`);

      // Crear la referencia del documento con la fecha (ID del documento = fecha)
      const cigaretteDocRef = doc(historyRef, dateString); // Usamos la fecha como ID del documento

      // Verificamos si ya existe el documento para la fecha actual
      const docSnapshot = await getDoc(cigaretteDocRef);

      if (docSnapshot.exists()) {
        console.log("Documento de la fecha encontrado, agregando datos de cigarro...");

        // Agregamos los datos de "datosPorCigarro" dentro del documento de la fecha
        const datosPorCigarroRef = collection(cigaretteDocRef, "datosPorCigarro");

        // Guardar los datos específicos por cigarro
        await addDoc(datosPorCigarroRef, {
          id: dateString, // Usamos la fecha como un identificador único para cada cigarro
          emocion: selectedEmotion, // Emoción seleccionada
          antes: "", // Si tiene valor
          ayudaAnimo: "", // Si tiene valor
          culpable: "", // Si tiene valor
          donde: "", // Si tiene valor
        });

        console.log("Datos de cigarro guardados correctamente");

        router.push("./dailyQuestionP2"); // Navega a la siguiente pantalla

      } else {
        console.error("No se ha encontrado un documento para la fecha actual.");
      }
    } catch (error) {
      console.error("Error al guardar el dato:", error);
    }
  };

  const emotions = [
    { id: 'feliz', label: 'Feliz', icon: '😊' },
    { id: 'ansioso', label: 'Ansioso', icon: '😰' },
    { id: 'cansado', label: 'Cansado', icon: '😔' },
    { id: 'estresado', label: 'Estresado', icon: '😩' },
    { id: 'molesto', label: 'Molesto', icon: '😠' },
    { id: 'triste', label: 'Triste', icon: '😞' },
  ];

  const selectEmotion = (emotionId) => {
    setSelectedEmotion(emotionId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo te sientes hoy?</Text>

      {/* Emotion Buttons */}
      <View style={styles.taskContainer}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.taskButton,
              selectedEmotion === emotion.id && styles.selectedTaskButton,
            ]}
            onPress={() => selectEmotion(emotion.id)}
          >
            <Text style={styles.taskIcon}>{emotion.icon}</Text>
            <Text style={styles.taskLabel}>{emotion.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.nextButton,
          { opacity: selectedEmotion ? 1 : 0.5 },
        ]}
        onPress={saveDataToFirestore}
        disabled={!selectedEmotion}
      >
        <Text style={styles.nextButtonText}>Siguiente</Text>
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  taskContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  taskButton: {
    width: 100,
    height: 100,
    backgroundColor: '#33334D',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  selectedTaskButton: {
    backgroundColor: '#4F59FF',
  },
  taskIcon: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 5,
  },
  taskLabel: {
    fontSize: 14,
    color: '#FFF',
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
