import {useIsFocused} from '@react-navigation/native';
import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Provider} from 'react-native-paper';
import {useSelector} from 'react-redux';
import Header from '../../Components/Header';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import Loader from '../../Components/Loader';
import {chats} from '../../Utils/Apis/ApiCalls';
import {colors} from '../../Utils/Colors';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';
import Toast from 'react-native-simple-toast';

export default function Messages(props) {
  const getdata = useSelector(state => state.ConstantData.dashboardData);
  let dataa = getdata.employeeDetails;
  console.log(dataa.photo);
  const isFoucused = useIsFocused();

  useEffect(() => {
    getChats();
  }, [isFoucused]);

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const getChats = async () => {
    setLoading(true);
    await chats
      .getallChats()
      .then(result => {
        console.log(result, 'sasasaas');
        if (
          result?.data?.data ==
          'User who is trying to access this data has some other role besides hr'
        ) {
          Toast.show(
            'User who is trying to access this data has some other role besides hr',
            Toast.SHORT,
          );
        } else {
          setData(result?.data?.data);
        }
        // console.log(result?.data?.data);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Loader loading={loading} />
        <Header
          title="All Messages"
          icon={true}
          onBackPress={() => props.navigation.goBack()}
        />
        <View style={styles.mainContainerImage}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={dataa?.photo ? {uri: dataa?.photo} : Images.dummyUser}
              style={styles.userImage}
            />
            <View style={{marginLeft: wp(5)}}>
              <Text style={[styles.nameText, {fontSize: hp(2)}]}>
                {dataa?.employeeName}
              </Text>
              <Text style={styles.nameText}>{dataa?.designation}</Text>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{marginBottom: hp(1)}}></View>
            <View>
              <FlatList
                refreshing={loading}
                onRefresh={() => getChats()}
                ListEmptyComponent={<ListEmptyComponent />}
                data={data}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      style={styles.listContainer}
                      onPress={() => {
                        data.map(propTypes => {
                          let a = propTypes.item;
                          let b = propTypes.index;
                          if (b == index) {
                            data[index].unread = false;
                          }
                        }),
                          props.navigation.navigate('ChatScreen', {
                            data: {
                              fcm: item.fcmToken,
                              id: item.userId,
                              photo: item.picture,
                              name: item.userName,
                            },
                          });
                      }}>
                      <Image
                        source={
                          item?.picture
                            ? {uri: item?.picture}
                            : Images.dummyUser
                        }
                        style={styles.listImage}
                        resizeMode="contain"
                      />
                      <View style={{width: wp(60), paddingStart: wp(2)}}>
                        <Text style={styles.listUserName}>{item.userName}</Text>
                        <Text style={styles.listUserMessage} numberOfLines={1}>
                          {item.lastChatMessage}
                        </Text>
                      </View>
                      {item?.unread ? (
                        <Icon
                          name="dot-single"
                          type="entypo"
                          color={colors.primary}
                          size={hp(4)}
                        />
                      ) : (
                        <View></View>
                      )}
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
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  mainContainerImage: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    backgroundColor: colors.primaryLight,
  },
  userImage: {
    height: hp(10),
    backgroundColor: 'lightgrey',
    width: hp(10),
    marginVertical: hp(1),
    borderRadius: hp(2),
  },
  nameText: {
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.7),
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
  //list styles
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    backgroundColor: colors.lightGray,
    marginVertical: hp(0.5),
    borderRadius: hp(1),
  },
  listImage: {
    height: hp(6),
    width: hp(6),
    borderRadius: hp(3),
    backgroundColor: 'lightgrey',
  },
  listUserName: {
    fontWeight: '600',
    color: colors.primary,
    fontSize: hp(1.8),
  },
  listUserMessage: {
    fontFamily: 'Poppins-Regular',
    color: colors.black,
    fontSize: hp(1.3),
    width: wp(60),
  },
});
