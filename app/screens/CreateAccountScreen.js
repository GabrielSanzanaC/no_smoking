import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from "expo-router";
import { GuardarUsuario } from "../../components/GuardarUsuario"

export default function CreateAccountScreen () {
  const router = useRouter();
  const { userProfile } = useLocalSearchParams();
  const { user, email, password } = JSON.parse(userProfile);
  const [reason, setReason] = useState('');
  const [age, setAge] = useState('');
  const [yearsSmoking, setYearsSmoking] = useState('');
  const [cigarettesPerDay, setCigarettesPerDay] = useState('');
  const [cigarettesPerPack, setCigarettesPerPack] = useState('');
  const [packPrice, setPackPrice] = useState('');
  const [questionStep, setQuestionStep] = useState(1);
  const [yearlySavings, setYearlySavings] = useState(null);
  const [cigarettesPerYear, setCigarettesPerYear] = useState(null);

  const handleContinue = () => {
    if (questionStep === 1) {
      if (!reason) {
        Alert.alert('Por favor, elige una razón para dejar de fumar.');
        return;
      }
      setQuestionStep(2); // Pasar a la siguiente pregunta
    } else if (questionStep === 2) {
      if (!age || !yearsSmoking) {
        Alert.alert('Por favor, ingrese tanto su edad como los años fumando.');
        return;
      }
      if (isNaN(age) || isNaN(yearsSmoking)) {
        Alert.alert('Por favor, ingrese números válidos.');
        return;
      }
      if (parseInt(yearsSmoking) > parseInt(age)) {
        Alert.alert('Los años fumando no pueden ser mayores que su edad.');
        return;
      }
      setQuestionStep(3); // Pasar a la siguiente pregunta
    } else if (questionStep === 3) {
      if (!cigarettesPerDay || isNaN(cigarettesPerDay)) {
        Alert.alert('Por favor, ingrese un número válido de cigarrillos al día.');
        return;
      }
      setQuestionStep(4); // Pasar a la siguiente pregunta
    } else if (questionStep === 4) {
      if (!cigarettesPerPack || isNaN(cigarettesPerPack)) {
        Alert.alert('Por favor, ingrese un número válido de cigarrillos por cajetilla.');
        return;
      }
      setQuestionStep(5); // Pasar a la siguiente pregunta
    } else if (questionStep === 5) {
      if (!packPrice || isNaN(packPrice)) {
        Alert.alert('Por favor, ingrese un precio válido de la cajetilla.');
        return;
      }

      // Calcular el ahorro y los cigarrillos dejados de fumar
      const totalCigarettesPerYear = parseInt(cigarettesPerDay) * 365;
      const totalPacksPerYear = totalCigarettesPerYear / parseInt(cigarettesPerPack);
      const yearlySavingsAmount = totalPacksPerYear * parseFloat(packPrice);
      const totalCigarettesSaved = totalCigarettesPerYear;

      setYearlySavings(yearlySavingsAmount.toFixed(2)); // Guardamos el ahorro anual calculado
      setCigarettesPerYear(totalCigarettesSaved); // Guardamos la cantidad de cigarrillos ahorrados

      setQuestionStep(6); // Mostrar resumen del ahorro
    }
  };

  const handleFinish = async () => {
    try {
      await GuardarUsuario({ email, password, user });
      router.push('./ProfileScreen'); // Redirigir a la pantalla de perfil
    } catch (err) {
      // Manejar el error si algo falla en la función GuardarUsuario
      console.error('Error al guardar el usuario:', err);
      Alert.alert('Ocurrió un error al guardar los datos. Inténtalo nuevamente.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.overlay}>
          {questionStep === 1 && (
            <View style={styles.questionContainer}>
              <Text style={styles.title}>¿Por qué quieres dejar de fumar?</Text>
              <View style={styles.optionsContainer}>
                {['Mi salud', 'Mi familia', 'Mejorar mi condición física', 'Ahorrar dinero', 'Mejorar mi respiración', 'Aumentar mi energía'].map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionButton, reason === option && styles.selectedOption]}
                    onPress={() => setReason(option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {questionStep === 2 && (
            <View style={styles.questionContainer}>
              <Text style={styles.title}>¿Cuántos años tienes?</Text>
              <TextInput
                style={styles.input}
                placeholder="Edad"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
              <Text style={styles.title}>¿Cuántos años llevas fumando?</Text>
              <TextInput
                style={styles.input}
                placeholder="Años fumando"
                keyboardType="numeric"
                value={yearsSmoking}
                onChangeText={setYearsSmoking}
              />
            </View>
          )}

          {questionStep === 3 && (
            <View style={styles.questionContainer}>
              <Text style={styles.title}>¿Cuántos cigarrillos fumas al día?</Text>
              <TextInput
                style={styles.input}
                placeholder="Cigarrillos al día"
                keyboardType="numeric"
                value={cigarettesPerDay}
                onChangeText={setCigarettesPerDay}
              />
            </View>
          )}

          {questionStep === 4 && (
            <View style={styles.questionContainer}>
              <Text style={styles.title}>¿Cuántos cigarrillos tenía la cajetilla?</Text>
              <TextInput
                style={styles.input}
                placeholder="Cigarrillos por cajetilla"
                keyboardType="numeric"
                value={cigarettesPerPack}
                onChangeText={setCigarettesPerPack}
              />
            </View>
          )}

          {questionStep === 5 && (
            <View style={styles.questionContainer}>
              <Text style={styles.title}>¿Cuánto costaba la cajetilla?</Text>
              <TextInput
                style={styles.input}
                placeholder="Precio de la cajetilla ($)"
                keyboardType="numeric"
                value={packPrice}
                onChangeText={setPackPrice}
              />
            </View>
          )}

          {questionStep === 6 && (
            <View style={styles.resultContainer}>
              <Text style={styles.title}>¡Felicidades por dar el primer paso!</Text>
              <Text style={styles.resultText}>
                Si dejas de fumar, podrías ahorrar aproximadamente:
              </Text>
              <Text style={styles.resultAmount}>${yearlySavings} al año</Text>
              <Text style={styles.resultText}>¡Eso es un gran ahorro!</Text>
              <Text style={styles.resultText}>
                Además, dejarías de fumar aproximadamente {cigarettesPerYear} cigarrillos al año.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={questionStep === 6 ? handleFinish : handleContinue}>
            <Text style={styles.buttonText}>{questionStep === 6 ? 'Ir a Perfil' : 'Continuar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F2D',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F0F2D',
    borderRadius: 15,
    width: '100%',
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '80%',
  },
  button: {
    backgroundColor: '#1E90FF',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    width: '40%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#4A90E2',
  },
  optionText: {
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  resultAmount: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});