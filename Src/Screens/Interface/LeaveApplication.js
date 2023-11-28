import {Icon} from '@rneui/base';
import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import CustomDropdown from '../../Components/CustomDropdown';
import CustomTextInput from '../../Components/CustomTextInputs';
import DatePicker from '../../Components/DatePicker';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import DocumentPicker, {
  // DirectoryPickerResponse,
  // DocumentPickerResponse,
  isInProgress,
  types,
} from 'react-native-document-picker';
import Toast from 'react-native-simple-toast';
import {hp, wp} from '../../Utils/Responsive';
import {leaveApi, sendNotification} from '../../Utils/Apis/ApiCalls';
import {useSelector} from 'react-redux';
import axios from 'axios';
import Loader from '../../Components/Loader';
import {Provider} from 'react-native-paper';
import * as TimePicker from 'react-native-date-picker';
import Header from '../../Components/Header';

const halfShort = [];
export default function LeaveApplication(props) {
  const dateChecking = new Date();
  const dateToday = new Date().toISOString().split('T')[0];
  const day = dateChecking.setHours(0, 0, 0, 0);
  const night = dateChecking.setHours(23, 59, 59, 59);
  const timeNow = new Date().getHours();
  const getdata = useSelector(state => state.ConstantData.dashboardData);
  let data = getdata.employeeDetails;
  const [desc, setDesc] = useState('');
  const [leaveType, setLeaveType] = useState();
  const [leaveData, setLeaveData] = useState([]);
  const [leaveDate, setLeaveDate] = useState([
    {dateString: new Date().toISOString().split('T')[0]},
  ]);
  const [isloading, setisloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState();
  const [leaveTime, setLeaveTime] = useState('Full');
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState({
    index: -1,
    time: '',
  });
  useEffect(() => {
    getLeaveType();
  }, []);
  const getLeaveType = async () => {
    leaveApi
      .reasonLeave(data.employeeId)
      .then(result => {
        console.log(
          'success getting leave types',
          JSON.stringify(result, null, 2),
        );
        const reasons = result?.data?.reasons;
        const arr = [];
        if (reasons.length > 0) {
          reasons.map(item => {
            if (
              item?.leaveTypeName != 'Half Day' &&
              item?.leaveTypeName != 'Short Leave'
            ) {
              arr.push(item);
            } else {
              halfShort.push(item);
            }
          });
        }
        setLeaveData(arr);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(function () {
        setRefreshing(false);
      });
  };
  const applyLeave = async () => {
    let timeCheck = false;
    if (
      leaveTime == 'Short' &&
      leaveDate.length > 0 &&
      leaveDate[0]?.startTime &&
      leaveDate[0]?.endTime
    ) {
      const start = leaveDate[0]?.startTime;
      const end = leaveDate[0]?.endTime;
      const startSplit = start.split(':');
      const endSplit = end.split(':');
      if (startSplit[0] > endSplit[0]) {
        timeCheck = false;
      } else if (startSplit[0] == endSplit[0]) {
        if (endSplit[1] - startSplit[1] < 30) {
          timeCheck = false;
        } else {
          timeCheck = true;
        }
      } else {
        timeCheck = true;
      }
    }
    if (leaveDate.length < 1) {
      Toast.show('Please Select Leave Date', Toast.SHORT);
    } else if (leaveType == undefined) {
      Toast.show('Please Select Leave Type ', Toast.SHORT);
    } else if (leaveTime == 'Half' && !leaveDate[0]?.half) {
      Toast.show('Please Select Half', Toast.SHORT);
    } else if (leaveTime == 'Short' && !leaveDate[0]?.startTime) {
      Toast.show('Please Enter Start Time', Toast.SHORT);
    } else if (leaveTime == 'Short' && !leaveDate[0]?.endTime) {
      Toast.show('Please Enter End Time', Toast.SHORT);
    } else if (leaveTime == 'Short' && timeCheck == false) {
      Toast.show(
        'Please Select Minimum Of 30 Mins For Short Leave',
        Toast.SHORT,
      );
    } else {
      setIsSubmitting(true);
      let statrDate = '';
      let endDate = '';
      if (leaveTime == 'Short' || leaveTime == 'Half') {
        statrDate = leaveDate[0]?.dateString;
        endDate = leaveDate[0]?.dateString;
      } else if (leaveDate[0]?.dateString > leaveDate[1]?.dateString) {
        statrDate = leaveDate[1]?.dateString;
        endDate = leaveDate[0]?.dateString;
      } else {
        statrDate = leaveDate[0]?.dateString;
        endDate = leaveDate[1]?.dateString;
      }
      axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
      let formdata = new FormData();
      formdata.append('EmpId', data?.employeeId);
      formdata.append('ApplyToDate', endDate == null ? statrDate : endDate);
      formdata.append('ApplyFromDate', statrDate);
      formdata.append('EmployeeComments', desc);
      formdata.append('LeaveTypeId', leaveType?.leaveTypeId);
      formdata.append(
        'LeaveType',
        leaveDate[0]?.half == 'First'
          ? 'First Half'
          : leaveDate[0]?.half == 'Second'
          ? 'Second Half'
          : null,
      );
      formdata.append(
        'StartTime',
        leaveDate[0]?.startTime ? leaveDate[0]?.startTime : null,
      );
      formdata.append(
        'EndTime',
        leaveDate[0]?.endTime ? leaveDate[0]?.endTime : null,
      );
      formdata.append('Attachment', null);
      if (result?.fileCopyUri) {
        formdata.append('file', {
          uri: result?.fileCopyUri,
          type: result?.type,
          name: result?.name,
        });
      }
      console.log('idr tk AYA', leaveType);
      if (leaveDate.length > 1) {
        formdata.append('LeaveTypeChildId', leaveType?.leaveTypeId);
      } else {
        const halfLeave = halfShort.filter(
          item => item.leaveTypeName == 'Half Day',
        );
        const shortLeave = halfShort.filter(
          item => item.leaveTypeName == 'Short Leave',
        );
        formdata.append(
          'LeaveTypeChildId',
          leaveTime == 'Half'
            ? halfLeave[0].leaveTypeId
            : leaveTime == 'Short'
            ? shortLeave[0].leaveTypeId
            : leaveType?.leaveTypeId,
        );
      }
      await leaveApi
        .applyLeaave(formdata)
        .then(result => {
          console.log(
            'success applying leave',
            JSON.stringify(result.data, null, 2),
          );
          if (result?.data?.message != 'Applied Successfully') {
            Toast.show(
              result?.data?.message || 'Error Applying Leave',
              Toast.SHORT,
            );
          } else {
            Toast.show('Successfully Apllied Leave', Toast.SHORT);
            notSend();
            props.navigation.replace('AppFlow');
          }
        })
        .catch(err => {
          Toast.show(err?.message, Toast.SHORT);
          console.log('error applying leave', err);
        })
        .finally(function () {
          axios.defaults.headers.post['Content-Type'] = 'application/json';
          setisloading(false);
          setIsSubmitting(false);
        });
    }
  };
  const handleError = err => {
    if (DocumentPicker.isCancel(err)) {
      console.warn('cancelled');
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn(
        'multiple pickers were opened, only the last will be considered',
      );
    } else {
      throw err;
    }
  };
  const notSend = () => {
    const teamLead = getdata?.teamLeadDetails;
    const hrToken = getdata?.hrLeadDetails?.fcmToken;
    const dat = {
      // to: `${teamLead?.fcmToken}`,
      registration_ids: [`${teamLead?.fcmToken}`, `${hrToken}`],
      collapse_key: 'type_a',
      notification: {
        title: `New Leave Application`,
        body: `${data?.employeeName} Is Requesting ${leaveType?.leaveTypeName} Leave`,
        image: 'https://www.sundas.org/Images/logo.png',
      },
      data: {type: 'Leave'},
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
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getLeaveType();
  }, []);
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Loader loading={isloading} />
        <Header title="Apply Leave" />
        <View style={styles.mainContainerImage}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={data?.photo ? {uri: data.photo} : Images.dummyUser}
              style={styles.userImage}
            />
            <View style={{marginLeft: wp(5)}}>
              <Text style={styles.nameText}>{data?.employeeName}</Text>
              <Text style={styles.nameText}>{data?.designation}</Text>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={{marginBottom: hp(8)}}>
              <Text style={styles.reportText}>Apply Leave</Text>
              <Text style={styles.previousReportText}>Choose Dates *</Text>
              <DatePicker
                onDatePress={date => {
                  setLeaveDate(date);
                }}
                onMonthChange={date => null}
                selectionLimit={2}
                refresh={false}
              />
              <View style={{marginTop: hp(3)}} />
              {leaveDate?.length == 1 ? (
                <>
                  <View style={styles.selectLeaveTime}>
                    <TouchableOpacity
                      style={{flexDirection: 'row', alignItems: 'center'}}
                      onPress={() => setLeaveTime('Full')}>
                      <Icon
                        name={
                          leaveTime == 'Full'
                            ? 'radio-button-on'
                            : 'radio-button-off'
                        }
                        type="material"
                        color={colors.black}
                        size={hp(2)}
                      />
                      <Text style={styles.leaveTimeText}>Full day</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{flexDirection: 'row', alignItems: 'center'}}
                      onPress={() => {
                        setLeaveTime('Half');
                      }}>
                      <Icon
                        name={
                          leaveTime == 'Half'
                            ? 'radio-button-on'
                            : 'radio-button-off'
                        }
                        type="material"
                        color={colors.black}
                        size={hp(2)}
                      />
                      <Text style={styles.leaveTimeText}>Half Day</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{flexDirection: 'row', alignItems: 'center'}}
                      onPress={() => setLeaveTime('Short')}>
                      <Icon
                        name={
                          leaveTime == 'Short'
                            ? 'radio-button-on'
                            : 'radio-button-off'
                        }
                        type="material"
                        color={colors.black}
                        size={hp(2)}
                      />
                      <Text style={styles.leaveTimeText}>Short Leave</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{marginBottom: hp(1)}}>
                    {leaveTime == 'Half'
                      ? leaveDate.length
                        ? leaveDate.map((item, index) => {
                            return (
                              <>
                                {index == 0 ? (
                                  <Text style={styles.previousReportText}>
                                    Select Half*
                                  </Text>
                                ) : null}
                                <View style={styles.halfSelectionView}>
                                  <Text style={styles.halfDateString}>
                                    {item?.dateString}
                                  </Text>
                                  <View style={{flexDirection: 'row'}}>
                                    <TouchableOpacity
                                      style={styles.halfRadioButtonView}
                                      onPress={() => {
                                        console.log(timeNow);
                                        if (
                                          leaveDate[0]?.dateString ==
                                            dateToday &&
                                          timeNow > 12
                                        ) {
                                          Toast.show(
                                            'You Cannot Apply For First Half After The First Half Of Day Is Over',
                                            Toast.LONG,
                                          );
                                        } else {
                                          const leaveDateCopy = [...leaveDate];
                                          leaveDateCopy[index].half = 'First';
                                          setLeaveDate(leaveDateCopy);
                                        }
                                      }}>
                                      <Icon
                                        name={
                                          item?.half == 'First'
                                            ? 'radio-button-on'
                                            : 'radio-button-off'
                                        }
                                        type="material"
                                        color={
                                          item?.half == 'First'
                                            ? colors.primary
                                            : colors.black
                                        }
                                        size={hp(3)}
                                      />
                                      <Text style={styles.firstHalfText}>
                                        First Half
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={styles.halfRadioButtonView}
                                      onPress={() => {
                                        const leaveDateCopy = [...leaveDate];
                                        leaveDateCopy[index].half = 'Second';
                                        setLeaveDate(leaveDateCopy);
                                      }}>
                                      <Icon
                                        name={
                                          item?.half == 'Second'
                                            ? 'radio-button-on'
                                            : 'radio-button-off'
                                        }
                                        color={
                                          item?.half == 'Second'
                                            ? colors.primary
                                            : colors.black
                                        }
                                        type="material"
                                        size={hp(3)}
                                      />
                                      <Text style={styles.firstHalfText}>
                                        Second Half
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </>
                            );
                          })
                        : null
                      : null}
                  </View>
                  <View style={{marginBottom: hp(1)}}>
                    {leaveTime == 'Short'
                      ? leaveDate.length
                        ? leaveDate.map((item, index) => {
                            return (
                              <>
                                {index == 0 ? (
                                  <Text style={styles.previousReportText}>
                                    Select Time Frame*
                                  </Text>
                                ) : null}
                                <View
                                  style={[
                                    styles.halfSelectionView,
                                    {flexDirection: 'column'},
                                  ]}>
                                  <Text style={styles.halfDateString}>
                                    {item?.dateString}
                                  </Text>
                                  <View style={styles.halfSelectionView}>
                                    <View style={styles.shortLeaveSubView}>
                                      <Text style={styles.firstHalfText}>
                                        Start Time
                                      </Text>
                                      <TouchableOpacity
                                        style={styles.timeInputView}
                                        onPress={() => {
                                          setOpen(true),
                                            setSelectedIndex({
                                              index: index,
                                              time: 'Start Time',
                                            });
                                        }}>
                                        <Text style={styles.timeInputText}>
                                          {item.startTime
                                            ? item.startTime
                                            : 'HH:MM'}
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                    <View style={styles.shortLeaveSubView}>
                                      <Text style={styles.firstHalfText}>
                                        End Time
                                      </Text>
                                      <TouchableOpacity
                                        style={styles.timeInputView}
                                        onPress={() => {
                                          setOpen(true),
                                            setSelectedIndex({
                                              index: index,
                                              time: 'End Time',
                                            });
                                        }}>
                                        <Text style={styles.timeInputText}>
                                          {item.endTime
                                            ? item.endTime
                                            : 'HH:MM'}
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                    {/* <CustomTextInput
                                     mainView={styles.shortLeaveInput}
                                     textInputStyles={
                                       styles.shortLeaveInputStyles
                                     }
                                     value={item.startTime}
                                     onChangeText={text => {
                                       const leaveDateCopy = [...leaveDate];
                                       leaveDateCopy[index].startTime = text;
                                       setLeaveDate(leaveDateCopy);
                                     }}
                                     placeholder="hh:mm"
                                   /> */}
                                  </View>
                                </View>
                              </>
                            );
                          })
                        : null
                      : null}
                  </View>
                </>
              ) : null}

              <Text style={styles.previousReportText}>Leave Type *</Text>
              <CustomDropdown
                data={leaveData}
                labelField={'leaveTypeName'}
                valueField={'leaveTypeId'}
                placeholder={'Select Type'}
                iconName={'city-variant-outline'}
                iconType={'material-community'}
                onChange={item => {
                  setLeaveType(item);
                }}
                value={leaveType}
                container={{width: wp(90)}}
              />
              {/* <Text style={styles.previousReportText}>Reason For Leave</Text>
            <CustomTextInput
              mainView={styles.reasonView}
              textInputStyles={styles.reasonTextInputStyles}
              value={leaveTypeName}
              onChangeText={text => setReason(text)}
              placeholder="Reason"
            /> */}
              <Text style={styles.previousReportText}>Description</Text>
              <CustomTextInput
                mainView={styles.mainView}
                textInputStyles={styles.textInputStyles}
                value={desc}
                onChangeText={text => setDesc(text)}
                placeholder="Description"
                multiline
              />
              <Text style={styles.previousReportText}>Attach Files</Text>
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.chooseDateView}
                onPress={async () => {
                  try {
                    const pickerResult = await DocumentPicker.pickSingle({
                      presentationStyle: 'fullScreen',
                      allowMultiSelection: false,
                      copyTo: 'cachesDirectory',
                      type: [types.doc, types.docx, types.pdf, types.images],
                    });
                    console.log('file ==>>', pickerResult);
                    setResult(pickerResult);
                  } catch (e) {
                    handleError(e);
                  }
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon
                    name="file-document-outline"
                    type="material-community"
                    color={colors.grey}
                    size={hp(2.5)}
                    // style={{ marginRight: wp(2) }}
                  />
                  <Text style={styles.choosenFileText}>
                    {result?.name ? result?.name : 'Attach File'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setResult({})}>
                  <Icon
                    name="close"
                    type="material-community"
                    color={colors.primary}
                    size={hp(1)}
                    reverse
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              <CustomButton
                isLoading={isSubmitting}
                name={'Submit'}
                buttonStyles={styles.submitButton}
                onPress={() => applyLeave()}
                // onPress={() => props.navigation.replace('AppFlow')}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
      <TimePicker.default
        modal
        open={open}
        date={
          dateToday == leaveDate[0]?.dateString ? new Date() : new Date(day)
        }
        is24hourSource={'locale'}
        minimumDate={
          dateToday == leaveDate[0]?.dateString ? new Date() : new Date(day)
        }
        maximumDate={new Date(night)}
        onConfirm={date => {
          const leaveDateCopy = [...leaveDate];
          if (selectedIndex.index != -1 && selectedIndex.time == 'Start Time') {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            leaveDateCopy[selectedIndex.index].startTime = `${hours}:${
              minutes < 10 ? `0${minutes}` : `${minutes}`
            }`;
            console.log(leaveDateCopy[selectedIndex.index]);
          } else if (
            selectedIndex.index != -1 &&
            selectedIndex.time == 'End Time'
          ) {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            leaveDateCopy[selectedIndex.index].endTime = `${hours}:${
              minutes < 10 ? `0${minutes}` : `${minutes}`
            }`;
          }
          setLeaveDate(leaveDateCopy);
          setOpen(false);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary},
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
    fontSize: hp(2.7),
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
    marginBottom: hp(0.5),
  },
  selectLeaveTime: {
    marginVertical: hp(0.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  leaveTimeText: {
    fontFamily: 'Poppins-Regular',
    marginLeft: wp(2),
    color: colors.primary,
  },
  chooseDateView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grey,
    paddingHorizontal: wp(2),
    borderRadius: 5,
    marginVertical: hp(1),
  },
  halfSelectionView: {
    backgroundColor: colors.lightGray,
    marginVertical: hp(0.5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  halfDateString: {
    alignSelf: 'flex-start',
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2),
  },
  halfRadioButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  firstHalfText: {
    marginHorizontal: wp(1),
    color: colors.black,
    fontSize: hp(1.7),
    fontFamily: 'Poppins-Regular',
  },
  timeInputView: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(5),
    width: wp(24),
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: hp(1),
  },
  timeInputText: {
    fontSize: hp(1.4),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
  },
  shortLeaveSubView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shortLeaveInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(5),
    width: wp(24),
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: hp(1),
  },
  shortLeaveInputStyles: {
    width: wp(24),
    height: hp(5),
    fontSize: hp(1.4),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
  },
  choosenFileText: {
    width: wp(70),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.8),
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
    height: hp(20),
    width: wp(88),
    fontSize: hp(1.8),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'top',
  },
  // leaveTypeName text input
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
