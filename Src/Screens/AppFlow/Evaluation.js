import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Loader from '../../Components/Loader';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import {colors} from '../../Utils/Colors';
import CustomTextInput from '../../Components/CustomTextInputs';
import CustomButton from '../../Components/CustomButton';
import Header from '../../Components/Header';
import {Provider} from 'react-native-paper';
import {members, sendNotification} from '../../Utils/Apis/ApiCalls';
import Toast from 'react-native-simple-toast';
const sampleData = [
  {
    title: 'Job Knowledge',
    answer: '',
    comments: '',
    rating: '',
  },
  {
    title: 'Work Quality',
    answer: '',
    comments: '',
    rating: '',
  },
  {
    title: 'Attendance Punctuality',
    answer: '',
    comments: '',
    rating: '',
  },
  {
    title: 'Initiative',
    answer: '',
    comments: '',
    rating: '',
  },
  {
    title: 'Communication/Listening Skills',
    answer: '',
    comments: '',
    rating: '',
  },
  {
    title: 'Dependablity',
    answer: '',
    comments: '',
    rating: '',
  },
];
export default function Evaluation(props) {
  const [isloading, setisloading] = useState(false);
  const [btnLoading, setbBtnLoading] = useState(false);
  const [listData, setListData] = useState(sampleData || []);
  const [additionalComments, setAdditionalComments] = useState('');
  const userData = props?.route?.params?.data;
  console.log(userData);
  useEffect(() => {
    getEvalutionParameters();
  }, []);
  async function getEvalutionParameters() {
    let finalArr = [];
    members
      .evaluationParams()
      .then(res => {
        console.log('success getting evaluation paramteres', res);
        if (res?.data?.data?.length) {
          res?.data?.data.map(item => {
            finalArr.push({
              id: item.id,
              title: item.parameter,
              answer: '',
              rating: '',
            });
          });
        }
        setListData(finalArr);
      })
      .catch(err => {
        console.log('error getting evaluation paramteres', err);
      })
      .finally(function () {
        setisloading(false);
      });
  }

  function GetRating() {
    let finalRating = 0;
    listData.map(item => {
      if (item.rating != '') {
        finalRating = parseInt(item.rating) + finalRating;
      }
    });
    return finalRating;
  }

  function FindEmpty() {
    const index = listData.findIndex(
      item => item.answer == '' || item.rating == '',
    );
    return index;
  }
  async function postEvaluation() {
    const a = FindEmpty();
    if (a != -1 || additionalComments == '') {
      Toast.show(
        'Please Fill All Metrics, With Additional Comments',
        Toast.SHORT,
      );
    } else {
      setbBtnLoading(true);
      const newArr = [];
      listData.map(item => {
        newArr.push({
          EmployeeId: userData?.employeeId,
          EvaluationParameterId: item?.id,
          Comments: item?.answer,
          EvaluationScore: parseInt(item?.rating),
        });
      });
      const data = {
        AdditionalComments: additionalComments,
        EvaluationReport: newArr,
      };
      console.log('data posting', data);
      members
        .createEvaluation(data)
        .then(res => {
          Toast.show('Evaluation added Successfully', Toast.SHORT);
          sendNotificationData();
          // console.log('success posting evaluation paramteres', res);
          props.navigation.goBack();
        })
        .catch(err => {
          Toast.show(err.message, Toast.SHORT);
          console.log('error posting evaluation paramteres', err);
        })
        .finally(function () {
          setbBtnLoading(true);
        });
    }
  }

  const sendNotificationData = () => {
    const dat = {
      registration_ids: [`${userData?.fcmToken}`],
      collapse_key: 'type_a',
      notification: {
        title: `Evaluation Rated`,
        body: `Your team leam added your Evaluation`,
      },

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
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Loader loading={isloading} />
        <Header
          title="Monthly Evaluation"
          icon={true}
          onBackPress={() => props.navigation.goBack()}
        />

        <View style={styles.mainContainerImage}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={
                userData?.profilePic &&
                userData.profilePic != 'http://15.185.185.85:40/'
                  ? {uri: userData.profilePic}
                  : Images.dummyUser
              }
              style={styles.userImage}
            />
            <View style={{marginLeft: wp(5)}}>
              <Text style={styles.nameText}>{userData?.teamMemberName}</Text>
              <Text style={styles.nameText}>
                Team Lead: {userData?.leadName}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{marginBottom: hp(8)}}>
              <Text style={styles.previousReportText}>Evaluation</Text>
              <FlatList
                data={listData}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{marginTop: hp(2)}}
                renderItem={({item, index}) => {
                  return (
                    <>
                      <Text style={styles.listParameterName}>{item.title}</Text>
                      <CustomTextInput
                        multiline={true}
                        mainView={styles.mainView}
                        textInputStyles={[styles.textInputStyles]}
                        value={item.answer}
                        onChangeText={text => {
                          const newData = [...listData];
                          newData[index].answer = text;
                          setListData(newData);
                        }}
                        placeholder={`${item.title} Comments`}
                        keyboardType={'default'}
                      />
                      <View style={styles.listParameterView}>
                        {['1', '2', '3', '4', '5'].map(rangeData => {
                          return (
                            <TouchableOpacity
                              onPress={() => {
                                const newData = [...listData];
                                newData[index].rating = rangeData;
                                setListData(newData);
                              }}>
                              <Text
                                key={rangeData}
                                style={[
                                  styles.listRangeText,
                                  {
                                    backgroundColor:
                                      item.rating != '' &&
                                      item.rating == rangeData
                                        ? colors.primary
                                        : colors.grey,
                                  },
                                ]}>
                                {rangeData}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  );
                }}
              />

              <View style={styles.bottomView}>
                <Text style={styles.totalRatingText}>Total Rating</Text>
                <Text style={styles.ratingValueText}>{GetRating()}</Text>
              </View>
              <CustomTextInput
                mainView={styles.mainView}
                textInputStyles={styles.textInputStyles}
                value={additionalComments}
                onChangeText={text => {
                  setAdditionalComments(text);
                }}
                placeholder={'Additional  Comments'}
              />
              <CustomButton
                isLoading={btnLoading}
                name={'Submit'}
                buttonStyles={[styles.submitButton, {marginLeft: wp(1)}]}
                textStyles={{fontSize: hp(2)}}
                onPress={() => postEvaluation()}
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
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    backgroundColor: colors.primaryLight,
  },
  userImage: {
    height: hp(10),
    width: hp(10),
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
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    backgroundColor: colors.white,
    borderTopRightRadius: hp(5),
    borderTopLeftRadius: hp(5),
  },
  previousReportText: {
    color: colors.primary,
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2.5),
  },
  // text input
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(6),
    width: wp(90),
    marginVertical: hp(0.5),
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: hp(1),
  },
  textInputStyles: {
    // height: hp(6),
    paddingLeft: wp(2),
    width: wp(90),
    fontSize: hp(1.8),
    color: colors.black,
    fontFamily: 'Poppins-Regular',
  },
  listParameterName: {color: colors.black, fontFamily: 'Poppins-Bold'},
  listParameterView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: wp(1),
    marginVertical: hp(1),
  },
  listRangeText: {
    paddingTop: hp(0.4),
    height: hp(3),
    width: hp(3),
    fontSize: hp(1.5),
    textAlign: 'center',
    borderRadius: hp(3),
    color: colors.white,
  },
  bottomView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.8),
    marginVertical: hp(2),
    borderRadius: 5,
  },
  totalRatingText: {
    color: colors.white,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(2),
  },
  ratingValueText: {
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(2),
  },
  submitButton: {
    width: wp(87),
    borderRadius: 6,
  },
});
