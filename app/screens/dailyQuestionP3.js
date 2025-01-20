import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router'; // Importa useRouter

export default function DailyQuestionP3({ navigation }) {
  const [hours, setHours] = React.useState(0);
  const [minutes, setMinutes] = React.useState(0);
  const router = useRouter(); // Inicializa el router

  const handleNext = () => {
    console.log(`Horas: ${hours}, Minutos: ${minutes}`)
    router.push("./ProfileScreen"); // Navega a la pantalla
    ;
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
      <Text style={styles.title}>¿Cuánto tiempo llevas sin fumar?</Text>

      {/* Time Display */}
      <Text style={styles.time}>{hours} horas y {minutes} minutos</Text>

      {/* Controls for Hours */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setHours(Math.max(0, hours - 1))}
        >
          <Text style={styles.controlButtonText}>- Hora</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setHours(hours + 1)}
        >
          <Text style={styles.controlButtonText}>+ Hora</Text>
        </TouchableOpacity>
      </View>

      {/* Controls for Minutes */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setMinutes(Math.max(0, minutes - 1))}
        >
          <Text style={styles.controlButtonText}>- Minuto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setMinutes(minutes + 1)}
        >
          <Text style={styles.controlButtonText}>+ Minuto</Text>
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Terminar</Text>
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
    marginBottom: 20,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeStepCircle: {
    backgroundColor: '#4F59FF',
  },
  stepText: {
    color: '#0F0F2D',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 30,
  },
  controls: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  controlButton: {
    width: 100,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F59FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  controlButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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

