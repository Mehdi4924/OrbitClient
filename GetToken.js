import React from 'react';
import messaging from '@react-native-firebase/messaging';

export async function GetToken() {
  let tok;
  const authorizationStatus = await messaging().requestPermission();
  if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    await messaging().registerDeviceForRemoteMessages();
    await messaging()
      .getToken()
      .then(res => {
        console.log('this is token ', res);
        tok = res;
      });
  } else if (
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
  ) {
    console.log('User has provisional notification permissions.');
  } else {
    console.log('User has notification permissions disabled');
  }

  return tok;
}
