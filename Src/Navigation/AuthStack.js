import Splash from '../Screens/Auth/Splash';
import Login from '../Screens/Auth/Login';
import { createStackNavigator } from '@react-navigation/stack';
import Application from '../Fingerprint/Application.container';
import BiometricPopup from '../Fingerprint/FingerprintPopup.component.android';
import FingerprintPopup from '../Fingerprint/FingerprintPopup.component.ios';
const AuthStackNavigator = createStackNavigator();
export function AuthStack() {

  return (
    <AuthStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNavigator.Screen name="Splash" component={Splash} />
      <AuthStackNavigator.Screen name="Login" component={Login} />
      <AuthStackNavigator.Screen name='Application' component={Application} />
      <AuthStackNavigator.Screen name="BiometricPopup" component={BiometricPopup} />
      <AuthStackNavigator.Screen name="FingerprintPopup" component={FingerprintPopup} />
    </AuthStackNavigator.Navigator>
    
  );
}
