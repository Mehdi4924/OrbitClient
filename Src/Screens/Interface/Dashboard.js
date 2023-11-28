// import { Icon } from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import {Card, MD2Colors, Provider} from 'react-native-paper';
import Header from '../../Components/Header';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import {members} from '../../Utils/Apis/ApiCalls';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import {clearDashboardData} from '../../Redux/actions/Action';
import Toast from 'react-native-simple-toast';

export default function Dashboard(props) {
  const dispatch = useDispatch();
  const [teamData, setTeamData] = useState([]);
  const [type, setType] = useState('');
  useEffect(() => {
    getTeamMembers();
    FingerprintScanner.isSensorAvailable()
      .then(biometryType => setType(biometryType))
      .catch(error => setType(error.message));
  }, []);
  const getDashboardData = useSelector(
    state => state?.ConstantData?.dashboardData,
  );
  const hrDetails = getDashboardData?.hrLeadDetails;
  const roleName = getDashboardData?.employeeDetails?.roleName;
  console.log(getDashboardData.employeeDetails, 'employee dtails');
  var now = new Date();
  var newdate = new Date(now.setMonth(now.getMonth()));
  var lastMonth = GetMonthName(newdate.getMonth());
  function GetMonthName(monthNumber) {
    var months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[monthNumber];
  }
  var year = new Date().getFullYear();
  const getTeamMembers = async () => {
    await members
      .getAllMembers(getDashboardData?.employeeDetails?.employeeId)
      .then(result => {
        console.log(
          'Success response getting team data',
          // JSON.stringify(result?.data, null, 2),
          result,
        );
        setTeamData(result?.data?.data);
      })
      .catch(err => {
        console.log('Error response getting team data', err);
      });
  };
  function leaveHistoryCalculator() {
    const counts = {};
    const newArr = [];
    if (getDashboardData?.leaves?.length > 0) {
      getDashboardData?.leaves.forEach(item => {
        const {reason, leaveCatName, count} = item;
        if (!counts[reason]) {
          counts[reason] = {};
        }

        if (counts[reason][leaveCatName]) {
          counts[reason][leaveCatName] += count;
        } else {
          counts[reason][leaveCatName] = count;
        }
      });
    }
    const keys = Object.keys(counts);
    if (keys.length > 0) {
      keys.map(item => {
        const obj = {reason: item, ...counts[item]};
        newArr.push(obj);
      });
      const a = newArr.map(item => {
        const itemHalfDays = item['Half Day'];
        const itemShortLeaves = item['Short Leave'];
        return {
          ...item,
          'Half Day': itemHalfDays ? Math.trunc(itemHalfDays / 2) : 0,
          'Short Leave': itemShortLeaves ? Math.trunc(itemShortLeaves / 3) : 0,
        };
      });
      return a;
    } else {
      return [];
    }
  }
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Header
          rightPress={() =>
            type == 'Biometrics' || type == 'Touch ID'
              ? props.navigation.navigate('Setting')
              : [
                  dispatch(clearDashboardData()),
                  props.navigation.replace('AuthStack', {screen: 'Login'}),
                ]
          }
          // icon={true}
          iconNameRight={
            type == 'Biometrics' || type == 'Touch ID' ? 'setting' : 'logout'
          }
          title="Dashboard"
          onBackPress={() => props.navigation.goBack()}
        />
        <View style={styles.mainContainerImage}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={
                  getDashboardData?.employeeDetails?.photo
                    ? {
                        uri: getDashboardData?.employeeDetails?.photo,
                      }
                    : Images?.dummyUser
                }
                style={styles.userImage}
              />
              <View style={{marginLeft: wp(5)}}>
                <Text style={styles.nameText}>
                  {getDashboardData?.employeeDetails?.employeeName}
                </Text>
                <Text
                  style={[
                    styles.nameText,
                    {fontWeight: '300', fontSize: hp(1.6), marginTop: hp(1)},
                  ]}>
                  {getDashboardData?.employeeDetails?.designation}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {roleName == 'HR Lead' ? (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => props.navigation.navigate('Messages')}>
                  <Image
                    source={require('../../Assets/Images/messages.png')}
                    style={{
                      height: hp(3.5),
                      width: hp(3.5),
                      marginRight: wp(2),
                    }}
                  />
                </TouchableOpacity>
              ) : null}
              {roleName == 'HR Lead' ? (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() =>
                    props.navigation.navigate('LeaveRequests', {
                      dataa: teamData,
                    })
                  }>
                  <Image
                    source={require('../../Assets/Images/leave.png')}
                    style={{
                      height: hp(3.5),
                      width: hp(3.5),
                      marginRight: wp(2),
                    }}
                  />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => props.navigation.navigate('Notifications')}>
                <Image
                  source={require('../../Assets/Images/bell.png')}
                  style={{height: hp(3.5), width: hp(3.5)}}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView
            style={{marginBottom: hp(3)}}
            showsVerticalScrollIndicator={false}>
            <View style={{marginBottom: hp(8), padding: hp(0.2)}}>
              <Text style={styles.previousReportText}>
                Current Month Statistics
              </Text>
              <View style={styles.statsMainView}>
                <Text style={styles.monthText}>
                  {lastMonth}
                  {'\n'}
                  {year}
                </Text>
                <Text style={styles.monthText}>
                  {Math.round(
                    getDashboardData?.currentMonthHours?.totalHours * 100,
                  ) / 100}
                  {'\n'}Hours
                </Text>
                <Text style={[styles.monthText, {borderRightWidth: 0}]}>
                  {getDashboardData?.currentMonthLeaves}
                  {'\n'}Leaves
                </Text>
              </View>
              <Text style={styles.previousReportText}>
                Current Month Leave Details
              </Text>
              <FlatList
                ListEmptyComponent={<ListEmptyComponent />}
                listKey="leaves"
                data={leaveHistoryCalculator()}
                contentContainerStyle={{
                  paddingVertical: hp(2),
                  paddingHorizontal: 5,
                }}
                horizontal={true}
                renderItem={({item, index}) => {
                  let finalObj = {total: 0};
                  Object.keys(item).map(objectKeys => {
                    if (objectKeys == 'Half Day') {
                      finalObj.total = finalObj.total + item[objectKeys];
                    } else if (objectKeys == 'Short Leave') {
                      finalObj.total = finalObj.total + item[objectKeys];
                    } else if (objectKeys != 'reason') {
                      finalObj.total = finalObj.total + item[objectKeys];
                    }
                  });
                  if (finalObj.total > 0) {
                    return (
                      <Card style={styles.listParentView}>
                        <Text style={styles.purposeText}>{item.reason}</Text>
                        {item?.leaveRequestCREATED_DATE_TIME ? (
                          <>
                            <Text style={styles.purposeText}>Applied On</Text>
                            <Text style={styles.dateText}>
                              {item?.leaveRequestCREATED_DATE_TIME.split(
                                ' ',
                              )[0] || ''}
                            </Text>
                          </>
                        ) : null}
                        <Text style={styles.dateText}>
                          {finalObj.total + ' ' + 'day'}
                        </Text>
                      </Card>
                    );
                  } else {
                    return null;
                  }
                }}
              />
              <Text style={styles.previousReportText}>Reports And Slips</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: hp(2),
                  marginHorizontal: wp(3),
                  flexWrap: 'wrap',
                }}>
                <Pressable
                  onPress={() => props.navigation.navigate('SalarySlip')}>
                  <Card style={{backgroundColor: '#11A373'}}>
                    <View
                      style={[
                        styles.textView,
                        {backgroundColor: '#11A373', flexDirection: 'row'},
                      ]}>
                      <Card style={[styles.imageView, {marginLeft: wp(-3)}]}>
                        <Image source={Images.salary} style={styles.icon} />
                      </Card>
                      <View>
                        <Text style={styles.text}>Salary Slip</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
                <Pressable
                  onPress={() =>
                    teamData.length < 1
                      ? Toast.show(
                          'Sorry, You Are Not Team Lead Yet',
                          Toast.LONG,
                        )
                      : props.navigation.push('TeamReport', {dataa: teamData})
                  }>
                  <Card
                    style={{
                      backgroundColor:
                        teamData.length > 0
                          ? MD2Colors.amber500
                          : MD2Colors.amber200,
                    }}>
                    <View
                      style={[
                        styles.textView,
                        {
                          backgroundColor:
                            teamData.length > 0
                              ? MD2Colors.amber500
                              : MD2Colors.amber200,
                          flexDirection: 'row',
                        },
                      ]}>
                      <Card style={[styles.imageView, {marginLeft: wp(-3)}]}>
                        <Image source={Images.team} style={styles.icon} />
                      </Card>
                      <View>
                        <Text style={styles.text}>Team Report</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
                <Pressable
                  onPress={() => props.navigation.navigate('LoanStats')}
                  style={{marginTop: 15}}>
                  <Card style={{backgroundColor: MD2Colors.amber800}}>
                    <View
                      style={[
                        styles.textView,
                        {
                          backgroundColor: MD2Colors.amber800,
                          flexDirection: 'row',
                        },
                      ]}>
                      <Card style={[styles.imageView, {marginLeft: wp(-3)}]}>
                        <Image source={Images.loan} style={styles.icon} />
                      </Card>
                      <View>
                        <Text style={styles.text}>My Loans</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>

                <Pressable
                  onPress={() =>
                    props.navigation.navigate('ChatScreen', {
                      data: {
                        fcm: hrDetails?.fcmToken,
                        id: hrDetails?.aspNetUserId,
                        photo: hrDetails?.photo,
                        name: hrDetails?.employeeName,
                        roleName: hrDetails?.roleName,
                      },
                    })
                  }
                  disabled={roleName == 'HR Lead'}
                  style={{marginTop: 15}}>
                  <Card
                    style={{
                      backgroundColor:
                        roleName == 'HR Lead'
                          ? MD2Colors.cyan100
                          : MD2Colors.cyan400,
                    }}>
                    <View
                      style={[
                        styles.textView,
                        {
                          backgroundColor:
                            roleName == 'HR Lead'
                              ? MD2Colors.cyan100
                              : MD2Colors.cyan400,
                          flexDirection: 'row',
                        },
                      ]}>
                      <Card style={[styles.imageView, {marginLeft: wp(-3)}]}>
                        <Image source={Images.messages} style={styles.icon} />
                      </Card>
                      <View>
                        <Text style={styles.text}>Message HR</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              </View>

              <Text style={styles.previousReportText}>Time Sheet</Text>
              <Card
                elevation={2}
                style={{
                  backgroundColor: colors.white,
                  marginTop: 10,
                  marginBottom: hp(3),
                }}>
                <FlatList
                  listKey="time"
                  data={getDashboardData?.timeSheet}
                  contentContainerStyle={styles.timeSheetContainer}
                  ListHeaderComponent={() => {
                    return getDashboardData?.timeSheet?.length > 0 ? (
                      <View style={styles.checkInOutView}>
                        <Text style={styles.checkInText}>Date</Text>
                        <Text style={styles.checkInText}>Check In</Text>
                        <Text style={styles.checkInText}>Check Out</Text>
                        <Text style={styles.checkInText}>W/H</Text>
                      </View>
                    ) : null;
                  }}
                  ListEmptyComponent={
                    <ListEmptyComponent emptyContainer={{height: hp(5)}} />
                  }
                  renderItem={({item, index}) => {
                    return (
                      <View
                        style={[
                          styles.checkInOutView,
                          {marginVertical: hp(0.7)},
                        ]}>
                        <Text style={styles.dateTextTimeSHeet}>
                          {item?.date?.split(' ')?.join('')}
                        </Text>
                        <Text style={styles.checkTime}>{item?.checkIn}</Text>
                        <Text style={styles.checkTime}>{item?.checkOut}</Text>
                        <Text style={styles.checkTime}>
                          {item?.duration} Hrs
                        </Text>
                      </View>
                    );
                  }}
                />
              </Card>
            </View>
            <View style={{marginBottom: 150}}></View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Provider>
  );
}
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary},
  mainContainerImage: {
    height: hp(20),
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    backgroundColor: colors.primaryLight,
  },
  icon: {height: 20, width: 20, alignSelf: 'center'},
  imageView: {
    backgroundColor: colors.white,
    borderRadius: 100,
    padding: hp(1),
    height: hp(5),
    width: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontSize: hp(1.8),
    fontWeight: '700',
    paddingLeft: wp(3),
  },
  textView: {
    borderRadius: 0,
    borderTopRightRadius: 14,
    backgroundColor: colors.white,
    width: wp(37),
    height: hp(4.2),
    alignItems: 'center',
  },
  userImage: {
    height: hp(9),
    width: hp(9),
    marginVertical: hp(1),
    borderRadius: hp(2),
    backgroundColor: 'lightgrey',
  },
  nameText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: hp(2),
  },
  profileText: {
    color: colors.white,
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(3),
  },
  subView: {
    width: wp(100),
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    marginTop: hp(-5),
    bottom: 0,
    backgroundColor: colors.secondary,
    borderTopRightRadius: hp(5),
    borderTopLeftRadius: hp(5),
  },
  reportText: {
    color: colors.primary,
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2.5),
  },
  previousReportText: {
    color: colors.black,
    width: wp(80),
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
    fontSize: hp(2),
  },
  statsMainView: {
    backgroundColor: colors.primary,
    width: wp(90),
    height: hp(10),
    marginVertical: hp(1),
    borderRadius: hp(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3),
  },
  monthText: {
    color: colors.white,
    width: wp(25),
    fontWeight: '700',

    fontSize: hp(1.8),
    textAlignVertical: 'center',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.white,
  },
  //previous leaves list
  listParentView: {
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    elevation: 5,
    width: wp(30),
    marginRight: wp(2),
    borderRadius: 10,
    padding: 7,
  },
  purposeText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: hp(1.6),
  },
  dateText: {
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
  },
  submitButton: {
    backgroundColor: 'lightgrey',
    elevation: 0,
    borderRadius: 5,
    width: wp(40),
    height: hp(4.5),
    alignSelf: 'center',
  },
  //time sheet list
  timeSheetContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginVertical: hp(2),
  },
  checkInOutView: {
    width: wp(87),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
    marginBottom: hp(1),
  },
  checkInText: {
    width: wp(20),
    fontSize: hp(1.5),
    textAlignVertical: 'center',
    textAlign: 'center',
    backgroundColor: colors.primary,
    paddingVertical: hp(0.3),
    borderRadius: 2,
    color: colors.white,
    fontFamily: 'Poppins-Regular',
  },
  dateTextTimeSHeet: {
    width: wp(20),
    textAlignVertical: 'center',
    textAlign: 'center',
    color: colors.black,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.6),
  },
  checkTime: {
    width: wp(20),
    textAlignVertical: 'center',
    textAlign: 'center',
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
  },
});
