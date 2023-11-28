import {Icon} from '@rneui/base';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import DatePicker from '../../Components/DatePicker';
import {AttendenceApi} from '../../Utils/Apis/ApiCalls';
import {useSelector} from 'react-redux';
import Loader from '../../Components/Loader';
import Toast from 'react-native-simple-toast';
import {Card, Provider} from 'react-native-paper';
import Header from '../../Components/Header';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
let dateNow = '';
export default function AttendanceReport(props) {
  let a = props?.route?.params?.data;
  const getdata = useSelector(state => state.ConstantData.dashboardData);
  let data = getdata.employeeDetails;
  const [timesheet, setTimeSheet] = useState([]);
  const [isloading, setisloading] = useState(false);
  useEffect(() => {
    let date = new Date();
    let a = moment(date)?.format('YYYY-MM-DD');
    getAttendence(a);
  }, []);

  const getAttendence = date => {
    dateNow = date;
    setisloading(true);
    let body = {
      Date: date,
      EmployeeId: getdata?.employeeDetails?.employeeId,
    };
    AttendenceApi.attandenceReport(body)
      .then(result => {
        console.log(result, 'success response getting attendance report');
        setTimeSheet(result?.data?.data);
        setisloading(false);
      })
      .catch(err => {
        setisloading(false);
        Toast.show(err?.message, Toast.SHORT);
        console.log(JSON.stringify(err, null, 2));
      });
  };
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Loader loading={isloading} />
          <Header title="Attendance Report" />
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{marginBottom: hp(4), padding: hp(1)}}>
              <DatePicker
                onDatePress={date => {}}
                dayShown={true}
                hideDayNames={true}
                onMonthChange={date => getAttendence(date)}
              />
              <Text style={styles.previousReportText}>Time Sheet</Text>
              <Card
                elevation={5}
                style={{backgroundColor: colors.white, marginTop: 10}}>
                <FlatList
                  refreshing={isloading}
                  onRefresh={() => getAttendence(dateNow)}
                  data={timesheet}
                  contentContainerStyle={styles.timeSheetContainer}
                  ListHeaderComponent={() => {
                    return timesheet.length > 0 ? (
                      <View style={styles.checkInOutView}>
                        <Text style={styles.checkInText}>Date</Text>
                        <Text style={styles.checkInText}>Check In</Text>
                        <Text style={styles.checkInText}>Check Out</Text>
                        <Text style={styles.checkInText}>W/H</Text>
                      </View>
                    ) : null;
                  }}
                  ListEmptyComponent={
                    <ListEmptyComponent emptyContainer={{height: hp(10)}} />
                  }
                  renderItem={({item, index}) => {
                    return (
                      <View
                        style={[
                          styles.checkInOutView,
                          {marginVertical: hp(0.7)},
                        ]}>
                        <Text style={styles.dateTextTimeSHeet}>
                          {item?.date || ''}
                        </Text>
                        <Text style={styles.checkTime}>
                          {item?.checkIn || ''}
                        </Text>
                        <Text style={styles.checkTime}>
                          {item?.checkOut || ''}
                        </Text>
                        <Text style={styles.checkTime}>
                          {item?.duration} Hrs
                        </Text>
                      </View>
                    );
                  }}
                />
              </Card>
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
    backgroundColor: 'lightgrey',
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
  previousReportText: {
    color: colors.black,
    width: wp(80),
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
    fontSize: hp(2),
  },
  monthText: {
    color: colors.white,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.8),
    textAlignVertical: 'center',
    textAlign: 'center',
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
    width: wp(18),
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
    width: wp(18),
    textAlignVertical: 'center',
    textAlign: 'center',
    color: colors.black,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.5),
  },
  checkTime: {
    width: wp(18),
    textAlignVertical: 'center',
    textAlign: 'center',
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
  },
});
