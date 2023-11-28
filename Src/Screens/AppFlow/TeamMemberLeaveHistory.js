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
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';

import {useSelector} from 'react-redux';

import Loader from '../../Components/Loader';
import Toast from 'react-native-simple-toast';
import moment from 'moment';
import {leaveApi} from '../../Utils/Apis/ApiCalls';
import {Provider} from 'react-native-paper';

export default function TeamMemberLeaveHistory(props) {
  const getdata = useSelector(state => state.ConstantData.dashboardData);
  let data = getdata.employeeDetails;
  // console.log(data.employeeId);

  const [leavesListData, setleavesListData] = useState();
  const [isloading, setisloading] = useState(false);
  const [maindata, setMainData] = useState();
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    getHistory();
  }, []);

  const getHistory = async () => {
    let pro = props?.route?.params?.data;
    console.log(pro.employeeId);
    setisloading(true);
    await leaveApi
      .leaveHistory(pro?.employeeId)
      .then(result => {
        console.log(
          'team member attendance getting',
          // JSON.stringify(result?.data, null, 2),
          result,
        );
        setleavesListData(result?.data.leaveHistoryDetails);
        setMainData(result?.data);
        setisloading(false);
      })
      .catch(err => {
        console.log(err);
        setisloading(false);
        Toast.show(err.message, Toast.SHORT);
        // console.log(err);
      });
  };
  function newDate(start, end) {
    let s = moment(start).format('YYYY-MM-DD');
    let e = moment(end).format('YYYY-MM-DD');
    // console.log(s, e);
    let count = 0;
    for (
      var arr = [], dt = new Date(s);
      dt <= new Date(e);
      dt.setDate(dt.getDate() + 1)
    ) {
      count = count + 1;
      arr.push(moment(new Date(dt)).format('YYYY-MM-DD'));
    }
    // console.log(arr);
    return arr;
  }

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Loader loading={isloading} />
        <View style={styles.mainContainerImage}>
          <Text style={styles.profileText}>Previous Leave History</Text>
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{marginBottom: hp(8)}}>
              {/* <Text style={styles.reportText}>Previous Leave History</Text> */}

              <Text style={styles.previousReportText}>Previous Leaves</Text>
              <FlatList
                listKey="main"
                data={leavesListData}
                refreshing={isloading}
                onRefresh={() => getHistory()}
                contentContainerStyle={{
                  paddingVertical: hp(2),
                  paddingHorizontal: 5,
                }}
                renderItem={({item, index}) => {
                  return (
                    <View style={styles.listParentView}>
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
                          {item.leaveTypeName}
                        </Text>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={styles.dateText}>
                            {newDate(item?.applY_FROM_DATE, item?.applY_TO_DATE)
                              ?.length ==
                            item?.approvedLeave?.split(',')?.length
                              ? 'Approved'
                              : newDate(
                                  item?.applY_FROM_DATE,
                                  item?.applY_TO_DATE,
                                )?.length >
                                item?.approvedLeave?.split(',')?.length
                              ? 'Partialy Approved'
                              : 'decline'}
                          </Text>
                          <Icon
                            name={
                              item.iS_APPROVED ? 'check-circle' : 'close-circle'
                            }
                            type="material-community"
                            color={
                              item.iS_APPROVED ? colors.primary : colors.red
                            }
                            style={{marginLeft: wp(1)}}
                            size={hp(2.5)}
                          />
                        </View>
                      </TouchableOpacity>
                      {item.isOpen ? (
                        <View>
                          <View>
                            <Text style={styles.applicationForText}>
                              Leave Application days
                            </Text>
                            <View style={{flexDirection: 'row'}}>
                              <FlatList
                                listKey="leavesDate"
                                numColumns={3}
                                data={newDate(
                                  item?.applY_FROM_DATE,
                                  item?.applY_TO_DATE,
                                )}
                                renderItem={({item, index}) => {
                                  return (
                                    <Text style={styles.leaveDatesText}>
                                      {item}
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
                            {item?.employeE_COMMENTS
                              ? item.employeE_COMMENTS
                              : 'no description..'}
                          </Text>
                          {item?.iS_APPROVED ? (
                            <>
                              <Text style={styles.approvedForText}>
                                Approved Leave dates
                              </Text>
                              <View style={{flexDirection: 'row'}}>
                                <FlatList
                                  listKey="approveDates"
                                  numColumns={3}
                                  data={item?.approvedLeave?.split(',')}
                                  renderItem={({item, index}) => {
                                    return (
                                      <Text style={styles.approvedDatesText}>
                                        {item}
                                      </Text>
                                    );
                                  }}
                                />
                              </View>
                            </>
                          ) : null}
                          <Text style={styles.applicationForText}>
                            Team Lead Comment
                          </Text>
                          <Text style={styles.descText}>
                            {item.teamLeadComments || 'No Comments'}
                          </Text>
                          <Text style={styles.applicationForText}>
                            Comments
                          </Text>
                          <Text style={styles.descText}>
                            {item.comments || 'No Comments'}
                          </Text>
                          {item?.attachemnt != '' ? (
                            <CustomButton
                              isLoading={false}
                              name={'Download Attachment'}
                              buttonStyles={styles.smallButton}
                              textStyles={{fontSize: hp(1.5)}}
                              onPress={() =>
                                props.navigation.replace('AppFlow')
                              }
                            />
                          ) : null}
                        </View>
                      ) : null}
                    </View>
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
    height: hp(40),
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
    height: hp(80),
    width: wp(100),
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    position: 'absolute',
    bottom: 0,
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
    color: colors.black,
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
