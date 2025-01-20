import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { View, TextInput,  Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storeUserData, getUserData } from '../utils/authStorage'; 

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [, setError] = useState('');
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const handleLogin = async () => {
    Toast.show({
      type: 'info',
      text1: 'Logging in...',
      text2: 'Please wait while we verify your credentials.',
      position: 'top',
    });

    if (!email || !password) {
      setError('Email and password are required.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email and password are required.',
        position: 'top',
      });
      return;}

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid email format.',
        position: 'top',
      });
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Password must be at least 6 characters long.',
        position: 'top',
      });
      return;
    }

    try {
      const user = await getUserData();

      if (user && user.email === email) {
        await storeUserData({ ...user, lastLogin: new Date().toISOString() });

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Redirecting to your shopping list...',
          position: 'top',
        });

        navigation.replace('ShoppingList');
      } else {
        setError('Invalid credentials.');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid credentials. Please try again.',
          position: 'top',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred. Please try again later.',
        position: 'top',
      });
    }
  };


  useEffect(() => {
    const checkAuthentication = async () => {
        const user = await getUserData();

        if (!user) {
            Alert.alert('That`s tough', 'Please log in again.');
            navigation.replace('login');
        }
    };

    checkAuthentication();
}, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>
      <Text style={styles.welcome}>Welcome Back To The App!</Text>
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
       <TouchableOpacity style={styles.button} onPress={handleLogin} >
       <Text style={styles.buttonText}>Login</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'whitesmoke',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color:'gray'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 7,
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
welcome:{
  fontWeight: 'bold',
  textAlign:'center',
  marginBottom:10
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
  },
});

export default LoginScreen;