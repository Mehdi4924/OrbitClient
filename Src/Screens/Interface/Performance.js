import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
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
import Loader from '../../Components/Loader';
import {Icon} from '@rneui/base';
import {members} from '../../Utils/Apis/ApiCalls';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import {useSelector} from 'react-redux';
import {Card, Provider} from 'react-native-paper';
import Header from '../../Components/Header';

export default function Performance(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [performance, setPerformance] = useState([]);
  const authUserData = useSelector(state => state.ConstantData.dashboardData);
  let data = authUserData.employeeDetails;

  useEffect(() => {
    getHistory();
  }, []);
  const getHistory = async () => {
    setIsLoading(true);
    members
      .getMemberPerformance(authUserData?.employeeDetails?.employeeId || 0)
      .then(res => {
        console.log('Success Getting Member Performance', res);
        setPerformance(res?.data?.message);
      })
      .catch(err => {
        console.log('Error Getting Member Performance', err);
      })
      .finally(function () {
        setIsLoading(false);
      });
  };
  return (
    <Provider>
      <View style={styles.container}>
        <Header title="Performance" />
        <Loader loading={isLoading} />
        <View style={styles.mainContainerImage}>
          {/* <Text style={styles.profileText}>Performance</Text> */}
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
              <RefreshControl refreshing={isLoading} onRefresh={getHistory} />
            }>
            <View style={{marginBottom: hp(8)}}>
              <View style={styles.applyLoanView}>
                <Text style={styles.reportText}>Performance</Text>
              </View>
              <FlatList
                listKey="main"
                data={performance}
                contentContainerStyle={{
                  paddingVertical: hp(2),
                  paddingHorizontal: 5,
                }}
                ListEmptyComponent={<ListEmptyComponent />}
                renderItem={({item, index}) => {
                  return (
                    <Card style={{backgroundColor: colors.white, marginTop: 4}}>
                      <TouchableOpacity
                        style={styles.listParentView}
                        onPress={() => {
                          const newData = [...performance];
                          newData[index].isOpen
                            ? (newData[index].isOpen = false)
                            : (newData[index].isOpen = true);
                          setPerformance(newData);
                        }}>
                        <View style={styles.listCloseView}>
                          <Text style={styles.listStatementText}>
                            {item.problem}
                          </Text>
                          <View style={styles.listSeverityView}>
                            <Text style={styles.listSeverityText}>
                              Severity: {item.severity}
                            </Text>
                            <Icon
                              name="radiobox-marked"
                              type="material-community"
                              color={
                                item.severity == 'Low'
                                  ? colors.black
                                  : item.severity == 'Severe'
                                  ? colors.primary
                                  : item.severity == 'Medium'
                                  ? colors.grey
                                  : colors.red
                              }
                              size={hp(2)}
                            />
                          </View>
                        </View>
                        {item?.isOpen ? (
                          <View style={{marginTop: hp(1)}}>
                            <Text style={styles.listSuggestionText}>
                              {item.suggestion}
                            </Text>
                            <Text style={styles.listDateText}>
                              <Text>Listed On: </Text>
                              {item.updatedDateTime.split('T')[0]}
                            </Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    </Card>
                  );
                }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
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
    backgroundColor: colors.grey,
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
    width: wp(100),
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    backgroundColor: colors.white,
    borderTopRightRadius: hp(5),
    borderTopLeftRadius: hp(5),
  },
  applyLoanView: {
    width: wp(90),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportText: {
    color: colors.primary,
    // fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    fontSize: hp(2.5),
  },
  //performance list
  listParentView: {
    backgroundColor: colors.white,
    marginVertical: hp(0.5),
    borderRadius: 10,
    padding: 10,
  },
  listCloseView: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listStatementText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: hp(1.6),
    width: wp(45),
  },
  listSeverityView: {
    width: wp(38),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
  },
  listSeverityText: {
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
  },
  listSuggestionText: {
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.5),
  },
  listDateText: {
    color: colors.primary,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.5),
    marginVertical: hp(1),
  },
});
