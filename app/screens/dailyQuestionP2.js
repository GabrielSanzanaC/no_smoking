import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function DailyQuestionCombined() {
  const [selectedOptionP3, setSelectedOptionP3] = useState(null); // Opción de ubicación
  const [selectedOptionP4, setSelectedOptionP4] = useState(null); // Opción de actividad
  const router = useRouter();
  const { emotion, cigarettes } = useLocalSearchParams(); // Recibimos parámetros de pantallas previas

  const locations = [
    { label: 'Casa', emoji: '🏠' },
    { label: 'Trabajo', emoji: '🏢' },
    { label: 'Auto', emoji: '🚗' },
    { label: 'Exterior', emoji: '🌳' },
  ];

  const activities = [
    { label: 'Trabajando', emoji: '💼' },
    { label: 'Estudiando', emoji: '📚' },
    { label: 'Descansando', emoji: '😌' },
    { label: 'Otro', emoji: '❓' },
  ];

  const handleNext = () => {
    if (selectedOptionP3 && selectedOptionP4) {
      router.push({
        pathname: './dailyQuestionP3',
        params: {
          emotion,
          cigarettes,
          location: selectedOptionP3,
          activity: selectedOptionP4,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Indicador de pasos */}
      <View style={styles.stepContainer}>
        {['01', '02', '03'].map((step, index) => (
          <View
            key={index}
            style={[styles.stepCircle, index === 1 && styles.activeStepCircle]} // Marca el paso activo
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Título */}
      <Text style={styles.title}>Cuéntanos más sobre tu experiencia:</Text>

      {/* Pregunta: ¿Dónde fumaste? */}
      <Text style={styles.subtitle}>¿Dónde fumaste?</Text>
      <View style={styles.optionsContainer}>
        {locations.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOptionP3 === option.label && styles.selectedOptionButton,
            ]}
            onPress={() => setSelectedOptionP3(option.label)}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pregunta: ¿Qué estabas haciendo antes de fumar? */}
      <Text style={styles.subtitle}>¿Qué estabas haciendo antes de fumar?</Text>
      <View style={styles.optionsContainer}>
        {activities.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOptionP4 === option.label && styles.selectedOptionButton,
            ]}
            onPress={() => setSelectedOptionP4(option.label)}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón de siguiente */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          {
            opacity: selectedOptionP3 && selectedOptionP4 ? 1 : 0.5,
          },
        ]}
        onPress={handleNext}
        disabled={!selectedOptionP3 || !selectedOptionP4}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#33334D',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedOptionButton: {
    backgroundColor: '#4F59FF',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
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
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#33334D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeStepCircle: {
    backgroundColor: '#4F59FF',
  },
  stepText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
