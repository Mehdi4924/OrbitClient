import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStack} from './AuthStack';
import {AppFlow} from './AppFlow';
import SalarySlip from '../Screens/AppFlow/SalarySlip';
import TeamReport from '../Screens/AppFlow/TeamReport';
import ApplyLoan from '../Screens/AppFlow/ApplyLoan';

import LoanStats from '../Screens/AppFlow/LoanStats';
import ChatScreen from '../Screens/AppFlow/ChatScreen';
import Messages from '../Screens/AppFlow/Messages';
import TeamMemberLeaveHistory from '../Screens/AppFlow/TeamMemberLeaveHistory';
import MemberPerfomanceForm from '../Screens/AppFlow/MemberPerformenceForm';
import {createStackNavigator} from '@react-navigation/stack';
import AddPerformance from '../Screens/AppFlow/AddPerformance';
import Evaluation from '../Screens/AppFlow/Evaluation';
import MemberAttendance from '../Screens/AppFlow/MemberAttendance';
import {navigationRef} from './RootNavigations';
import Setting from '../Screens/AppFlow/Setting';
import LeaveRequests from '../Screens/AppFlow/LeaveRequests';
import {enableScreens} from 'react-native-screens';
import Notifications from '../Screens/AppFlow/Notifications';
enableScreens(true);
const Stack = createStackNavigator();
export default function Routes() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="AppFlow" component={AppFlow} />
        <Stack.Screen name="SalarySlip" component={SalarySlip} />
        <Stack.Screen name="TeamReport" component={TeamReport} />
        <Stack.Screen name="LoanStats" component={LoanStats} />
        <Stack.Screen name="ApplyLoan" component={ApplyLoanss} />
        <Stack.Screen name="MemberAttendance" component={MemberAttendance} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="Messages" component={Messages} />
        <Stack.Screen name="Setting" component={SettingStack} />
        <Stack.Screen
          name="TeamMemberLeaveHistory"
          component={TeamMemberLeaveHistory}
        />
        <Stack.Screen
          name="MemberPerfomanceForm"
          component={MemberPerfomanceForm}
        />
        <Stack.Screen name="AddPerformance" component={AddPerformance} />
        <Stack.Screen name="Evaluation" component={Evaluation} />
        <Stack.Screen name="LeaveRequests" component={LeaveRequests} />
        <Stack.Screen name="Notifications" component={Notifications} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const SettingStackNavigator = createStackNavigator();
export function SettingStack() {
  return (
    <SettingStackNavigator.Navigator screenOptions={{headerShown: false}}>
      <SettingStackNavigator.Screen name="Setting" component={Setting} />
    </SettingStackNavigator.Navigator>
  );
}

const ApplyLoanStack = createStackNavigator();
export function ApplyLoanss() {
  return (
    <ApplyLoanStack.Navigator screenOptions={{headerShown: false}}>
      <ApplyLoanStack.Screen name="ApplyLoans" component={ApplyLoan} />
    </ApplyLoanStack.Navigator>
  );
}
