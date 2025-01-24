import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function dailyQuestionP1() {
  const [selectedEmotion, setSelectedEmotion] = useState(''); // Estado para la emoción seleccionada
  const router = useRouter();

  // Lista de emociones
  const emotions = [
    { id: 'feliz', label: 'Feliz', icon: '😊' },
    { id: 'ansioso', label: 'Ansioso', icon: '😰' },
    { id: 'cansado', label: 'Cansado', icon: '😔' },
    { id: 'estresado', label: 'Estresado', icon: '😩' },
    { id: 'molesto', label: 'Molesto', icon: '😠' },
    { id: 'triste', label: 'Triste', icon: '😞' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo te sientes hoy?</Text>
      <View style={styles.taskContainer}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.taskButton,
              selectedEmotion === emotion.id && styles.selectedTaskButton,
            ]}
            onPress={() => setSelectedEmotion(emotion.id)}
          >
            <Text style={styles.taskIcon}>{emotion.icon}</Text>
            <Text style={styles.taskLabel}>{emotion.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.nextButton, { opacity: selectedEmotion ? 1 : 0.5 }]}
        onPress={() => {
          if (selectedEmotion) {
            // Navegación a P2 pasando el valor de la emoción seleccionada
            router.push({
              pathname: './dailyQuestionP2', // Ruta de la siguiente pantalla
              params: { emotion: selectedEmotion }, // Paso el parámetro 'emotion'
            });
          } else {
            console.log('No se seleccionó ninguna emoción');
          }
        }}
        disabled={!selectedEmotion} // Deshabilitar el botón si no hay emoción seleccionada
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
    marginBottom: 20,
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
