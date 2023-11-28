import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Image,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import moment from 'moment';
import CustomButton from '../../Components/CustomButton';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {Icon} from '@rneui/base';
import {hp, wp} from '../../Utils/Responsive';
import CustomTextInput from '../../Components/CustomTextInputs';
import {useSelector} from 'react-redux';
import {members, sendNotification} from '../../Utils/Apis/ApiCalls';
import Toast from 'react-native-simple-toast';
import {Card, Provider} from 'react-native-paper';
import Header from '../../Components/Header';
import {useIsFocused} from '@react-navigation/native';
import FileDownloader from '../../Utils/FileDownloader';
import ListEmptyComponent from '../../Components/ListEmptyComponent';

const monthNames = [
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

export default function MemberAttendance(props) {
  let pro = props?.route?.params?.data;
  const getDashboardData = useSelector(
    state => state.ConstantData.dashboardData,
  );
  let data = getDashboardData.employeeDetails;
  const hrData = getDashboardData.hrLeadDetails;
  const [comment, setComment] = useState('');
  const [screenData, setScreenData] = useState();
  const [selectedDates, setSelectedDates] = useState([]);
  const [leavesListData, setleavesListData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastIndex, setLastIndex] = useState();
  const [isloading, setisloading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentMonthLeaves, setCurrentMonthLeaves] = useState([]);
  const isfocused = useIsFocused();
  useEffect(() => {
    getData();
  }, [isfocused]);
  const getData = async () => {
    setisloading(true);
    await members
      .memberHistory(pro?.employeeId)
      .then(result => {
        console.log(
          'response getting member history',
          result,
          // JSON.stringify(result?.data, null, 2),
        );
        setScreenData(result?.data);
        setleavesListData(result?.data?.unApprovedLeaves?.unApprovedLEavesDtos);
        setCurrentMonthLeaves(result?.data?.currentMonthAttendence);
        setisloading(false);
      })
      .catch(err => {
        setisloading(false);
        console.log('error getting member history', err);
      });
  };
  const sendNotificationData = titl => {
    const dat = {
      registration_ids: [`${pro?.fcmToken}`, `${hrData?.fcmToken}`],
      collapse_key: 'type_a',
      notification: {
        title: titl,
        body: `Leave Application of ${pro.teamMemberName} has been ${titl} by team lead`,
        image: `${data?.photo}`,
      },
      data: {type: 'Member Leave'},
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
  function newDate(start, end) {
    for (
      var arr = [], dt = new Date(start);
      dt <= new Date(end);
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push({date: moment(new Date(dt)).format('YYYY-MM-DD')});
    }
    return arr;
  }
  const handleChange = (item, newIndex) => {
    if (lastIndex != newIndex) {
      setSelectedDates([{date: item, index: newIndex}]);
      setLastIndex(newIndex);
    } else {
      const newArr = [...selectedDates];
      const index = newArr.findIndex(finded => finded.date == item);
      if (index != -1) {
        const filteredNewArr = newArr.filter(filtered => filtered.date != item);
        setSelectedDates(filteredNewArr);
      } else {
        setSelectedDates([
          ...newArr,
          {
            date: item,
            index: newIndex,
          },
        ]);
      }
    }
  };
  const postComment = async item => {
    console.log(item);
    let d = [];
    selectedDates?.map((item, index) => {
      d.push(item?.date);
    });
    if (d?.length < 1) {
      Toast.show('Please Select At Least One Leave Date', Toast.SHORT);
    } else if (comment == '') {
      Toast.show('Please Add Comments Before Approving', Toast.SHORT);
    } else {
      let body = {
        leaveTypeId: item.leaveTypeId,
        teamLeadComments: comment,
        leaveDate: d,
        employeeId: pro?.employeeId,
        leaveRequestId: item.id,
        isApproved: true,
      };
      await members
        .approveMemberLeave(body)
        .then(result => {
          console.log(result);
          if (
            result?.data?.message ==
            'Leave Date cannot be previous than today date'
          ) {
            Toast.show(result?.data?.message, Toast.SHORT);
          } else {
            Toast.show(result?.data?.message, Toast.LONG);
            sendNotificationData('Approved');
            getData();
          }
        })
        .catch(err => {
          console.log(err);
          Toast.show(err?.message, Toast.SHORT);
        });
    }
  };
  const RejectLeave = async id => {
    Alert.alert('Rejection', 'Are you sure to reject this leave', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          let body = {
            LeaveRequestId: id,
          };
          await members
            .reject(body)
            .then(res => {
              console.log('Response rejecting Leave', res?.data);
              Toast.show('Reject Succesfully', Toast.SHORT);
              sendNotificationData('Rejected');
              getData();
            })
            .catch(err => {
              console.log('Error Accepting Leave', err);
            });
        },
      },
    ]);
  };
  function findLeavesOfThisMonth() {
    let totalCount = 0;
    const endData = {short: 0, half: 0, full: 0};
    screenData?.perviousMonthLeaves?.length > 0
      ? screenData?.perviousMonthLeaves.map(item => {
          if (item.leaveCatName == 'Short Leave') {
            // totalCount = item.count / 3 + totalCount;
            endData.short = endData.short + item.count;
          } else if (item.leaveCatName == 'Half Day') {
            endData.half = endData.half + item.count;
            // totalCount = item.count / 2 + totalCount;
          } else {
            endData.full = endData.full + item.count;
            // totalCount = item.count + totalCount;
          }
        })
      : 0;
    const halfTotal = endData.half / 2;
    const shortTotal = endData.short / 3;
    const halfFinal = Math.trunc(halfTotal);
    const shortFinal = Math.trunc(shortTotal);
    return halfFinal + shortFinal + endData.full;
  }
  function getWeekday(s) {
    const [dd, mm, yyyy] = s.split('-'),
      date = new Date(yyyy, mm - 1, dd);
    return date.toLocaleDateString('en-US', {weekday: 'long'});
  }
  function checkOnOff(weekday) {
    let disabled = false;
    const finalWeekDay = weekday.toLowerCase();
    const sandwichCheck = screenData?.unApprovedLeaves.isSandWitchAllowed;
    const userOffDays =
      screenData?.unApprovedLeaves?.offDayPolicyForThisEmployee;
    if (!sandwichCheck == false) {
      Object.keys(userOffDays).map(item => {
        if (item == finalWeekDay) {
          if (userOffDays[item] == true) {
            console.log('user off day status', item, userOffDays[item]);
          }
        }
      });
    } else {
      disabled = false;
    }
    return disabled;
  }
  //   Performance Add (user related)
  // Loan Application (HR related generated by Authuser)
  // Chat Not (HR related generated by Authuser/ user related generate by HR)
  // evaluation report ( HR and user related and shown to both)
  // Leave Approve/Reject ( user related)
  // Leave Application ( Hr related/Team Lead Related)
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Header
          title="Attendence Report"
          icon={true}
          onBackPress={() => props.navigation.goBack()}
        />
        <View style={styles.mainContainerImage}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={
                pro?.profilePic && pro.profilePic != 'http://15.185.185.85:40/'
                  ? {
                      uri: pro?.profilePic,
                    }
                  : Images.dummyUser
              }
              style={styles.userImage}
            />
            <View style={{marginLeft: wp(5)}}>
              <Text style={styles.nameText}>{pro?.teamMemberName}</Text>
              <Text style={styles.nameText}>{pro?.designation}</Text>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isloading}
                onRefresh={() => getData()}
              />
            }>
            <View style={{marginBottom: hp(8)}}>
              <Text>{}</Text>
              <Text style={styles.previousReportText}>
                Current Month Statistics
              </Text>
              <View style={styles.statsMainView}>
                <Text style={styles.monthText}>
                  {monthNames[new Date().getMonth()]}
                  {'\n'}
                  {new Date()?.getFullYear()}
                </Text>
                <Text style={styles.monthText}>
                  {Math.round(
                    screenData?.previousMonthHours?.totalHours * 100,
                  ) / 100 || 0}
                  {'\n'}Hours
                </Text>
                {/* <Pressable
                  onPress={() =>
                    props.navigation.navigate('TeamMemberLeaveHistory', {
                      data: pro,
                    })
                  }> */}
                <Text style={[styles.monthText, {borderRightWidth: 0}]}>
                  {Math?.trunc(findLeavesOfThisMonth())}
                  {'\n'}
                  Leaves
                </Text>
                {/* </Pressable> */}
              </View>
              <FlatList
                listKey="name"
                data={leavesListData}
                contentContainerStyle={{
                  paddingVertical: hp(2),
                  paddingHorizontal: 5,
                }}
                renderItem={({item, index}) => {
                  const formedDate = newDate(
                    item?.applY_FROM_DATE,
                    item?.applY_TO_DATE,
                  );
                  const attachmentCheck = item?.attachment?.split(',');
                  return (
                    <Card style={styles.listParentView}>
                      <TouchableOpacity
                        onPress={() => {
                          leavesListData[index].isOpen
                            ? (leavesListData[index].isOpen = false)
                            : (leavesListData[index].isOpen = true);
                          setRefreshing(!refreshing);
                          setSelectedDates([]);
                        }}
                        style={styles.listSubView}>
                        <Text style={styles.purposeText}>
                          Applied On{' '}
                          {item?.createD_DATE_TIME
                            ? item?.createD_DATE_TIME.split('T')[0]
                            : ''}
                        </Text>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Icon
                            name={'down'}
                            type="antdesign"
                            color={colors.black}
                            style={{marginLeft: wp(1)}}
                            size={hp(2.3)}
                          />
                        </View>
                      </TouchableOpacity>
                      {item?.isOpen ? (
                        <View>
                          <View>
                            <Text style={styles.applicationForText}>
                              Leave Reason
                            </Text>
                            <Text style={styles.descText}>
                              {item?.leaveType}
                            </Text>
                            <Text style={styles.applicationForText}>
                              Leave Type
                            </Text>
                            <Text style={styles.descText}>
                              {item?.leaveCatName == 'Short Leave' ||
                              item?.leaveCatName == 'Half Day'
                                ? item?.leaveCatName
                                : 'Full Day'}{' '}
                              {item?.leaveCatName == 'Short Leave'
                                ? `From ${item?.startTime} to ${item?.endTime}`
                                : ''}
                              {item?.leaveCatName == 'Half Day'
                                ? `For ${
                                    item?.firstHalf
                                      ? 'First Half'
                                      : item?.secondHalf
                                      ? 'Second Half'
                                      : ''
                                  }`
                                : ''}
                            </Text>
                            <Text style={styles.applicationForText}>
                              Leave Application For{' '}
                              {
                                newDate(
                                  item?.applY_FROM_DATE,
                                  item?.applY_TO_DATE,
                                )?.length
                              }{' '}
                              days
                            </Text>
                            <View style={{flexDirection: 'row'}}>
                              <FlatList
                                numColumns={3}
                                data={newDate(
                                  item?.applY_FROM_DATE,
                                  item?.applY_TO_DATE,
                                )}
                                renderItem={({item, index}) => {
                                  return (
                                    <Text style={styles.leaveDatesText}>
                                      {item.date}
                                    </Text>
                                  );
                                }}
                              />
                            </View>
                          </View>
                          <Text style={styles.applicationForText}>
                            Leave Description
                          </Text>
                          <Text style={styles.descText}>
                            {item?.employeE_COMMENTS}
                          </Text>
                          {item?.leaveType == 'Half Day' ? (
                            <>
                              <Text style={styles.applicationForText}>
                                Half Day
                              </Text>
                              <Text style={styles.descText}>
                                {item?.firstHalf ? 'First Half' : 'Second Half'}
                              </Text>
                            </>
                          ) : null}
                          {item?.leaveType == 'Short Leave' ? (
                            <>
                              <Text style={styles.applicationForText}>
                                Short Leave Time
                              </Text>
                              <Text style={styles.descText}>
                                {item?.startTime} To {item?.endTime}
                              </Text>
                            </>
                          ) : null}
                          {/* "/EmployeeLeaveRequest/99d9a6e0-4e19-4abf-87d3-d4e600b9cc55_08-May-2023_11-01-14_RS-Gemini-Product-Brief.pdf" */}
                          {attachmentCheck[0] != '' &&
                          attachmentCheck[0] != '/EmployeeLeaveRequest/' &&
                          attachmentCheck[0] !=
                            'http://15.185.185.85:8086//EmployeeLeaveRequest/' ? (
                            <CustomButton
                              isLoading={isDownloading}
                              disabled={isDownloading}
                              name={'Download Attachment'}
                              buttonStyles={styles.smallButton}
                              textStyles={{fontSize: hp(1.5)}}
                              onPress={async () => {
                                setIsDownloading(true);
                                await FileDownloader(
                                  {
                                    ...item,
                                    attachment:
                                      'http://15.185.185.85:8086//' +
                                      attachmentCheck[0],
                                  },
                                  function callback() {
                                    setIsDownloading(false);
                                  },
                                );
                              }}
                            />
                          ) : null}
                          <Text style={styles.approvedForText}>
                            Select Approved Leave days
                          </Text>
                          <FlatList
                            numColumns={3}
                            data={formedDate}
                            listKey={index}
                            renderItem={listProps => {
                              const itemm = listProps.item;
                              const findedIndex = selectedDates?.length
                                ? selectedDates.findIndex(
                                    prev =>
                                      prev.date == itemm.date &&
                                      prev.index == index,
                                  )
                                : -1;
                              const weekDayOfThisDate = getWeekday(
                                listProps.item.date,
                              );
                              const showHideCheck =
                                checkOnOff(weekDayOfThisDate);
                              return (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <TouchableOpacity
                                    onPress={() => {
                                      // handleChange(index, formedDate, indexx)
                                      handleChange(itemm.date, index);
                                    }}>
                                    <Icon
                                      type="material-community"
                                      name={
                                        findedIndex != -1
                                          ? 'checkbox-marked'
                                          : 'checkbox-blank-outline'
                                      }
                                      size={24}
                                      color="grey"
                                    />
                                  </TouchableOpacity>
                                  <Text style={styles.approvedDatesText}>
                                    {itemm?.date}
                                  </Text>
                                </View>
                              );
                            }}
                          />
                          <Text style={styles.applicationForText}>
                            Add Comment
                          </Text>
                          <CustomTextInput
                            // mainView={styles.mainView}
                            textInputStyles={styles.textInputStyles}
                            value={comment}
                            onChangeText={text => setComment(text)}
                            placeholder="Comment...."
                            numberOfLines={4}
                            multiline={true}
                          />
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <CustomButton
                              isLoading={false}
                              name={'Rejected'}
                              buttonStyles={[
                                styles.smallButton,
                                {width: wp(30), backgroundColor: 'red'},
                              ]}
                              textStyles={{fontSize: hp(1.5)}}
                              onPress={() => RejectLeave(item.id)}
                            />
                            <CustomButton
                              isLoading={false}
                              disabled={
                                selectedDates?.length > 0 ? false : true
                              }
                              name={'Approved'}
                              buttonStyles={[
                                styles.smallButton,
                                {width: wp(30)},
                              ]}
                              textStyles={{fontSize: hp(1.5)}}
                              onPress={() => postComment(item)}
                            />
                          </View>
                        </View>
                      ) : null}
                    </Card>
                  );
                }}
              />

              <Text style={styles.previousReportText}>Time Sheet</Text>
              <View style={{padding: 2, marginTop: hp(1)}}>
                <Card style={{backgroundColor: colors.white}}>
                  <FlatList
                    data={currentMonthLeaves}
                    contentContainerStyle={styles.timeSheetContainer}
                    ListEmptyComponent={<ListEmptyComponent />}
                    ListHeaderComponent={() => {
                      return currentMonthLeaves.length > 0 ? (
                        <View style={styles.checkInOutView}>
                          <Text style={styles.checkInText}>Date</Text>
                          <Text style={styles.checkInText}>Check In</Text>
                          <Text style={styles.checkInText}>Check Out</Text>
                          <Text style={styles.checkInText}>W/H</Text>
                        </View>
                      ) : null;
                    }}
                    renderItem={({item, index}) => {
                      return (
                        <View
                          style={[
                            styles.checkInOutView,
                            {marginVertical: hp(0.7)},
                          ]}>
                          <Text style={styles.dateTextTimeSHeet}>
                            {item.date}
                          </Text>
                          <Text style={styles.checkTime}>{item.checkIn}</Text>
                          <Text style={styles.checkTime}>{item.checkOut}</Text>
                          <Text style={styles.checkTime}>
                            {item?.duration} Hrs
                          </Text>
                        </View>
                      );
                    }}
                  />
                </Card>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary},
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
  },
  monthView: {
    backgroundColor: colors.primary,
    width: wp(90),
    height: hp(5),
    marginVertical: hp(1),
    borderRadius: hp(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3),
  },
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(7),
    width: wp(80),
    marginVertical: hp(0.5),
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  textInputStyles: {
    width: wp(68),
    height: hp(14),
    fontSize: hp(1.8),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Bold',
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
    height: hp(10),
    width: wp(30),
    marginRight: wp(5),
    borderRadius: 10,
    padding: 7,
  },
  purposeText: {
    color: colors.black,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.6),
  },
  dateText: {
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
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
    width: wp(24),
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
  listParentView: {
    backgroundColor: colors.white,
    marginVertical: hp(0.5),
    elevation: 5,
    borderRadius: 10,
    padding: 10,
  },
  listSubView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applicationForText: {
    maxWidth: wp(50),
    color: colors.black,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.6),
    marginVertical: hp(1),
  },
  leaveDatesText: {
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.7),
    marginVertical: 2,
    backgroundColor: colors.grey,
    paddingHorizontal: wp(1),
    marginHorizontal: wp(1),
    borderRadius: 5,
  },
  purposeText: {
    maxWidth: wp(50),
    color: colors.black,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.6),
  },
  dateText: {
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
  },
  descText: {
    color: colors.darkgrey,
    paddingHorizontal: wp(1.8),
  },
  approvedForText: {
    maxWidth: wp(50),
    color: colors.primary,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.6),
    marginVertical: hp(1),
  },
  approvedDatesText: {
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.5),
    backgroundColor: colors.primary,
    paddingHorizontal: wp(1),
    marginHorizontal: wp(0.5),
    borderRadius: 5,
  },
  smallButton: {
    height: hp(4),
    borderRadius: 5,
    marginVertical: hp(1),
    elevation: 5,
  },
});
