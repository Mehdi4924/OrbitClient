import React, { useEffect } from 'react';
import { Image, ImageBackground, StyleSheet, Easing, Text, View, Animated } from 'react-native';
import { colors } from '../../Utils/Colors';
import { hp, wp } from '../../Utils/Responsive';
import Images from '../../Utils/Images';
// import LottieView from 'lottie-react-native';

export default function Splash(props) {
  useEffect(() => {
    setTimeout(() => {
      props.navigation.replace('Login');
    }, 2000);
  }, []);

  let spinValue = new Animated.Value(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true
    }).start()
 
  return (
    <View style={{ flex: 1, backgroundColor: colors.white,justifyContent:'center' }}>

      {/* <LottieView
        source={require('../../Components/lottie/background.json')}
        autoPlay
        loop
        style={{ height: hp(100) }}
      /> */}
      {/* <Image
        source={Images.logo}
        style={{ height: hp(10), position: 'absolute', alignSelf: 'center', marginTop: hp(40) }}
        resizeMode="contain"
      />  */}
      <Animated.Image
        // source={Images.newlogo}
        source={Images.orbitImages}
        style={{
          height: hp(30),  alignSelf: 'center', transform: [
            {
              translateX: spinValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-600, 0]
              })
            }
          ],
        }}
        resizeMode="contain"
      />
      {/* <LottieView
        source={require('../../Components/lottie/Comp.json')}
        autoPlay
        style={{marginTop:'14%'}}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  mainImageBackground: {
    height: hp(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  contentMainView: {
    height: hp(65),
    width: wp(100),
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.white,
    borderTopRightRadius: hp(5),
    borderTopLeftRadius: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(7),
    width: wp(80),
    marginVertical: hp(0.5),
    borderBottomWidth: 1,
  },
  textInputStyles: {
    width: wp(68),
    fontSize: hp(1.8),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
  },
});
