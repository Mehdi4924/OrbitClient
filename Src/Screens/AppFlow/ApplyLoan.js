import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import CustomTextInput from '../../Components/CustomTextInputs';
import SimpleToast from 'react-native-simple-toast';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import {members, sendNotification} from '../../Utils/Apis/ApiCalls';
import {useSelector} from 'react-redux';
import Toast from 'react-native-simple-toast';
import {KeyboardAvoidingView} from 'react-native';
import Loader from '../../Components/Loader';
import {Provider} from 'react-native-paper';
import CustomDropdown from '../../Components/CustomDropdown';
import Header from '../../Components/Header';

export default function ApplyLoan(props) {
  const authUserData = useSelector(state => state.ConstantData.dashboardData);
  const hrdetails = authUserData.hrLeadDetails;
  const leadDetails = authUserData?.teamLeadDetails;
  const {fcmToken} = hrdetails;
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [installments, setInstallments] = useState('');
  const [loanTypes, setLoanTypes] = useState([]);
  const [selectedLoanType, setSelectedLoanType] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    getTypes();
  }, []);

  async function getTypes() {
    members
      .getLoanTypes()
      .then(res => {
        console.log('response getting loan types', res);
        setLoanTypes(res?.data?.data);
      })
      .catch(err => {
        console.log('error getting loan types', err);
      });
  }
  async function ApplyForLoan() {
    if (amount == '') {
      SimpleToast.show('Please Enter Amount First', SimpleToast.SHORT);
    } else if (desc == '') {
      SimpleToast.show('Please Enter Description First', SimpleToast.SHORT);
    } else if (installments == '') {
      SimpleToast.show(
        'Please Enter Number Of Installments First',
        SimpleToast.SHORT,
      );
    } else if (!selectedLoanType.id) {
      SimpleToast.show(
        'Please Select Loan Deduction Type First',
        SimpleToast.SHORT,
      );
    } else {
      const data = {
        EmployeeId: authUserData?.employeeDetails?.employeeId || 0,
        Amount: amount,
        Reason: desc,
        NumberOfInstallments: installments,
        DeductionTypeId: selectedLoanType.id,
      };
      setIsLoading(true);
      await members
        .applyForLoan(data)
        .then(res => {
          if (res?.data?.message) {
            Toast.show(res.data.message, Toast.SHORT);
          } else {
            Toast.show('Loan Applied Succesfully', Toast.SHORT);
            console.log('Success Applying for Loan', res);
            sendNotificationData();
            props.navigation.goBack();
          }
        })
        .catch(err => {
          console.log('Error Applying for Loan', err);
        })
        .finally(function () {
          setIsLoading(false);
        });
    }
  }
  const sendNotificationData = () => {
    // console.log(fcmToken,"fcm");
    // console.log(authUserData?.employeeDetails?.designation,"designa");
    // console.log(leadDetails?.fcmToken,"lead token");
    const dat = {
      registration_ids:
        authUserData?.employeeDetails?.designation == 'HR Lead'
          ? [`${leadDetails?.fcmToken}`]
          : [`${fcmToken}`],
      collapse_key: 'type_a',
      notification: {
        title: `New Loan Applied`,
        body: `${authUserData?.employeeDetails.employeeName} applied a new loan`,
        image: `${authUserData?.employeeDetails?.photo}`,
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
        <Loader loading={isLoading} />
        <Header
          title="Apply Loan"
          icon={true}
          onBackPress={() => props.navigation.goBack()}
        />
        <View style={styles.mainContainerImage}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={
                authUserData?.employeeDetails?.photo
                  ? {
                      uri: authUserData?.employeeDetails?.photo,
                    }
                  : Images.dummyUser
              }
              style={styles.userImage}
              resizeMode="contain"
            />
            <View style={{marginLeft: wp(5)}}>
              <Text style={styles.nameText}>
                {authUserData?.employeeDetails?.employeeName || ''}
              </Text>
              <Text style={styles.nameText}>
                {authUserData?.employeeDetails?.designation || ''}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <KeyboardAvoidingView
            behavior="padding"
            enabled
            keyboardVerticalOffset={10}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <View style={{marginBottom: hp(8)}}>
                <Text style={styles.reportText}>Request For Loan</Text>
                <Text style={styles.previousReportText}>Deduction Type</Text>
                <CustomDropdown
                  data={loanTypes}
                  labelField={'name'}
                  valueField={'id'}
                  placeholder={'Select Type'}
                  iconName={'city-variant-outline'}
                  iconType={'material-community'}
                  onChange={item => {
                    setSelectedLoanType(item);
                  }}
                  value={selectedLoanType}
                  container={{width: wp(90)}}
                />
                <Text style={styles.previousReportText}>Amount For Loan</Text>
                <CustomTextInput
                  mainView={styles.reasonView}
                  textInputStyles={styles.reasonTextInputStyles}
                  value={amount}
                  onChangeText={text => setAmount(text)}
                  placeholder="Total Amount"
                  keyboardType={'decimal-pad'}
                />
                <Text style={styles.previousReportText}>Reason For Loan</Text>
                <CustomTextInput
                  mainView={styles.mainView}
                  textInputStyles={styles.textInputStyles}
                  value={desc}
                  onChangeText={text => setDesc(text)}
                  placeholder="Reason"
                  multiline
                  keyboardType={'default'}
                />
                <Text style={styles.previousReportText}>
                  Number Of Installments
                </Text>
                <CustomTextInput
                  mainView={styles.reasonView}
                  textInputStyles={styles.reasonTextInputStyles}
                  value={installments}
                  onChangeText={text => setInstallments(text)}
                  placeholder="Installments"
                  keyboardType={'decimal-pad'}
                />
                <CustomButton
                  isLoading={isLoading}
                  name={'Apply'}
                  buttonStyles={styles.submitButton}
                  onPress={() => ApplyForLoan()}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary, zIndex: 1},
  mainContainerImage: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    backgroundColor: colors.primaryLight,
  },
  userImage: {
    height: hp(10),
    width: hp(10),
    marginVertical: hp(1),
    borderRadius: hp(2),
    backgroundColor: 'lightgrey',
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
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2.5),
    marginBottom: hp(2),
  },
  previousReportText: {
    color: colors.black,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(2),
  },
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(20),
    width: wp(90),
    marginVertical: hp(0.5),
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: hp(1),
  },
  textInputStyles: {
    height: hp(18),
    width: wp(88),
    fontSize: hp(1.8),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'top',
  },
  // reason text input
  reasonView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: wp(90),
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: hp(1),
  },
  reasonTextInputStyles: {
    width: wp(88),
    fontSize: hp(1.8),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
  },
  submitButton: {
    width: wp(80),
    height: hp(5),
    alignSelf: 'center',
  },
});
