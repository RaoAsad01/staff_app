import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from './dashboard/DashboardScreen';
import Navigation from '../navigation/navigation';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { color } from '../color/color';
import SvgIcons from '../../components/SvgIcons';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const navigation = useNavigation();

  const imageUrl = require('../../assets/images/Avatar.png');

  const gotologinscreen = () => {
    navigation.navigate("Login")
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={imageUrl}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>Anthony Dinozo</Text>
          <Text style={styles.userEmail}>anthony@hexallo.com</Text>

          <TouchableOpacity style={styles.closeButton} onPress={() => props.navigation.closeDrawer()}>
            <Ionicons name="close" size={30} color="#3C200A" />
          </TouchableOpacity>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <DrawerItem
          label="Log Out"
          onPress={gotologinscreen}
          icon={() => <SvgIcons.logoutMenuIcon width={24} height={24} />}
          labelStyle={{ color: color.btnBrown_AE6F28, fontSize: 16, fontWeight: '500' }}
          style={styles.logoutButton}
        />

      </View>
    </View>
  );
}

function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: 'transparent',
        drawerActiveTintColor: color.black_544B45,
        drawerInactiveTintColor: color.black_544B45,
        drawerType: "front",
        drawerStyle:{
          borderRadius: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius:0,
          borderBottomLeftRadius: 0
        }
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Navigation}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          drawerLabel: "Home",
        }}
        listeners={({ navigation }) => ({
          drawerItemPress: (event) => {
            event.preventDefault();

            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Home", params: { screenName: "LoggedIn" } }], // ✅ Pass screenName as a param
              })
            );
          },
        })}

      />

      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <SvgIcons.dashboardMenuIcon width={20} height={20} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Profile"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <SvgIcons.profileMenuIcon width={20} height={20} color={color} />
          ),
        }}
      />

    </Drawer.Navigator>
  );
}

export default MyDrawer;

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#AE6F28',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 15,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 40,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: color.brown_3C200A
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
    color: color.brown_766F6A,
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  logoutButton: {
    marginLeft: 10,
  },
});
