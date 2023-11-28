import {Alert, Platform, StatusBar, View} from 'react-native';
import React, {useEffect} from 'react';
import Routes from './Src/Navigation/Routes';
import {hp} from './Src/Utils/Responsive';
import {colors} from './Src/Utils/Colors';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './Src/Redux/Store/index';
import {configureAxiosHeaders} from './Src/Utils/Apis/ApiCalls';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import {navigate, navigationRef} from './Src/Navigation/RootNavigations';
import crashlytics from '@react-native-firebase/crashlytics';
import TokenService from './Src/Utils/TokenService';

function StatusBarPlaceHolder() {
  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? hp('4.5%') : hp('0%');
  return (
    <View
      style={{
        width: '100%',
        height: STATUS_BAR_HEIGHT,
        backgroundColor: colors.primary,
      }}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
    </View>
  );
}
export default function App(props) {
  useEffect(() => {
    configureAxiosHeaders();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Notification handled in foreground', remoteMessage);
      onDisplayNotification(remoteMessage);
    });
    return unsubscribe;
  }, []);
  async function onDisplayNotification(remoteMessage) {
    let body = remoteMessage?.notification?.body || 'New Notification';
    let title =
      remoteMessage?.notification?.title ||
      'You Have A New Notification Recieved';
    let image =
      remoteMessage?.notification?.image ||
      'https://www.sundas.org/Images/logo.png';
    let data = remoteMessage?.data;
    await notifee.requestPermission();
    const channelId = await notifee.createChannel({
      id: 'incoming_task',
      name: 'Incoming Task',
      importance: AndroidImportance.HIGH,
    });
    await notifee.displayNotification({
      title: `${title}`,
      body: `${body}`,
      data: data,
      android: {
        largeIcon: `${image}`,
        channelId,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        pressAction: {
          launchActivity: 'default',
          id: 'default',
        },
      },
      ios: {},
    });
  }
  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification} = detail;
    console.log('background event occured');
    if (type === EventType.PRESS) {
      const loginScreenCheck =
        navigationRef?.current?.getState()?.routes[0]?.name == 'AuthStack';
      if (!loginScreenCheck) {
        const roleCheck =
          store?.getState()?.ConstantData?.dashboardData?.employeeDetails
            ?.roleName == 'HR Lead';
        if (!roleCheck) {
          navigate('ChatScreen', {
            data: {
              fcm: notification?.data?.fcmToken,
              id: parseInt(notification?.data?.aspNetUserId),
              name: notification?.data?.employeeName,
              photo: notification?.data?.photo,
            },
          });
        } else {
          navigate('ChatScreen', {
            data: {
              fcm: notification?.data?.fcmToken,
              id: parseInt(notification?.data?.aspNetUserId),
              name: notification?.data?.employeeName,
              photo: notification?.data?.photo,
            },
          });
        }
      }
    }
  });
  return (
    <Provider style={{flex: 1}} store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StatusBarPlaceHolder />
        <Routes />
      </PersistGate>
    </Provider>
  );
}
