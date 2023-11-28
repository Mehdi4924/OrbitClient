import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Formik} from 'formik';
import {useDispatch} from 'react-redux';
import {colors} from '../../Utils/Colors';
import {GetToken} from '../../../GetToken';
import {Provider} from 'react-native-paper';
import {hp, wp} from '../../Utils/Responsive';
import {AuthApi} from '../../Utils/Apis/ApiCalls';
import {setDashboardData} from '../../Redux/actions/Action';
import axios from 'axios';
import Images from '../../Utils/Images';
import Loader from '../../Components/Loader';
import Toast from 'react-native-simple-toast';
import CustomButton from '../../Components/CustomButton';
import CustomTextInput from '../../Components/CustomTextInputs';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FingerprintPopup from '../../Fingerprint/FingerprintPopup.component.ios';

export default function Login(props) {
  const dispatch = useDispatch();
  const [secureEntry, setSecureEntry] = useState(true);
  const [isloading, setisloading] = useState(false);
  const [popupShowed, setpopupShowed] = useState(false);
  const [asyncData, setLoginDataFromAsync] = useState();
  const [type, setType] = useState('');

  useEffect(() => {
    getDatafrom();
  }, []);
  const getDatafrom = async () => {
    FingerprintScanner.isSensorAvailable()
      .then(biometryType => {
        setType(biometryType), console.log(biometryType);
      })
      .catch(error => {
        setType(error.message), console.log(error?.message);
      });
    let a = await AsyncStorage.getItem('fingerprint');
    setLoginDataFromAsync(a);
    // console.log(a);
  };
  const Loginn = async values => {
    setisloading(true);
    const token = await GetToken();
    let body = {
      Email: values.Email,
      Password: values.Password,
      fcmToken: token,
    };
    console.log('sending body', body);
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    AuthApi.login(body)
      .then(result => {
        console.log('response loging in', result);
        if (result?.data?.message == 'Logged in successfully') {
          let data = {};
          AsyncStorage.setItem('login', JSON.stringify(body));
          AsyncStorage.setItem('AuthToken', result?.data?.token);
          axios.defaults.headers['Authorization'] =
            'Bearer ' + result?.data?.token;
          dispatch(setDashboardData(result?.data));
          props.navigation.replace('AppFlow');
        }
        Toast.show(result?.data?.message, Toast.LONG);
      })
      .catch(err => {
        console.log(
          'error loging in',
          // JSON.stringify(err, null, 2),
          err,
        );
        Toast.show(err?.message, Toast.SHORT);
      })
      .finally(function () {
        setisloading(false);
      });
  };
  function isEmailAddress(str) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(str);
  }
  const validateInputs = values => {
    const errors = {};
    if (!values.Email || values.Email == '') {
      errors.Email = 'Email Is Required';
    } else if (!isEmailAddress(values.Email)) {
      errors.Email = 'Invalid email address';
    } else if (!values.Password) {
      errors.Password = 'Password Is Required';
    }
    return errors;
  };

  return (
    <Provider>
      <View style={{flex: 1}}>
        <Loader loading={isloading} />
        <ImageBackground
          source={Images.backgroundImage}
          style={styles.mainContainerImage}
          imageStyle={{opacity: 0.3}}
          resizeMode="cover">
          <Image
            source={Images.logolight}
            style={{height: hp(18), marginBottom: hp(5)}}
            resizeMode="contain"
          />
        </ImageBackground>
        <View style={styles.subView}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always">
            <View style={{marginTop: hp(4)}}>
              <Text style={styles.welcomeText}>Hi, There Welcome Back!</Text>
              <Text style={styles.orbitText}>To, Orbit Client!</Text>
            </View>
            <Formik
              initialValues={{
                // team member
                // Email: 'sajid.aj@nkutechnologies.com',
                // Password: 'UiA7G8wu',
                // hr team lead
                // Email: 'asif.ijaz@nkutechnologies.com',
                // Password: 'y2o2XFVa',
                // team lead
                // Email: 'aliraza1@nkutechnologies.com',
                // Password: 'p4IgTQ2u',
                // Email: 'naeem.ahmed@nku.com',
                // Password: 'naeem.ahmad@nku123',
                Email: '',
                Password: '',
              }}
              enableReinitialize
              onSubmit={values => Loginn(values)}
              validate={validateInputs}>
              {({handleChange, handleBlur, handleSubmit, values, errors}) => {
                return (
                  <View style={{marginTop: hp(4)}}>
                    <CustomTextInput
                      mainView={styles.mainView}
                      textInputStyles={styles.textInputStyles}
                      value={values.Email}
                      onChangeText={handleChange('Email')}
                      placeholder="Email"
                      leftIcon={true}
                      leftIconName={'email-variant'}
                      textContentType={'username'}
                    />
                    {errors?.Email ? (
                      <Text style={{color: colors.red}}>{errors.Email}</Text>
                    ) : null}
                    <CustomTextInput
                      mainView={styles.mainView}
                      textInputStyles={[
                        styles.textInputStyles,
                        {width: wp(57)},
                      ]}
                      value={values.Password}
                      onChangeText={handleChange('Password')}
                      placeholder="Password"
                      leftIconName={'lock-check'}
                      iconName={'eye'}
                      contextMenuHidden={true}
                      leftIcon
                      keyboardType="default"
                      secureTextEntry={secureEntry}
                      icon
                      onPress={() => setSecureEntry(!secureEntry)}
                      textContentType={'password'}
                    />
                    {errors?.Password ? (
                      <Text style={{color: colors.red}}>{errors.Password}</Text>
                    ) : null}
                    <CustomButton
                      isLoading={isloading}
                      name={'Login'}
                      buttonStyles={{marginTop: hp(10)}}
                      onPress={() => {
                        if (
                          errors.Email ||
                          errors.Password ||
                          values.Email == '' ||
                          values.Password == ''
                        ) {
                          Toast.show(
                            errors.Email ||
                              errors.Password ||
                              'Please Enter Email And Password',
                            Toast.SHORT,
                          );
                        } else {
                          setisloading(true), handleSubmit();
                        }
                      }}
                    />
                  </View>
                );
              }}
            </Formik>
            {(asyncData == 'true' && type == 'Biometrics') ||
            type == 'Touch ID' ? (
              <View>
                <Text style={{color: colors.primary}}>
                  Use Fingerprint to login
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Platform.OS == 'android' ? setpopupShowed(true) : null
                  }
                  onPressIn={() =>
                    Platform.OS == 'ios' ? setpopupShowed(true) : null
                  }
                  hitSlop={{left: 10, top: 10, right: 10, bottom: 10}}
                  style={{alignItems: 'center', zIndex: 99999}}>
                  <Image
                    source={require('../../Assets/Images/fingerprint.png')}
                    style={{height: hp(7), width: hp(7), marginTop: hp(2)}}
                  />
                </TouchableOpacity>
              </View>
            ) : null}
            {popupShowed && (
              <FingerprintPopup
                navigation={props?.navigation}
                style={styles.popup}
                handlePopupDismissed={() => {
                  FingerprintScanner.release('from login page');
                  setpopupShowed(false);
                }}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  mainContainerImage: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    backgroundColor: colors.primaryLight,
  },
  popup: {
    width: wp(10),
  },
  subView: {
    flex: 1,
    paddingHorizontal: wp(5),
    backgroundColor: colors.white,
    marginTop: -hp(5),
    borderTopRightRadius: hp(5),
    borderTopLeftRadius: hp(5),
    alignItems: 'center',
  },
  welcomeText: {
    color: colors.primary,
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2.5),
  },
  orbitText: {
    color: colors.black,
    width: wp(80),
    fontFamily: 'Poppins-Regular',
    fontSize: hp(2),
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
