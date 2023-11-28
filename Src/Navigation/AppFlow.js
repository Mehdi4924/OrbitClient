import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Dashboard from '../Screens/Interface/Dashboard';
import AttendanceReport from '../Screens/Interface/AttendanceReport';
import LeaveHistory from '../Screens/Interface/LeaveHistory';
import LeaveApplication from '../Screens/Interface/LeaveApplication';
import {Icon} from '@rneui/base';
import {colors} from '../Utils/Colors';
import {hp, wp} from '../Utils/Responsive';
import {Platform, Pressable, StyleSheet, TouchableOpacity} from 'react-native';
import Performance from '../Screens/Interface/Performance';
import {navigate} from './RootNavigations';

const AppFlowNavigator = createBottomTabNavigator();
export function AppFlow() {
  return (
    <AppFlowNavigator.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarCustomStyles,
      }}>
      <AppFlowNavigator.Screen
        name="Dashboard"
        component={Dashboard}
        listeners={{
          tabPress: e => {
            e.preventDefault();
          },
        }}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused}) => {
            return (
              <Pressable
                onPress={() => navigate('AppFlow', {screen: 'Dashboard'})}
                onPressIn={() =>
                  Platform.OS == 'ios'
                    ? navigate('AppFlow', {screen: 'Dashboard'})
                    : null
                }>
                <Icon
                  name="view-dashboard"
                  type="material-community"
                  color={focused ? colors.primary : colors.grey}
                  size={25}
                />
              </Pressable>
            );
          },
        }}
      />
      <AppFlowNavigator.Screen
        name="AttendanceReport"
        component={AttendanceReport}
        listeners={{
          tabPress: e => {
            e.preventDefault();
          },
        }}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused}) => {
            return (
              <Pressable
                onPress={() =>
                  navigate('AppFlow', {screen: 'AttendanceReport'})
                }
                onPressIn={() =>
                  Platform.OS == 'ios'
                    ? navigate('AppFlow', {screen: 'AttendanceReport'})
                    : null
                }>
                <Icon
                  name="file-document-outline"
                  type="material-community"
                  color={focused ? colors.primary : colors.grey}
                  size={25}
                />
              </Pressable>
            );
          },
        }}
      />
      <AppFlowNavigator.Screen
        name="LeaveHistory"
        component={LeaveHistory}
        listeners={{
          tabPress: e => {
            e.preventDefault();
          },
        }}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused}) => {
            return (
              <Pressable
                onPress={() => navigate('AppFlow', {screen: 'LeaveHistory'})}
                onPressIn={() =>
                  Platform.OS == 'ios'
                    ? navigate('AppFlow', {screen: 'LeaveHistory'})
                    : null
                }>
                <Icon
                  name="history"
                  type="material-community"
                  color={focused ? colors.primary : colors.grey}
                  size={25}
                />
              </Pressable>
            );
          },
        }}
      />
      <AppFlowNavigator.Screen
        name="LeaveApplication"
        component={LeaveApplication}
        listeners={{
          tabPress: e => {
            e.preventDefault();
          },
        }}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused}) => {
            return (
              <Pressable
                onPress={() =>
                  navigate('AppFlow', {screen: 'LeaveApplication'})
                }
                onPressIn={() =>
                  Platform.OS == 'ios'
                    ? navigate('AppFlow', {screen: 'LeaveApplication'})
                    : null
                }>
                <Icon
                  name="application-edit-outline"
                  type="material-community"
                  color={focused ? colors.primary : colors.grey}
                  size={20}
                />
              </Pressable>
            );
          },
        }}
      />
      <AppFlowNavigator.Screen
        name="Performance"
        component={Performance}
        listeners={{
          tabPress: e => {
            e.preventDefault();
          },
        }}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused}) => {
            return (
              <Pressable
                onPress={() => navigate('AppFlow', {screen: 'Performance'})}
                onPressIn={() =>
                  Platform.OS == 'ios'
                    ? navigate('AppFlow', {screen: 'Performance'})
                    : null
                }>
                <Icon
                  name="speedometer"
                  type="material-community"
                  color={focused ? colors.primary : colors.grey}
                  size={23}
                />
              </Pressable>
            );
          },
        }}
      />
    </AppFlowNavigator.Navigator>
  );
}
const styles = StyleSheet.create({
  tabBarCustomStyles: {
    position: 'absolute',
    zIndex: 1000,
    backgroundColor: colors.white,
    zIndex: 1,
  },
});
