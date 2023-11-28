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
import React from 'react';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import {colors} from '../../Utils/Colors';
import {useSelector} from 'react-redux';
import CustomButton from '../../Components/CustomButton';
import {Card, Provider} from 'react-native-paper';
import Header from '../../Components/Header';

export default function TeamReport(props) {
  const getDashboardData = useSelector(
    state => state.ConstantData.dashboardData,
  );
  const data = getDashboardData?.employeeDetails;
  const dataa = props?.route?.params?.dataa;
  console.log(dataa);

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Header
          title="Team Report"
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
                <Text style={styles.headerText}>Team Members</Text>
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
                      <ImageBackground
                        imageStyle={{
                          borderTopLeftRadius: 10,
                          borderTopRightRadius: 10,
                        }}
                        source={Images.back}
                        style={styles.listImage}
                        resizeMode="cover"></ImageBackground>
                      <Image
                        // source={Images.dummyUser}
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
                      {/* <Image source={Images.notification} style={{ height: 20, width: 20, position: 'absolute', zIndex: 100, alignSelf: 'flex-end', marginTop: hp(-1), backgroundColor: 'white', borderRadius: 100 }} /> */}
                      <View>
                        <Text style={styles.listNameText}>
                          {item?.teamMemberName}
                        </Text>
                        <View style={styles.leaveCountView}>
                          <Text style={styles.leaveCountText}>
                            Total Leaves:{' '}
                          </Text>
                          <Text style={styles.leaveDigitText}>
                            {item?.leaveCount}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          position: 'absolute',
                          bottom: 0,
                          alignSelf: 'center',
                          marginBottom: hp(1),
                          alignItems: 'center',
                        }}>
                        <CustomButton
                          isLoading={false}
                          name={'Performance'}
                          buttonStyles={styles.submitButton}
                          textStyles={{fontSize: hp(1.3)}}
                          onPress={() =>
                            props.navigation.navigate('MemberPerfomanceForm', {
                              data: item,
                            })
                          }
                        />
                        <CustomButton
                          isLoading={false}
                          name={'Evaluation'}
                          buttonStyles={[
                            styles.submitButton,
                            {marginLeft: wp(1)},
                          ]}
                          textStyles={{fontSize: hp(1.3)}}
                          onPress={() =>
                            props.navigation.navigate('Evaluation', {
                              data: item,
                            })
                          }
                        />
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
  mainContainerImage: {
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
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(3),
  },
  subView: {
    flex: 1,
    alignItems: 'center',
    paddingTop: hp(2),
    backgroundColor: colors.white,
    borderTopRightRadius: hp(5),
    borderTopLeftRadius: hp(5),
  },
  submitButton: {
    width: wp(19),
    zIndex: 100,
    height: hp(4),
    borderRadius: 4,
    alignSelf: 'center',
  },
  headerText: {
    color: colors.primary,
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2.5),
  },
  listContainer: {
    backgroundColor: colors.white,
    width: wp(42),
    minHeight: hp(28),
    borderRadius: hp(2),
    marginHorizontal: wp(1),
    marginVertical: hp(1),
  },
  profile: {
    height: hp(10),
    width: hp(10),
    borderRadius: 100,
    borderColor: colors.white,
    borderWidth: 3,
    marginTop: hp(-4),
    alignSelf: 'center',
  },
  listImage: {
    height: hp(7),
  },
  listNameText: {
    paddingLeft: wp(2),
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
  },
  leaveCountText: {
    color: colors.black,
    // fontFamily: 'Poppins-Bold',
    fontSize: hp(1.4),
    fontWeight: '700',
  },
  leaveDigitText: {
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.4),
  },
});
