import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {hp, wp} from '../Utils/Responsive';
import {colors} from '../Utils/Colors';

export default function ListEmptyComponent(props) {
  return (
    <View style={[styles.emptyContainer, props.emptyContainer]}>
      <Text style={[styles.noDataText, props.noDataText]}>
        {props?.text || 'No Data Found'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    width: '100%',
    // height: hp(70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.6),
  },
});
