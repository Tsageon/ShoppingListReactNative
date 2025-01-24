import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message'; 
import LoginScreen from './Screens/Login';
import RegisterScreen from './Screens/Register';
import ShoppingListScreen from './Screens/shoppingList';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Toast/>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: true,
            headerTitle: 'Login',
            headerLeft: () => (
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color="red"
                style={{ marginLeft: 10 }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown: true,
            headerTitle: 'Register',
            headerLeft: () => (
              <Ionicons
                name="person-add-outline"
                size={24}
                color="royalblue"
                style={{ marginLeft: 10 }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="ShoppingList"
          component={ShoppingListScreen}
          options={{
            headerShown: true,
            headerTitle: 'Shopping List',
            headerLeft: () => (
              <Ionicons
                name="basket-outline"
                size={24}
                color="green"
                style={{ marginLeft: 10 }}
              />
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
