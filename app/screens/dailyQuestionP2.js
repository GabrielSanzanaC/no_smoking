import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function DailyQuestionP2() {
  const [moodRating, setMoodRating] = useState(3); // Estado inicial en el medio de la escala
  const router = useRouter(); // Inicializa el router

  // Recibe los parámetros desde la página anterior
  const { emotion } = useLocalSearchParams(); // Extrae el parámetro 'emotion'

  const handleNext = () => {
    router.push({
      pathname: './dailyQuestionP3',
      params: { 
        emotion: emotion,  // Pasa la emoción seleccionada
        moodRating: moodRating, // Pasa la calificación de estado de ánimo
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
            style={[styles.stepCircle, index === 1 && styles.activeStepCircle]} // Marca el paso activo
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Título */}
      <Text style={styles.title}>
        ¿Cuánto crees que el cigarro ayudó a tu estado de ánimo?
      </Text>
      <Text style={styles.subtitle}>
        (Escala del 1 al 5: 1 = Nada, 5 = Mucho)
      </Text>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={moodRating}
          onValueChange={setMoodRating} // Actualiza el estado con el valor seleccionado
          minimumTrackTintColor="#4F59FF"
          maximumTrackTintColor="#33334D"
          thumbTintColor="#4F59FF"
        />
        <View style={styles.sliderLabels}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Text key={value} style={styles.sliderLabel}>
              {value}
            </Text>
          ))}
        </View>
        <Text style={styles.moodRatingText}>Tu calificación: {moodRating}</Text>
      </View>

      {/* Botón de siguiente */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
  moodRatingText: {
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
