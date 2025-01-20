import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { storeUserData } from '../utils/authStorage';
import Toast from 'react-native-toast-message';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    try {
      if (!name || !email || !password) {
        throw new Error('All fields are required.');
      }
  
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address.');
      }
  
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
  
      const user = { email, name };
      await storeUserData(user);
  
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Welcome to the Stationary Expensive app!',
        position: 'top',
      });
  
  
      navigation.replace('ShoppingList');
    } catch (err) {
      setError(err.message);
      Toast.show({
        message: 'Error',
        description: err.message,
        type: 'error',
      });
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>
      <Text style={styles.welcome}>Welcome to the List! Happy to have You!</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity  style={styles.button}  onPress={handleRegister} >
      <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    color:'gray',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcome:{
    fontWeight: 'bold',
    textAlign:'center',
    marginBottom:10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: 'royalblue',
    padding: 12,
    marginBottom: 5,
    borderRadius: 5,
    
},
buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
},

  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  link: {
    color: 'teal',
    marginTop: 10,
    textAlign: 'center',
    fontWeight:'bold'
  },
});

export default RegisterScreen;