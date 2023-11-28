import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
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
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import {useSelector} from 'react-redux';
import {leaveApi} from '../../Utils/Apis/ApiCalls';
import Loader from '../../Components/Loader';
import Toast from 'react-native-simple-toast';
import moment from 'moment';
import {Card, Provider} from 'react-native-paper';
import Header from '../../Components/Header';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import FileDownloader from '../../Utils/FileDownloader';
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
export default function LeaveHistory(props) {
  const month = new Date().getMonth();
  const getdata = useSelector(state => state.ConstantData.dashboardData);
  let data = getdata.employeeDetails;
  const [leavesListData, setleavesListData] = useState();
  const [isloading, setisloading] = useState(false);
  const [maindata, setMainData] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    getHistory();
  }, []);
  const getHistory = async () => {
    setisloading(true);
    console.log(data?.employeeId);
    await leaveApi
      .leaveHistory(data?.employeeId)
      .then(result => {
        console.log(
          'response getting leave history',
          JSON.stringify(result.data, null, 2),
          // result,
        );
        setleavesListData(result?.data?.leaveHistoryDetails);
        setMainData(result?.data);
      })
      .catch(err => {
        console.log(
          'error getting leave history',
          err,
          // JSON.stringify(result?.data, null , 2),
        );
        Toast.show(err?.message || 'Error Getting History', Toast.SHORT);
      })
      .finally(function () {
        setisloading(false);
      });
  };
  // console.log(JSON.stringify(maindata.thisMonthLeaveCount,null,2) ,"main");
  function newDate(start, end) {
    let s = moment(start).format('YYYY-MM-DD');
    let e = moment(end).format('YYYY-MM-DD');
    let count = 0;
    for (
      var arr = [], dt = new Date(s);
      dt <= new Date(e);
      dt.setDate(dt.getDate() + 1)
    ) {
      count = count + 1;
      arr.push(moment(new Date(dt)).format('YYYY-MM-DD'));
    }
    return arr;
  }
  function totalAndRemainingLeaves() {
    const finalData = {totalLeaves: 0, remainingLeaves: 0};
    maindata?.previousLeaveHistory?.length
      ? maindata?.previousLeaveHistory?.map(item => {
          if (
            item.leaveTypeName != 'Short Leave' &&
            item.leaveTypeName != 'Half Day'
          ) {
            finalData.totalLeaves = item?.totalLeaves + finalData?.totalLeaves;
            finalData.remainingLeaves =
              item?.remainingLeaves > 0
                ? item?.remainingLeaves + finalData?.remainingLeaves
                : finalData?.remainingLeaves;
          }
        })
      : null;

    return finalData.remainingLeaves > 0
      ? finalData
      : {...finalData, remainingLeaves: 0};
  }
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Loader loading={isloading} />
        <Header
          title="Leave History"
          onBackPress={() => props.navigation.goBack()}
        />
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
              <RefreshControl refreshing={isloading} onRefresh={getHistory} />
            }>
            <View style={{marginBottom: hp(8)}}>
              <Text style={styles.previousReportText}>Balance</Text>
              <View style={styles.statsMainView}>
                <Text style={styles.monthText}>
                  Total Leaves{'\n'}
                  {totalAndRemainingLeaves()?.totalLeaves || 0}
                </Text>
                <Text style={styles.monthText}>
                  Remaining{'\n'}
                  {totalAndRemainingLeaves()?.remainingLeaves || 0}
                </Text>
                <Text style={[styles.monthText, {borderRightWidth: 0}]}>
                  {monthNames[month]} Month{'\n'}
                  {maindata?.thisMonthLeaveCount || 0} Leaves
                </Text>
              </View>
              <Text style={styles.previousReportText}>
                Type Wise Leave Balances
              </Text>
              <FlatList
                listKey="main"
                data={maindata?.previousLeaveHistory || []}
                // refreshing={isloading}
                // onRefresh={() => getHistory()}
                ListEmptyComponent={
                  <ListEmptyComponent emptyContainer={{height: hp(10)}} />
                }
                contentContainerStyle={{
                  paddingVertical: hp(2),
                  paddingHorizontal: 5,
                }}
                renderItem={({item, index}) => {
                  return (
                    <Card
                      style={[
                        styles.listParentView,
                        {backgroundColor: colors.primary},
                      ]}>
                      <View style={styles.listSubView}>
                        <Text
                          style={[styles.purposeText, {color: colors.white}]}>
                          {item?.leaveTypeName}
                        </Text>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          {item.leaveTypeName == 'Half Day' ||
                          item.leaveTypeName == 'Short Leave' ? (
                            <>
                              <Text style={styles.dateText}>
                                Availed Leaves
                              </Text>
                              <Text style={styles.leaveCountText}>
                                {item.availed}
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text style={styles.dateText}>
                                Availed Leaves
                              </Text>
                              <Text style={styles.leaveCountText}>
                                {item?.availed || 0} out of{' '}
                                {item?.totalLeaves || 0}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    </Card>
                  );
                }}
              />
              <Text style={styles.previousReportText}>Previous Leaves</Text>
              <FlatList
                listKey="main"
                data={leavesListData}
                // refreshing={isloading}
                // onRefresh={() => getHistory()}
                ListEmptyComponent={
                  <ListEmptyComponent emptyContainer={{height: hp(10)}} />
                }
                contentContainerStyle={{
                  paddingVertical: hp(2),
                  paddingHorizontal: 5,
                }}
                renderItem={({item, index}) => {
                  const totalLeaves = item?.approvedLeave?.split(',');
                  const approveStatus = item?.iS_APPROVED?.split(',') || [];
                  const approvedLength = approveStatus.filter(
                    item => item == '1',
                  );
                  const rejectLength = approveStatus.filter(
                    item => item == '0',
                  );
                  const statusOfThisLeave =
                    approvedLength.length == 0
                      ? 'Rejected'
                      : rejectLength.length == 0
                      ? 'Approved'
                      : 'Partial Approved';
                  const attachmentCheck = item?.attachment?.split(',');
                  return (
                    <Card style={styles.listParentView}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          leavesListData[index].isOpen
                            ? (leavesListData[index].isOpen = false)
                            : (leavesListData[index].isOpen = true);
                          setRefreshing(!refreshing);
                        }}
                        style={styles.listSubView}>
                        <Text style={styles.purposeText}>
                          {/* {item.leaveTypeName} */} Applied On{' '}
                          {item?.leaveRequestCREATED_DATE_TIME
                            ? item?.leaveRequestCREATED_DATE_TIME.split(' ')[0]
                            : ''}
                        </Text>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={styles.dateText}>
                            {statusOfThisLeave}
                          </Text>
                          <Icon
                            name={
                              statusOfThisLeave == 'Rejected'
                                ? 'close-circle'
                                : statusOfThisLeave == 'Approved'
                                ? 'check-circle'
                                : 'fraction-one-half'
                            }
                            type="material-community"
                            color={
                              statusOfThisLeave == 'Rejected'
                                ? colors.red
                                : statusOfThisLeave == 'Approved'
                                ? colors.green
                                : colors.primary
                            }
                            style={{marginLeft: wp(1)}}
                            size={hp(2.5)}
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
                              {item?.leaveTypeName}
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
                              Leave Application days
                            </Text>
                            <View style={{flexDirection: 'row'}}>
                              <FlatList
                                listKey="leavesDate"
                                numColumns={3}
                                data={totalLeaves}
                                renderItem={props => {
                                  return (
                                    <Text style={styles.leaveDatesText}>
                                      {props.item}
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
                            {item?.employeeComments
                              ? item?.employeeComments.split(',')[0]
                              : 'no description..'}
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
                          {approvedLength.length > 0 ? (
                            <>
                              <Text style={styles.approvedForText}>
                                Approved Leave dates
                              </Text>
                              <View style={{flexDirection: 'row'}}>
                                <FlatList
                                  listKey="approveDates"
                                  numColumns={3}
                                  data={item?.approvedLeave?.split(',')}
                                  renderItem={props => {
                                    if (approveStatus[props.index] == '1') {
                                      return (
                                        <Text style={styles.approvedDatesText}>
                                          {props.item}
                                        </Text>
                                      );
                                    } else {
                                      return null;
                                    }
                                  }}
                                />
                              </View>
                            </>
                          ) : null}
                          <Text style={styles.applicationForText}>
                            Team Lead Comment
                          </Text>
                          <Text style={styles.descText}>
                            {item?.teamLeadComments
                              ? item?.teamLeadComments.split(',')[0]
                              : 'No Comments'}
                          </Text>
                          <Text style={styles.applicationForText}>
                            Comments
                          </Text>
                          <Text style={styles.descText}>
                            {item?.admiN_COMMENTS
                              ? item?.admiN_COMMENTS.split(',')[0]
                              : 'No Comments'}
                          </Text>
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
                        </View>
                      ) : null}
                    </Card>
                  );
                }}
              />
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
  previousReportText: {
    color: colors.black,
    width: wp(80),
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
    width: wp(28),
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
    marginVertical: hp(0.2),
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.8),
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
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
  },
  leaveCountText: {
    backgroundColor: colors.white,
    color: colors.black,
    paddingHorizontal: wp(2),
    height: wp(5),
    borderRadius: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginLeft: wp(4),
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
    marginVertical: hp(0.2),
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.8),
    backgroundColor: colors.primary,
    paddingHorizontal: wp(1),
    marginHorizontal: wp(1),
    borderRadius: 5,
  },
  smallButton: {
    height: hp(4),
    borderRadius: 5,
    marginVertical: hp(1),
    elevation: 5,
  },
});
