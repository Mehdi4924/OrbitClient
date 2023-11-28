import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {Icon} from '@rneui/base';
import {colors} from '../Utils/Colors';
import {hp, wp} from '../Utils/Responsive';

const Header = props => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.primary,
        paddingHorizontal: wp(2),
        paddingVertical: hp(2),
      }}>
      {props?.icon && (
        <TouchableOpacity
          onPress={Platform.OS == 'android' ? props.onBackPress : null}
          onPressIn={Platform.OS == 'ios' ? props.onBackPress : null}
          hitSlop={{left: 0, top: 0, right: 10, bottom: 0}}
          style={{
            zIndex: 99999,
            width: '8%',
            height: '100%',
          }}>
          <Icon
            name={props?.iconName ? props?.iconName : 'arrowleft'}
            type="antdesign"
            color={colors.white}
            style={{paddingLeft: wp(2)}}
            size={hp(3)}
          />
        </TouchableOpacity>
      )}
      <Text
        style={{
          color: colors.white,
          fontSize: hp(2.7),
          paddingLeft: props.icon ? null : wp(4),
        }}>
        {props.title}
      </Text>
      <Pressable onPress={props.rightPress}>
        <Icon
          name={props?.iconNameRight ? props?.iconNameRight : null}
          type="antdesign"
          color={colors.white}
          style={{paddingRight: wp(2)}}
          size={hp(3)}
        />
      </Pressable>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
