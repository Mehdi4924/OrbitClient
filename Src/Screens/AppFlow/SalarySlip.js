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
import Toast from 'react-native-simple-toast';
import {Provider} from 'react-native-paper';
import Loader from '../../Components/Loader';
import {PayRoll} from '../../Utils/Apis/ApiCalls';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import {useSelector} from 'react-redux';
import DatePicker from '../../Components/DatePicker';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import Header from '../../Components/Header';
let total = 0;
export default function SalarySlip(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [screenData, setScreenData] = useState([]);
  const userData = useSelector(state => state.ConstantData.dashboardData);
  const {
    employeeDetails: {employeeId},
    employeeDetails: {employeeName},
    employeeDetails: {designation},
  } = userData;
  const photo = userData?.employeeDetails?.photo;
  useEffect(() => {
    getPayRollData(new Date().toISOString().split('T')[0]);
  }, []);

  async function getPayRollData(date) {
    const finalDate = date.split('-');
    setIsLoading(true);
    await PayRoll.getPayRoll(employeeId, finalDate[1], finalDate[0])
      .then(res => {
        console.log('response getting response of payroll', res);
        if (
          res?.data?.data ==
          "Salary slip against this month hasn't been generated yet by hr"
        ) {
          Toast.show(
            "Salary slip against this month hasn't been generated yet by HR",
            Toast.SHORT,
          );
          setScreenData([]);
        } else {
          // setScreenData(res.data.data);
          const dataFetched = res.data.data;
          if (dataFetched.length > 0) {
            total = dataFetched[0].netpayablesalary;
            const objectKeys = Object.keys(dataFetched[0]);
            const objectValues = Object.values(dataFetched[0]);
            const finalDataArr = [];
            objectKeys.map((item, index) => {
              const obj = {};
              switch (item) {
                case 'bonus':
                  obj['Bonus'] = objectValues[index];
                case 'calculatedSalary':
                  obj['Calculated Salary'] = objectValues[index];
                  break;
                case 'deduction':
                  obj['Deduction'] = objectValues[index];
                  break;
                case 'employeeMonyhlyDeduction':
                  obj['Employee Monthly Deduction'] = objectValues[index];
                  break;
                case 'eobiDeduction':
                  obj['EOBI Deduction'] = objectValues[index];
                  break;
                case 'eobiDeductionEmployer':
                  obj['EOBI Deduction Employer'] = objectValues[index];
                  break;
                case 'fuelAllowance':
                  obj['Feul Allowance'] = objectValues[index];
                  break;
                case 'generalAllowance':
                  obj['General Allowance'] = objectValues[index];
                  break;
                case 'houseRentAllowance':
                  obj['House Rent Allowance'] = objectValues[index];
                  break;
                case 'insuranceDeduction':
                  obj['Insurance Allowance'] = objectValues[index];
                  break;
                case 'insuranceDeductionEmployer':
                  obj['Insurance Deduction Employer'] = objectValues[index];
                  break;
                case 'loanAdvanceDeduction':
                  obj['Loan Advance Deduction'] = objectValues[index];
                  break;
                case 'miseeAdvanceDedution':
                  obj['Missed Advance Deduction'] = objectValues[index];
                  break;
                case 'mobileAllowance':
                  obj['Mobile Allowance'] = objectValues[index];
                  break;
                case 'netPayable':
                  obj['Net Payable'] = objectValues[index];
                  break;
                case 'overTime':
                  obj['Over Time'] = objectValues[index];
                  break;
                case 'paidDays':
                  obj['Paid Days'] = objectValues[index];
                  break;
                case 'payrollSalary':
                  obj['Pay Roll Salary'] = objectValues[index];
                  break;
                case 'taxDeduction':
                  obj['Tax Deduction'] = objectValues[index];
                  break;
                case 'teaAllowance':
                  obj['Tea Allowance'] = objectValues[index];
                  break;
                case 'totalAllowance':
                  obj['Total Allowance'] = objectValues[index];
                  break;
                case 'totalDeductionAfterDeductSlabTax':
                  obj['Total Deduction After Slab Tax'] = objectValues[index];
                  break;
                case 'totalHours':
                  obj['Total Hours'] = objectValues[index];
                  break;
                case 'travlingAllowance':
                  obj['Travelling Allowance'] = objectValues[index];
                  break;
                case 'travlingAllowance':
                  obj['Travelling Allowance'] = objectValues[index];
                  break;
                case 'totaldays':
                  obj['Total Days'] = objectValues[index];
                  break;
                case 'netpayablesalary':
                  obj['Net Payable Salary'] = objectValues[index];
                  break;
                default:
                  obj[item] = objectValues[index];
                  break;
              }
              finalDataArr.push(obj);
            });
            console.log(finalDataArr);
            setScreenData(finalDataArr);
          }
        }
      })
      .catch(err => {
        console.log('error getting response of payroll', err);
      })
      .finally(function () {
        setIsLoading(false);
      });
  }
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Loader loading={isLoading} />
        <Header
          title="Salary Slip"
          icon={true}
          onBackPress={() => props.navigation.goBack()}
        />
        <View style={styles.mainContainerImage}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={
                userData?.photo ? {uri: userData?.photo} : Images.dummyUser
              }
              style={styles.userImage}
            />
            <View style={{marginLeft: wp(5)}}>
              <Text style={[styles.nameText, {fontSize: hp(2)}]}>
                {employeeName}
              </Text>
              <Text style={styles.nameText}>{designation}</Text>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{marginTop: hp(4), marginBottom: hp(8)}}>
              <Text style={styles.reportText}>Pay Slip</Text>
              <DatePicker
                onDatePress={date => {}}
                dayShown={true}
                hideDayNames={true}
                onMonthChange={date => getPayRollData(date)}
              />

              <FlatList
                data={screenData}
                contentContainerStyle={styles.timeSheetContainer}
                ListHeaderComponent={() => {
                  return screenData.length > 1 ? (
                    <View style={styles.checkInOutView}>
                      <Text style={styles.checkInText}>Type</Text>
                      <Text style={styles.checkInText}>Total</Text>
                    </View>
                  ) : null;
                }}
                ListEmptyComponent={<ListEmptyComponent />}
                renderItem={({item, index}) => {
                  return (
                    <View
                      style={[
                        styles.checkInOutView,
                        {marginVertical: hp(0.7)},
                      ]}>
                      <Text style={styles.dateTextTimeSHeet}>
                        {Object.keys(item)[0]}
                      </Text>
                      <Text style={styles.checkTime}>
                        {Object.values(item)[0]}
                      </Text>
                    </View>
                  );
                }}
              />
              <View style={styles.footerComponentView}>
                <Text style={styles.checkInText}>Total</Text>
                <Text style={styles.footerComponentTotal}>
                  {Math.trunc(total)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    zIndex: 1,
  },
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
    zIndex: 1,
  },
  reportText: {
    color: colors.primary,
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2.5),
  },
  timeSheetContainer: {
    paddingVertical: hp(2),
    width: wp(87),
    backgroundColor: colors.white,
    elevation: 10,
    borderRadius: 10,
    marginVertical: hp(2),
    marginHorizontal: wp(2),
  },
  checkInOutView: {
    width: wp(89),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    marginBottom: hp(1),
  },
  checkInText: {
    width: wp(24),
    textAlignVertical: 'center',
    textAlign: 'center',
    backgroundColor: colors.primary,
    paddingVertical: hp(0.3),
    borderRadius: 2,
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    // paddingHorizontal: wp(2),
  },
  dateTextTimeSHeet: {
    width: wp(50),
    // textAlignVertical: 'center',
    // textAlign: 'center',
    color: colors.black,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.6),
  },
  checkTime: {
    width: wp(24),
    textAlignVertical: 'center',
    textAlign: 'right',
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
  },
  footerComponentView: {
    width: wp(89),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
  },
  footerComponentTotal: {
    width: wp(24),
    marginLeft: wp(2),
    backgroundColor: colors.grey,
    textAlignVertical: 'center',
    textAlign: 'center',
    color: colors.white,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.6),
    borderRadius: 5,
  },
});
