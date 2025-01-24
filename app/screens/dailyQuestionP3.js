import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useLocalSearchParams } from 'expo-router';

export default function DailyQuestionP3() {
  const [selectedOption, setSelectedOption] = useState(null);
  const router = useRouter(); 

  // Extraemos los parámetros pasados desde P2
  const { emotion, moodRating } = useLocalSearchParams(); 

  const options = [
    { label: 'Casa', emoji: '🏠' },
    { label: 'Trabajo', emoji: '🏢' },
    { label: 'Auto', emoji: '🚗' },
    { label: 'Exterior', emoji: '🌳' },
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option); // Actualizamos la opción seleccionada
  };

  const handleNext = () => {
    // Asegúrate de pasar los parámetros correctamente a la siguiente pantalla (P4)
    router.push({
      pathname: './dailyQuestionP4',
      params: { 
        emotion, // Pasamos la emoción seleccionada
        moodRating, // Pasamos la calificación de estado de ánimo
        location: selectedOption // Pasamos el lugar seleccionado
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Indicador de pasos */}
      <View style={styles.stepContainer}>
        {['01', '02', '03', '04', '05'].map((step, index) => (
          <View
            key={index}
            style={[styles.stepCircle, index === 2 && styles.activeStepCircle]} 
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Título */}
      <Text style={styles.title}>¿Dónde fumaste?</Text>

      {/* Opciones */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[ 
              styles.optionButton,
              selectedOption === option.label && styles.selectedOptionButton,
            ]}
            onPress={() => handleOptionSelect(option.label)}
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
          { opacity: selectedOption ? 1 : 0.5 },
        ]}
        onPress={handleNext}
        disabled={!selectedOption} // Deshabilita el botón si no hay opción seleccionada
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
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
    opacity: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F59FF',
  },
});
