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
  FlatList,
  Platform,
} from 'react-native';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import Toast from 'react-native-simple-toast';
import {hp, wp} from '../../Utils/Responsive';
import Loader from '../../Components/Loader';
import {Provider} from 'react-native-paper';
import Header from '../../Components/Header';
import {useSelector} from 'react-redux';
import {members} from '../../Utils/Apis/ApiCalls';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import {Icon} from '@rneui/base';
import moment from 'moment';

export default function Notifications(props) {
  const getdata = useSelector(state => state.ConstantData.dashboardData);
  const hrDetails = getdata?.hrLeadDetails;
  console.log(hrDetails);
  const data = getdata.employeeDetails;
  const [isloading, setisloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [notificationTypes, setNotificationTypes] = useState([]);

  useEffect(() => {
    getNotificationTypes();
  }, []);
  const onRefresh = React.useCallback(() => {
    getNotifications(notificationTypes);
  }, []);
  async function getNotificationTypes() {
    setisloading(true);
    await members
      .getNotificationTypes()
      .then(res => {
        console.log('success getting notification types', res);
        if (res?.data?.data?.length > 0) {
          setNotificationTypes(res.data.data);
          getNotifications(res?.data?.data);
        }
      })
      .catch(err => {
        console.log('error getting notification types', err);
        setisloading(false);
      });
  }
  async function getNotifications(typeData) {
    const newTypeData = [...typeData].map(item => item.id);
    setRefreshing(true);
    const sendingdata = {
      EmployeeId: data?.employeeId,
      TypeIds: newTypeData,
      pageNo: 0,
      pageSize: 5,
    };
    await members
      .getNotifications(sendingdata)
      .then(res => {
        console.log('success getting notification', res);
        if (res?.data?.isError) {
          Toast.show(res?.data?.message, Toast.SHORT);
        } else {
          const finalDataArray = [];
          const dataObj = res?.data?.notifications;
          const keys = Object.keys(dataObj);
          for (let i = 0; i < keys.length; i++) {
            const thisItem = dataObj[keys[i]];

            if (thisItem && thisItem?.length && keys[i] != 'details') {
              if (
                keys[i] == 'chatsWithHrNotifications' &&
                thisItem.length > 0
              ) {
                const messageCopy = thisItem[0];
                finalDataArray.push({...messageCopy, type: keys[i]});
              } else if (
                keys[i] == 'evaluationReportNotifications' &&
                thisItem.length > 0
              ) {
                const messageCopy = thisItem[0];
                finalDataArray.push({...messageCopy, type: keys[i]});
              } else {
                thisItem.map(item => {
                  finalDataArray.push({...item, type: keys[i]});
                });
              }
            }
          }
          finalDataArray.sort(function (a, b) {
            return a.createdDateTime < b.createdDateTime ? 1 : -1;
          });
          setNotificationData(finalDataArray);
        }
      })
      .catch(err => {
        console.log('error getting notification ', err);
      })
      .finally(function () {
        setRefreshing(false);
        setisloading(false);
      });
  }
  function TitleFinder(item) {
    switch (item?.type) {
      case 'hrApprovedLeavesNotifications':
        return item?.title || 'Leave Approved';
      case 'hrRejectedLeavesNotifications':
        return item?.title || 'Leave Rejected';
      case 'chatsWithHrNotifications':
        return 'Chat Message Recieved From HR';
      case 'pendingLeavesNotifications':
        return item?.title || 'Leave Application';
      case 'tlApprovedLeavesNotifications':
        return 'Leave Application Approved By Team Lead';
      case 'evaluationReportNotifications':
        return item?.title || 'Evaluation Report Generated';
      case 'memberPerformanceNotifications':
        return item?.title || 'Performance Report Generated';
      case 'appliedLoanNotifications':
        return item?.title || 'Loan has been requested';
      case 'tlRejectedLeavesNotifications':
        return item?.title || 'Leave request rejected by Team Lead ';
      default:
        return 'New Notification';
    }
  }
  function DescFinder(item) {
    switch (item?.type) {
      case 'hrApprovedLeavesNotifications':
        return item?.message || 'Leave approved';
      case 'hrRejectedLeavesNotifications':
        return item?.message || 'Leave Rejected';
      case 'chatsWithHrNotifications':
        return item.lastChatMessage || 'Message';
      case 'pendingLeavesNotifications':
        return item?.message || 'Leave application was submitted successfully';
      case 'tlApprovedLeavesNotifications':
        return item?.message || 'Leave application approved by Team Lead';
      case 'evaluationReportNotifications':
        console.log(item);
        const description = item.message.split('and he/she');
        return description.length > 0
          ? description[0]
          : 'Your Evaluation Report has been generated by Team Lead';
      case 'memberPerformanceNotifications':
        return (
          item?.message || 'Performance Report has been generated by Team Lead'
        );
      case 'appliedLoanNotifications':
        return `Your loan application of Rs.${item?.totaL_AMOUNT} was submitted to HR.`;
      case 'tlRejectedLeavesNotifications':
        return (
          item?.message || 'Your leave request was rejected by the team lead'
        );

      default:
        return 'New Notification Was Recieved';
    }
  }
  function navigateToScreen(item) {
    item?.type == 'hrApprovedLeavesNotifications'
      ? props.navigation.navigate('AppFlow', {
          screen: 'LeaveHistory',
        })
      : item?.type == 'chatsWithHrNotifications'
      ? props.navigation.navigate('ChatScreen', {
          data: {
            fcm: hrDetails?.fcmToken,
            id: hrDetails?.aspNetUserId,
            photo: hrDetails?.photo,
            name: hrDetails?.employeeName,
            roleName: hrDetails?.roleName,
          },
        })
      : item?.type == 'appliedLoanNotifications'
      ? props.navigation.navigate('LoanStats')
      : item?.type == 'evaluationReportNotifications'
      ? null
      : item?.type == 'hrRejectedLeavesNotifications'
      ? props.navigation.navigate('AppFlow', {
          screen: 'LeaveHistory',
        })
      : item?.type == 'memberPerformanceNotifications'
      ? props.navigation.navigate('AppFlow', {
          screen: 'Performance',
        })
      : item?.type == 'pendingLeavesNotifications'
      ? props.navigation.navigate('AppFlow', {
          screen: 'LeaveHistory',
        })
      : item?.type == 'tlApprovedLeavesNotifications'
      ? props.navigation.navigate('AppFlow', {
          screen: 'LeaveHistory',
        })
      : item?.type == 'tlRejectedLeavesNotifications'
      ? props.navigation.navigate('AppFlow', {
          screen: 'LeaveHistory',
        })
      : props.navigation.navigate('AppFlow', {
          screen: 'Dashboard',
        });
  }
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        {console.log('data', notificationData)}
        <Loader loading={isloading} />
        <Header
          title="Notifications"
          icon
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
          <View style={{marginBottom: hp(1)}}>
            <FlatList
              data={notificationData}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={<ListEmptyComponent />}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    style={styles.listContainer}
                    onPressIn={() =>
                      Platform.OS == 'ios' ? navigateToScreen(item) : null
                    }
                    onPress={() =>
                      Platform.OS == 'android' ? navigateToScreen(item) : null
                    }>
                    <View>
                      <Icon
                        name={
                          item?.type == 'hrApprovedLeavesNotifications'
                            ? 'text-box-check'
                            : item?.type == 'chatsWithHrNotifications'
                            ? 'message-badge'
                            : item?.type == 'appliedLoanNotifications'
                            ? 'charity'
                            : item?.type == 'evaluationReportNotifications'
                            ? 'chart-timeline-variant-shimmer'
                            : item?.type == 'hrRejectedLeavesNotifications'
                            ? 'note-minus'
                            : item?.type == 'memberPerformanceNotifications'
                            ? 'file-chart'
                            : item?.type == 'pendingLeavesNotifications'
                            ? 'account-clock'
                            : item?.type == 'tlApprovedLeavesNotifications'
                            ? 'account-check'
                            : item?.type == 'tlRejectedLeavesNotifications'
                            ? 'account-remove'
                            : 'bell'
                        }
                        type="material-community"
                        color={colors.primaryLight}
                        size={hp(2)}
                        reverse
                      />
                      <Text style={styles.listTimeText}>
                        {moment(item.createdDateTime)?.local()?.fromNow()}
                      </Text>
                    </View>

                    <View style={{width: wp(68)}}>
                      <Text style={styles.listTitleText}>
                        {TitleFinder(item)}
                      </Text>
                      <Text style={styles.listDescText}>
                        {DescFinder(item)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
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
  listContainer: {
    width: wp(90),
    backgroundColor: colors.lightGray,
    paddingHorizontal: wp(3),
    marginVertical: hp(1),
    paddingVertical: hp(1),
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listImage: {
    width: wp(5),
    height: wp(5),
  },
  listTitleText: {
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.7),
  },
  listDescText: {
    color: colors.black,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.7),
  },
  listTimeText: {
    color: colors.primary,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.2),
    alignSelf: 'center',
  },
});
