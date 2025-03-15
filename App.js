import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MyDrawer from "./src/screens/MyDrawer";
import Navigation from './src/navigation/navigation';

function App() {
  return (
    <NavigationContainer>
      <Navigation />
    </NavigationContainer>
  );
}

export default App;
