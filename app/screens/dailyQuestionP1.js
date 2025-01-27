import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

export default function dailyQuestionP1() {
  const [selectedEmotion, setSelectedEmotion] = useState(''); // Estado para la emoción seleccionada
  const [cigarettes, setCigarettes] = useState(''); // Estado para la cantidad de cigarros
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
      {/* Indicador de pasos */}
      <View style={styles.stepContainer}>
        {['01', '02', '03'].map((step, index) => (
          <View
            key={index}
            style={[styles.stepCircle, index === 0 && styles.activeStepCircle]} // Marca el paso activo
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

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

      <Text style={styles.inputLabel}>¿Cuántos cigarros has fumado hoy?</Text>
      <TextInput
        style={styles.input}
        placeholder="Cantidad de cigarros"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={cigarettes}
        onChangeText={setCigarettes}
      />

      <TouchableOpacity
        style={[styles.nextButton, { opacity: selectedEmotion && cigarettes ? 1 : 0.5 }]}
        onPress={() => {
          if (selectedEmotion && cigarettes) {
            router.push({
              pathname: './dailyQuestionP2', // Ruta de la siguiente pantalla
              params: { emotion: selectedEmotion, cigarettes },
            });
          }
        }}
        disabled={!selectedEmotion || !cigarettes}
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
  inputLabel: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF',
    color: '#333',
    marginBottom: 20,
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
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepCircle: {
    width: 30,
    height: 30,
    backgroundColor: '#33334D',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeStepCircle: {
    backgroundColor: '#4F59FF',
  },
  stepText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
