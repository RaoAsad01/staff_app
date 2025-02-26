import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MyDrawer from "./src/screens/MyDrawer";

function App() {
  return (
    <NavigationContainer>
      <MyDrawer />
    </NavigationContainer>
  );
}

export default App;
