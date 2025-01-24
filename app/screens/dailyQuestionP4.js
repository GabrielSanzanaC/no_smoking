import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Importa useRouter
import { useLocalSearchParams } from 'expo-router'; // Importa useLocalSearchParams

export default function DailyQuestionP4() {
  const [selectedOption, setSelectedOption] = useState(null);
  const router = useRouter(); // Inicializa el router

  // Recibe los parámetros desde la página anterior usando useLocalSearchParams
  const { emotion, moodRating, location } = useLocalSearchParams();

  // Verifica si los parámetros están presentes
  if (!emotion || !moodRating || !location) {
    console.error("Faltan parámetros:", { emotion, moodRating, location });
  }

  // Opciones de actividad
  const options = [
    { label: 'Trabajando', emoji: '💼' },
    { label: 'Estudiando', emoji: '📚' },
    { label: 'Descansando', emoji: '😌' },
    { label: 'Otro', emoji: '❓' },
  ];

  // Manejar la selección de la actividad
  const handleOptionSelect = (option) => {
    setSelectedOption(option); // Asigna la opción seleccionada
    console.log({ emotion, moodRating, location, option });  // Muestra los parámetros recibidos
  };

  const handleGoogleContinue = () => {
    // Validación de selección y pasos previos
    if (!selectedOption) {
      console.error("No se ha seleccionado una opción de actividad");
      return;
    }
    // Pasar todos los parámetros a la siguiente página (dailyQuestionP5)
    router.push({
      pathname: './dailyQuestionP5',
      params: {
        emotion: emotion,
        moodRating: moodRating,
        location: location,
        activity: selectedOption,  // Asegúrate de pasar `selectedOption`
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Step Counter */}
      <View style={styles.stepContainer}>
        {['01', '02', '03', '04', '05'].map((step, index) => (
          <View
            key={index}
            style={[styles.stepCircle, index === 3 && styles.activeStepCircle]}
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Title */}
      <Text style={styles.title}>¿Qué estabas haciendo antes de fumar?</Text>

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
        style={[ 
          styles.nextButton, 
          { opacity: selectedOption ? 1 : 0.5 },
        ]}
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
    width: 200,
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
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F59FF',
  },
});
