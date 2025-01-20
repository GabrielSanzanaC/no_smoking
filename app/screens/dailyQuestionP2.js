import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Importa useRouter


export default function CigaretteTrackerScreen() {
  const [count, setCount] = React.useState(0);
  const router = useRouter(); // Inicializa el router
  
  const handleGoogleContinue = () => {
    router.push("./dailyQuestionP3"); // Navega a la pantalla
  };

  return (
    <View style={styles.container}>
      {/* Step Counter */}
      <View style={styles.stepContainer}>
        {['01', '02', '03'].map((step, index) => (
          <View
            key={index}
            style={[styles.stepCircle, index === 1 && styles.activeStepCircle]}
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Title */}
      <Text style={styles.title}>¿Cuantos cigarros fumaste hoy?</Text>

      {/* Cigarette Display */}
      <View style={styles.cigaretteContainer}>
        {/* Rectángulo vacío con ScrollView horizontal */}
        <View style={styles.rectangle}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.cigaretteRow}
            showsHorizontalScrollIndicator={true} // Muestra la barra de desplazamiento
          >
            {Array.from({ length: count }).map((_, index) => (
              <Image
                key={index}
                source={require('../../assets/images/cigarro.png')}
                style={styles.cigarette}
              />
            ))}
          </ScrollView>
        </View>

        <Text style={styles.count}>{count.toString().padStart(2, '0')}</Text>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setCount(Math.max(0, count - 1))}
          >
            <AntDesign name="minus" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setCount(count + 1)}
          >
            <AntDesign name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleGoogleContinue}>
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
  cigaretteContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  rectangle: {
    width: 300, // Ancho fijo del rectángulo
    height: 120, // Altura fija del rectángulo
    borderWidth: 1,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden', // Evita que se vea fuera del rectángulo
  },
  cigaretteRow: {
    flexDirection: 'row',
    paddingVertical: 20, // Espacio vertical dentro del ScrollView
  },
  cigarette: {
    width: 10, // Ajusta el tamaño de la imagen según sea necesario
    height: 80,
    marginHorizontal: 5, // Espacio entre los cigarros
  },
  count: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F59FF',
    justifyContent: 'center',
    alignItems: 'center',
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
