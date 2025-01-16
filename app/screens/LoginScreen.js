import { View, Text, TextInput, Button, StyleSheet } from 'react-native'
import React, { useState } from 'react'


const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User logged in successfully')
        // Aquí puedes redirigir a otra pantalla después de iniciar sesión
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login Screen v7</Text>
      
      {/* Campo de correo electrónico */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      
      {/* Campo de contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      {/* Botón de inicio de sesión */}
      <Button title="Iniciar sesión" onPress={handleLogin} />
      
      {/* Mensaje de error */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 100,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
})


export default LoginScreen