import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {colors} from '../Utils/Colors';
import {hp, wp} from '../Utils/Responsive';

export default function CustomTextInput(props) {
  return (
    <View style={props?.mainView}>
      {props?.leftIcon ? (
        <Icon
          name={props?.leftIconName || 'email-variant'}
          type={props?.leftIconType || 'material-community'}
          color={props?.leftIconColor || colors.primary}
        />
      ) : null}
      <TextInput
        value={props?.value}
        contextMenuHidden={props?.contextMenuHidden || false}
        placeholder={props?.placeholder}
        onChangeText={t => props.onChangeText(t)}
        style={[
          {paddingHorizontal: wp(2), height: hp(6)},
          props?.textInputStyles,
        ]}
        placeholderTextColor={props?.placeholderTextColor || colors.grey}
        secureTextEntry={props?.secureTextEntry || false}
        multiline={props?.multiline || false}
        numberOfLines={props?.numberOfLines || 1}
        keyboardType={props?.keyboardType || 'email-address'}
        onContentSizeChange={props?.onContentSizeChange}
        returnKeyType={'done'}
        textContentType={props.textContentType || null}
      />
      {props?.icon ? (
        <TouchableOpacity
          onPress={Platform.OS == 'android' ? props.onPress : null}
          onPressIn={Platform.OS == 'ios' ? props.onPress : null}>
          <Icon
            name={props?.iconName || 'lock-check'}
            type={props?.iconType || 'material-community'}
            color={props?.iconColor || colors.primary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'space-around'},
});
