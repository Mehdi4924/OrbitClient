import React, {useEffect, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import CustomButton from '../../Components/CustomButton';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';

import Loader from '../../Components/Loader';
import {Icon} from '@rneui/base';
import Header from '../../Components/Header';
import {Provider} from 'react-native-paper';
import {members} from '../../Utils/Apis/ApiCalls';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import {useFocusEffect} from '@react-navigation/native';

export default function MemberPerfomanceForm(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [performance, setPerformance] = useState([]);
  let propsData = props?.route?.params?.data;

  console.log(propsData);

  useFocusEffect(
    React.useCallback(() => {
      getHistory();
    }, []),
  );

  const getHistory = async () => {
    members
      .getMemberPerformance(propsData?.employeeId || 0)
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
      <SafeAreaView style={styles.container}>
        <Loader loading={false} />
        <Header
          title="Perfomence History"
          icon={true}
          onBackPress={() => props.navigation.goBack()}
        />
        <View style={styles.mainContainerImage}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={
                propsData?.profilePic &&
                propsData.profilePic != 'http://15.185.185.85:40/'
                  ? {
                      uri: propsData.profilePic,
                    }
                  : Images.dummyUser
              }
              style={styles.userImage}
            />
            <View style={{marginLeft: wp(5)}}>
              <Text style={styles.nameText}>{propsData?.teamMemberName}</Text>
              <Text style={styles.nameText}>{propsData?.designation}</Text>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{marginBottom: hp(8)}}>
              <View style={styles.applyLoanView}>
                <Text style={styles.reportText}>Member Perfromance</Text>
                <CustomButton
                  isLoading={false}
                  name={'Add Record'}
                  buttonStyles={styles.submitButton}
                  textStyles={{color: colors.white, fontSize: hp(1.6)}}
                  onPress={() =>
                    props.navigation.navigate('AddPerformance', {
                      data: propsData,
                    })
                  }
                />
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
                            style={{marginLeft: wp(2)}}
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
  container: {flex: 1, backgroundColor: colors.primary, zIndex: 1},
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
    backgroundColor: colors.white,
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
  applyLoanView: {
    width: wp(90),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportText: {
    color: colors.primary,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2.5),
  },
  submitButton: {
    backgroundColor: colors.primary,
    elevation: 0,
    borderRadius: 5,
    width: wp(22),
    height: hp(4),
    alignSelf: 'center',
  },
  //performance list
  listParentView: {
    backgroundColor: colors.white,
    marginVertical: hp(0.5),
    elevation: 5,
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
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.6),
    width: wp(50),
  },
  listSeverityView: {flexDirection: 'row', alignItems: 'center'},
  listSeverityText: {
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
  },
  listSuggestionText: {
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.8),
  },
  listDateText: {
    color: colors.primary,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.8),
  },
});
