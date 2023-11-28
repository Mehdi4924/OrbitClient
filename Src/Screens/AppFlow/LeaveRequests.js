import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import {colors} from '../../Utils/Colors';
import {useSelector} from 'react-redux';
import CustomButton from '../../Components/CustomButton';
import {Card, Provider} from 'react-native-paper';
import Header from '../../Components/Header';
import {members} from '../../Utils/Apis/ApiCalls';
import ListEmptyComponent from '../../Components/ListEmptyComponent';

export default function TeamReport(props) {
  const getDashboardData = useSelector(
    state => state.ConstantData.dashboardData,
  );
  const [dataa, setDataa] = useState([]);
  const data = getDashboardData?.employeeDetails;

  console.log(dataa);
  useEffect(() => {
    getLeaveRequests();
  }, []);
  async function getLeaveRequests() {
    await members
      .getAllLeaveRequests()
      .then(res => {
        console.log('success getting all leave requests', res);
        setDataa(res?.data);
      })
      .catch(err => {
        console.log('error getting all leave requests', err);
      })
      .finally(function () {});
  }
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Header
          title="Pending Requests"
          icon={true}
          onBackPress={() => props.navigation.goBack()}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginVertical: hp(2),
          }}>
          <Image
            source={data?.photo ? {uri: data?.photo} : Images.dummyUser}
            style={styles.userImage}
          />
          <View style={{marginLeft: wp(5)}}>
            <Text style={styles.nameText}>
              {getDashboardData.employeeDetails?.employeeName}
            </Text>
            <Text style={styles.nameText}>
              {getDashboardData.employeeDetails?.designation}
            </Text>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <FlatList
              data={dataa}
              contentContainerStyle={{paddingVertical: hp(2)}}
              ListHeaderComponent={
                <Text style={styles.headerText}>Member Requests</Text>
              }
              ListEmptyComponent={
                <ListEmptyComponent emptyContainer={{marginTop: hp(20)}} />
              }
              numColumns={2}
              renderItem={({item, index}) => {
                return (
                  <Card
                    style={{
                      backgroundColor: colors.white,
                      marginHorizontal: wp(1),
                      marginVertical: hp(1),
                    }}>
                    <Pressable
                      onPress={() =>
                        props.navigation.navigate('MemberAttendance', {
                          data: item,
                        })
                      }
                      activeOpacity={0.7}
                      style={styles.listContainer}>
                      <Image
                        source={
                          item?.profilePic &&
                          item.profilePic != 'http://15.185.185.85:40/'
                            ? {
                                uri: item?.profilePic,
                              }
                            : Images.dummyUser
                        }
                        style={styles.profile}
                      />
                      <View>
                        <Text style={styles.listNameText}>
                          {item?.teamMemberName}
                        </Text>
                        <View style={styles.leaveCountView}>
                          <Text style={styles.leaveCountText}>
                            Unapproved Leaves:{' '}
                          </Text>
                          <Text style={styles.leaveDigitText}>
                            {item?.unApprovedLeaveCount}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </Card>
                );
              }}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary},
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
  subView: {
    flex: 1,
    alignItems: 'center',
    paddingTop: hp(2),
    backgroundColor: colors.white,
    borderTopRightRadius: hp(5),
    borderTopLeftRadius: hp(5),
  },
  headerText: {
    color: colors.primary,
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2.5),
  },
  listContainer: {
    backgroundColor: colors.white,
    width: wp(40),
    minHeight: hp(5),
    borderRadius: hp(2),
    marginHorizontal: wp(1),
    marginVertical: hp(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    height: hp(10),
    width: hp(10),
    borderRadius: 100,
    borderColor: colors.black,
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: hp(1.5),
  },
  listNameText: {
    color: colors.black,
    width: wp(35),
    fontWeight: '700',
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.5),
  },
  leaveCountView: {
    // width: wp(40),
    flexDirection: 'row',
    paddingHorizontal: wp(2),
    alignSelf: 'center',
    alignItems: 'center',
  },
  leaveCountText: {
    color: colors.black,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.4),
  },
  leaveDigitText: {
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.4),
  },
});
