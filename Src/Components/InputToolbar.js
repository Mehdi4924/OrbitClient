import React from 'react';
import { Image } from 'react-native';
import {  Send } from 'react-native-gifted-chat';

export const renderSend = (props) => (
  <Send
    {...props}
    disabled={!props.text}
    containerStyle={{
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 20,
    }}
  >
    <Image
      style={{ width: 30, height: 30 }}
      source={require('../Assets/Images/send.png')}
    />
  </Send>
);
