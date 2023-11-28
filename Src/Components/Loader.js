import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Provider,
  MD2Colors,
  ActivityIndicator,
} from 'react-native-paper';
import {colors} from '../Utils/Colors';
import {hp, wp} from '../Utils/Responsive';

const Loader = props => {
  const {loading, ...attributes} = props;
  return (
    <Portal>
      <Modal visible={loading} contentContainerStyle={styles.modalBackground}>
        <ActivityIndicator
          animating={loading}
          size={hp(3.5)}
          color={colors.primary}
        />
        <Text style={{color: colors.black, fontSize: hp(2)}}>
          Please wait....
        </Text>
      </Modal>
    </Portal>
  );
};

export default Loader;
const styles = StyleSheet.create({
  modalBackground: {
    width: wp(70),
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: hp(2),
    borderRadius: 5,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  activityIndicatorWrapper: {
    borderRadius: 10,
    alignItems: 'center',
  },
  activityIndicator: {
    alignItems: 'center',
    height: 80,
  },
});
