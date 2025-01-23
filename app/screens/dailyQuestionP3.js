import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Importa useRouter

export default function dailyQuestionP3() {
  const [selectedOption, setSelectedOption] = useState(null);
  const router = useRouter(); // Inicializa el router

  const options = [
    { label: 'Casa', emoji: '🏠' },
    { label: 'Trabajo', emoji: '🏢' },
    { label: 'Auto', emoji: '🚗' },
    { label: 'Exterior', emoji: '🌳' },
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleGoogleContinue = () => {
    // Aquí puedes manejar la lógica de navegación o guardar la respuesta
    router.push("./dailyQuestionP4"); // Navega a la siguiente pantalla
  };

  return (
    <View style={styles.container}>
      {/* Step Counter */}
      <View style={styles.stepContainer}>
        {['01', '02', '03'].map((step, index) => (
          <View
            key={index}
            style={[styles.stepCircle, index === 2 && styles.activeStepCircle]}
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Title */}
      <Text style={styles.title}>¿Dónde fumaste?</Text>

      {/* Options */}
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

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleGoogleContinue}
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

