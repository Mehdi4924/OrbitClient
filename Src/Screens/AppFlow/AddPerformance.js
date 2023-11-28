import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import Loader from '../../Components/Loader';
import CustomTextInput from '../../Components/CustomTextInputs';
import Header from '../../Components/Header';
import {Provider} from 'react-native-paper';
import {members, sendNotification} from '../../Utils/Apis/ApiCalls';
import {Image} from 'react-native';
import Toast from 'react-native-simple-toast';

export default function AddPerformance(props) {
  let propsData = props?.route?.params?.data;
  const [problemStatement, setProblemStatement] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [severity, setSeverity] = useState('');
  const [isloading, setisloading] = useState(false);

  const addPerfermanceData = async () => {
    if (problemStatement == '' || suggestion == '' || severity == '') {
      Toast.show('Please Enter All Information First', Toast.SHORT);
    } else {
      const data = {
        employeeID: propsData?.employeeId || 0,
        problem: problemStatement,
        suggestion: suggestion,
        severity: severity,
      };
      setisloading(true);
      await members
        .createMemberPerformance(data)
        .then(res => {
          sendNotificationData();
          console.log('Success Posting Member Performance', res);
          Toast.show('Evaluation added', Toast.SHORT);
          props.navigation.goBack();
        })
        .catch(err => {
          Toast.show(err?.message);
          console.log('Error Posting Member Performance', err);
        })
        .finally(function () {
          setisloading(false);
        });
    }
  };
  const sendNotificationData = () => {
    const dat = {
      registration_ids: [`${propsData?.fcmToken}`],
      collapse_key: 'type_a',
      notification: {
        title: `Performance Rated`,
        body: `Your team leam rated your performance`,
      },
      contentAvailable: true,
      priority: 'high',
    };
    sendNotification
      .sendNotificationToAll(dat)
      .then(res => {
        console.log('success sending notification', res);
      })
      .catch(err => {
        console.log('error sending notification', err);
      })
      .finally(function () {});
  };
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Loader loading={isloading} />
        <Header
          title="Performence Form"
          icon={true}
          onBackPress={() => props.navigation.goBack()}
        />
        <View style={styles.mainContainerImage}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={
                propsData?.profilePic
                  ? {uri: propsData.profilePic}
                  : Images.dummyUser
              }
              style={styles.userImage}
            />
            <View style={{marginLeft: wp(5)}}>
              <Text style={styles.nameText}>{propsData?.teamMemberName}</Text>
              <Text style={styles.nameText}>{propsData?.designation}</Text>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{marginBottom: hp(8)}}>
              <Text style={styles.reportText}>Member Perfromance</Text>
              <CustomTextInput
                mainView={styles.mainView}
                textInputStyles={styles.textInputStyles}
                value={problemStatement}
                onChangeText={text => setProblemStatement(text)}
                placeholder="Problem Statement*"
              />
              <CustomTextInput
                mainView={styles.mainView}
                textInputStyles={[
                  styles.textInputStyles,
                  {height: hp(20), textAlignVertical: 'top'},
                ]}
                value={suggestion}
                onChangeText={text => setSuggestion(text)}
                placeholder="Suggestion For Improvement"
                multiline
              />
              <View>
                <Text
                  style={{color: colors.primary, fontFamily: 'Poppins-Bold'}}>
                  Problem Severity*
                </Text>
                <View style={styles.btnView}>
                  {['Low', 'Medium', 'High', 'Severe'].map((item, index) => {
                    return (
                      <TouchableOpacity
                        style={{flexDirection: 'row', alignItems: 'center'}}
                        onPress={() => setSeverity(item)}
                        key={index}>
                        <Icon
                          name={
                            severity == item
                              ? 'radiobox-marked'
                              : 'radiobox-blank'
                          }
                          type="material-community"
                          size={hp(2)}
                          style={{marginRight: wp(2)}}
                          color={colors.primary}
                        />
                        <Text key={item} style={styles.severityText}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <CustomButton
                  isLoading={false}
                  name={'Add'}
                  buttonStyles={styles.submitButton}
                  onPress={() => addPerfermanceData()}
                  // onPress={() => props.navigation.replace('AppFlow')}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary, zIndex: 1},
  mainContainerImage: {
    // height: hp(40),
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    backgroundColor: colors.primaryLight,
  },
  userImage: {
    height: hp(10),
    width: hp(10),
    marginVertical: hp(1),
    borderRadius: hp(2),
    backgroundColor: colors.grey,
  },
  nameText: {
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(2),
  },
  profileText: {
    color: colors.white,
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(3),
  },
  subView: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    backgroundColor: colors.white,
    borderTopRightRadius: hp(5),
    borderTopLeftRadius: hp(5),
  },
  reportText: {
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2.5),
  },
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: wp(90),
    marginVertical: hp(0.7),
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: hp(1),
  },
  textInputStyles: {
    width: wp(88),
    fontSize: hp(1.8),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
  },
  btnView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hp(1),
  },
  severityText: {
    color: colors.black,
    fontFamily: 'Poppins-Regular',
  },
  submitButton: {
    width: wp(80),
    height: hp(5),
    alignSelf: 'center',
  },
});
