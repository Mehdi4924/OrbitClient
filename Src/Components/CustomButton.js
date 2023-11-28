import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import {colors} from '../Utils/Colors';
import {hp, wp} from '../Utils/Responsive';

export default function CustomButton(props) {
  return (
    <TouchableOpacity
      activeOpacity={0.4}
      style={[styles.buttonStyles, props.buttonStyles]}
      onPress={Platform.OS == 'android' ? props.onPress : null}
      onPressIn={Platform.OS == 'ios' ? props.onPress : null}
      hitSlop={{left: 20, top: 20, right: 20, bottom: 20}}
      disabled={props.disabled || props.isLoading}>
      {props.icon ? (
        <Image
          source={props.imageSource}
          style={{width: 20, height: 20, marginRight: wp(2)}}
        />
      ) : null}
      {props.isLoading ? (
        <ActivityIndicator size={'small'} color={colors.white} />
      ) : (
        <Text style={[styles.textStyles, props.textStyles]}>{props.name}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonStyles: {
    backgroundColor: colors.primary,
    width: wp(80),
    flexDirection: 'row',
    height: hp(7),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    marginVertical: hp(1),
    elevation: 5,
    zIndex: 99999,
  },
  textStyles: {
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(2),
  },
});
