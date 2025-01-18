import React from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Importa useRouter

export default function CreateAccountScreen() {
  const router = useRouter(); // Inicializa el router

  const handleGoogleContinue = () => {
    router.push('./ProfileScreen'); // Navega a la pantalla CreateAccountScreen
  };

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Create an account</Text>

        <TouchableOpacity style={[styles.button, styles.emailButton]}>
          <FontAwesome name="envelope" size={20} color="#fff" />
          <Text style={styles.buttonText}>Continue with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <FontAwesome name="facebook" size={20} color="#1877F2" />
          <Text style={styles.buttonText}>Continue with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <AntDesign name="apple1" size={20} color="#000" />
          <Text style={styles.buttonText}>Continue with Apple</Text>
        </TouchableOpacity>

        {/* Modificamos el botón Google para incluir la navegación */}
        <TouchableOpacity style={styles.button} onPress={handleGoogleContinue}>
          <AntDesign name="google" size={20} color="#DB4437" />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing, you agree to Privacy Policy and Terms & Conditions
        </Text>

        <TouchableOpacity>
          <Text style={styles.login}>
            Have an account? <Text style={styles.loginLink}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fondo negro, igual al índice
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Añadimos opacidad al fondo para que el texto se vea bien
    borderRadius: 15,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emailButton: {
    backgroundColor: '#4A4AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginLeft: 10,
  },
  terms: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  login: {
    fontSize: 14,
    color: '#fff',
    marginTop: 20,
  },
  loginLink: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
});
