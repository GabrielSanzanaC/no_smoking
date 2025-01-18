import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function CigaretteTrackerScreen() {
  const [count, setCount] = React.useState(8);


  return (
    <View style={styles.container}>
      {/* Step Counter */}
      <View style={styles.stepContainer}>
        {['01', '02', '03'].map((step, index) => (
          <View
            key={index}
            style={[
              styles.stepCircle,
              index === 1 && styles.activeStepCircle,
            ]}
          >
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Title */}
      <Text style={styles.title}>How many cigarettes did you smoke yesterday?</Text>

      {/* Cigarette Display */}
      <View style={styles.cigaretteContainer}>
        <View style={styles.cigarette} />
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
      <TouchableOpacity style={styles.nextButton} >
        <Text style={styles.nextButtonText}>Next</Text>
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
  cigarette: {
    width: 10,
    height: 100,
    backgroundColor: '#F5B95B',
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 10,
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
