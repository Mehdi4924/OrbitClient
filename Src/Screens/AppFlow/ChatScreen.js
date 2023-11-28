import {Icon} from '@rneui/base';
import React, {useEffect, useState, useRef} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors} from '../../Utils/Colors';
import {GiftedChat, Bubble, Time} from 'react-native-gifted-chat';
import Images from '../../Utils/Images';
import {AudioString, hp, wp} from '../../Utils/Responsive';
import Header from '../../Components/Header';
import {io} from 'socket.io-client';
import {renderSend} from '../../Components/InputToolbar';
import {chats, sendNotification} from '../../Utils/Apis/ApiCalls';
import {useSelector} from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import AudioRecord from 'react-native-audio-record';
import {ActivityIndicator, Modal} from 'react-native-paper';
import RNFs from 'react-native-fs';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
const audioRecorderPlayer = new AudioRecorderPlayer();
const socket = io('http://15.185.185.85:9003');

export default function ChatScreen(props) {
  let propsData = props?.route?.params?.data;
  const getDashboardData = useSelector(
    state => state.ConstantData.dashboardData,
  );
  let data = getDashboardData.employeeDetails;
  const timer = useRef();
  const [messages, setMessages] = useState([]);
  const [play, setPlay] = useState(false);
  const [status, setPlayState] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [CurrentPositionSec, setCurrentPositionSec] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    getChatsData();
  }, []);

  const getChatsData = async () => {
    socket.emit('update id', {fromid: data.aspNetUserId, toid: propsData?.id});
    socket.on('chat message', async ({content, from, to, name}) => {
      let a = [content];
      console.log(a, 'aaaaa');
      setMessages(prevMessages => GiftedChat.append(prevMessages, content));
    });
    let body = {
      senderid: data?.aspNetUserId,
      receiverid: propsData?.id,
      offset: 0,
      limit: 10,
    };
    setloading(true);
    console.log(body, 'body');
    await chats
      .getSingleChat(body)
      .then(res => {
        console.log(res);
        let a = res?.data?.data?.messages?.map(item => {
          var stillUtc = moment.utc(item?.createdAt).toDate();
          var local = moment(stillUtc)?.local()?.format('YYYY-MM-DD HH:mm:ss');
          const a = {...item, new: false, createdAt: local};
          return a;
        });
        console.log('this is a', a);
        setMessages(a);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setloading(false);
      });
  };
  const onSend = async (newMessages = []) => {
    console.log(newMessages, 'newwww');
    setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));
    let content = newMessages[0];
    sendNotificationData();

    socket.emit('chat message', {
      content,
      toid: propsData?.id,
      fromid: data?.aspNetUserId,
      username: data?.employeeName,
      receivername: propsData?.userName,
    });
    const a = content?.createdAt?.toISOString();
    let body = {
      senderid: data?.aspNetUserId,
      receiverid: propsData?.id,
      messages: [{...content, createdAt: a}],
    };
    let formData = new FormData();

    formData.append('data', JSON.stringify(body));
    if (content?.fileaudio) {
      const audioFile = {
        uri: 'file:' + content?.fileaudio,
        name: 'test.wav',
        type: 'audio/wav',
      };
      formData.append('audio', audioFile);
    }
    axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
    await chats
      .sendMessage(formData)
      .then(res => {
        console.log('c', JSON.stringify(res?.data, null, 2));
      })
      .catch(err => {
        console.log('error Post Message', JSON.stringify(err, null, 2));
      })
      .finally(() => {
        axios.defaults.headers.post['Content-Type'] = 'application/json';
      });
  };
  function renderBubble(props) {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: colors.white,
            fontFamily: 'Poppins-Regular',
          },
          left: {
            color: colors.black,
            fontFamily: 'Poppins-Regular',
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
            borderRadius: 5,
          },
          left: {
            backgroundColor: colors.grey,
            borderRadius: 5,
          },
        }}
      />
    );
  }
  const sendNotificationData = () => {
    const hrToken = propsData?.fcm;
    const dat = {
      registration_ids: [`${hrToken}`],
      collapse_key: 'type_a',
      notification: {
        title: `New Message`,
        body: `${data?.employeeName} send you a new message`,
        image: `${data?.photo}`,
      },
      data: {
        ...data,
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
  const onStopPlay = React.useCallback(async file => {
    let fileIsFromServer =
      file?.audio?.includes('https://') || file?.audio?.includes('http://');
    let finalUrl = '';
    if (fileIsFromServer) {
      finalUrl = file.audio;
    } else {
      const a = file?.audio != undefined ? file?.audio : file?.fileaudio;
      const b = 'data:audio/wav;base64,';
      finalUrl = b?.concat(a);
    }
    await audioRecorderPlayer.stopPlayer(finalUrl);
    await audioRecorderPlayer.removePlayBackListener();
    const findedIndex = messages.map(item => {
      if (item?._id == file?._id) {
        return {...item, isPlaying: false};
      } else {
        return {...item, isPlaying: false};
      }
    });
    setMessages(findedIndex);
    setPlay(prevState => !prevState);
  });
  const renderAudioP = mess => {
    let mes = mess?.currentMessage;
    return (
      <View style={{padding: 10, flexDirection: 'row', alignItems: 'center'}}>
        <Pressable
          activeOpacity={0.4}
          onPress={() => {
            if (Platform.OS == 'android') {
              mess?.currentMessage?.isPlaying
                ? onStopPlay(mess?.currentMessage)
                : onStartPlay(mess?.currentMessage);
            }
          }}
          onPressIn={() => {
            if (Platform.OS == 'ios') {
              mess?.currentMessage?.isPlaying
                ? onStopPlay(mess?.currentMessage)
                : onStartPlay(mess?.currentMessage);
            }
          }}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          {mess?.currentMessage?.isPlaying ? (
            <Icon
              type="AntDesign"
              name={'pause'}
              color={
                mes?.user?._id == data?.aspNetUserId
                  ? colors.white
                  : colors.black
              }
              size={hp(3.5)}
            />
          ) : (
            <Icon
              type="entypo"
              name={'controller-play'}
              color={
                mes?.user?._id == data?.aspNetUserId
                  ? colors.white
                  : colors.black
              }
              size={hp(3.5)}
            />
          )}
        </Pressable>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={{
              color:
                mes?.user?._id == data?.aspNetUserId
                  ? colors.white
                  : colors.black,
              marginHorizontal: wp(2),
              fontWeight: '500',
            }}>
            Voice {''}
          </Text>
          <Text
            style={{
              color:
                mes?.user?._id == data?.aspNetUserId
                  ? colors.white
                  : colors.black,
              marginLeft: hp(1),
              fontSize: hp(1.5),
            }}>
            {mes?.recordtime}
          </Text>
        </View>
      </View>
    );
  };
  const renderAudio = () => {
    return (
      <View
        style={{
          paddingLeft: wp(2),
          position: 'absolute',
          zIndex: 100,
          marginBottom: 10,
        }}>
        <Pressable
          onPress={() => {
            if (Platform.OS == 'android') {
              setPlayState(true);
              onStartRecord();
            }
          }}
          onPressIn={() => {
            if (Platform.OS == 'ios') {
              onStartRecord();
              setPlayState(true);
            }
          }}>
          {status ? (
            <Image
              style={{width: 40, height: 40}}
              source={require('../../Assets/Images/voice.png')}
            />
          ) : (
            <Image
              style={{width: 32, height: 32}}
              source={require('../../Assets/Images/voice.png')}
            />
          )}
        </Pressable>
        {/* )} */}
      </View>
    );
  };
  const onStartRecord = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          setModalVisible(true);
          const options = {
            sampleRate: 44100,
            channels: 1,
            bitsPerSample: 16,
            audioSource: 6,
            wavFile: `${Math.random()}.m4a`,
          };
          await AudioRecord.init(options);
          await AudioRecord.start();
          let aa = 0;
          let a = setInterval(() => {
            aa++;
            setRecordTime(secondsToTime(aa));
          }, 1000);
          timer.current = a;
          console.log('Permissions granted');
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    } else {
      setModalVisible(true);
      const options = {
        sampleRate: 44100, // default 44100
        channels: 1, // 1 or 2, default 1
        bitsPerSample: 16, // 8 or 16, default 16
        audioSource: 6, // android only (see below)
        wavFile: `${Math.random()}.m4a`, // default 'audio.wav'
      };
      await AudioRecord.init(options);
      await AudioRecord.start();
      let aa = 0;
      let a = setInterval(() => {
        aa++;
        setRecordTime(secondsToTime(aa));
      }, 1000);
      timer.current = a;
    }
  };
  function secondsToTime(e) {
    const m = Math.floor((e % 3600) / 60)
        .toString()
        .padStart(2, '0'),
      s = Math.floor(e % 60)
        .toString()
        .padStart(2, '0');
    return m + ':' + s;
  }
  const onStopRecord = async () => {
    setModalVisible(false);
    await AudioRecord.stop().then(r => {
      RNFs.readFile(r, 'base64').then(async dataa => {
        let content = [
          {
            _id: Math.random(),
            createdAt: new Date(),
            audio: dataa,
            fileaudio: r,
            recordtime: recordTime,
            user: {
              _id: data?.aspNetUserId,
            },
          },
        ];
        onSend(content);
        clearInterval(timer.current);
        setRecordTime('00:00');
      });
    });
  };
  const onStartPlay = async file => {
    setPlay(!play);
    const findedIndex = messages.map(item => {
      if (item?._id == file?._id) {
        return {...item, isPlaying: true};
      } else {
        return {...item, isPlaying: false};
      }
    });
    setMessages(findedIndex);
    let fileIsFromServer =
      file?.audio?.includes('https://') || file?.audio?.includes('http://');
    let finalUrl = '';
    if (fileIsFromServer) {
      finalUrl = file.audio;
    } else {
      const path = `${RNFs.DocumentDirectoryPath}/sound.mp3`;
      RNFs.writeFile(path, file.audio, 'base64');
      finalUrl = `file://${RNFs.DocumentDirectoryPath}/sound.mp3`;
    }
    await audioRecorderPlayer.startPlayer(finalUrl);
    await audioRecorderPlayer.addPlayBackListener(e => {
      if (e.currentPosition == e.duration) {
        const findedIndex = messages.map(item => {
          if (item?._id == file?._id) {
            return {...item, isPlaying: false};
          } else {
            return {...item, isPlaying: false};
          }
        });
        setMessages(findedIndex);
        setCurrentPositionSec(0);
      }
      return;
    });
  };
  return (
    <View style={styles.container}>
      <Header
        title="Chat"
        icon={true}
        onBackPress={() => props.navigation.goBack()}
      />
      <View style={styles.mainContainerImage}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={propsData.photo ? {uri: propsData.photo} : Images.dummyUser}
            style={styles.userImage}
            resizeMode="contain"
          />
          <View style={{marginLeft: wp(5)}}>
            <Text style={styles.nameText}>{propsData?.name}</Text>
            <Text style={styles.nameText}>{propsData?.roleName}</Text>
          </View>
        </View>
      </View>
      <View style={styles.subView}>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <GiftedChat
            keyboardShouldPersistTaps="always"
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
              _id: data?.aspNetUserId,
            }}
            renderBubble={renderBubble}
            renderAvatar={() => null}
            showAvatarForEveryMessage={true}
            textInputProps={{color: colors.black, paddingLeft: wp(9)}}
            renderSend={renderSend}
            renderActions={renderAudio}
            renderMessageAudio={message => renderAudioP(message)}
            scrollToBottomStyle={{backgroundColor: colors.primary}}
            scrollToBottomComponent={() => {
              return (
                <Icon
                  name="chevrons-down"
                  type="feather"
                  color={colors.primary}
                  size={hp(4)}
                />
              );
            }}
            parsePatterns={linkStyle => [
              {
                pattern: /#(\w+)/,
                style: linkStyle,
                onPress: tag => console.log(`Pressed on hashtag: ${tag}`),
              },
            ]}
            renderTime={props => {
              return (
                <Time
                  {...props}
                  timeTextStyle={{
                    left: {
                      fontFamily: 'Poppins-Regular',
                      color: colors.black,
                    },
                    right: {
                      color: colors.white,
                      fontFamily: 'Poppins-Regular',
                    },
                  }}
                />
              );
            }}
          />
        )}
      </View>
      <Modal
        visible={isModalVisible}
        contentContainerStyle={styles.containerStyle}>
        <Text style={{color: colors.black, marginRight: wp(10)}}>
          {recordTime}
        </Text>
        <Image source={require('../../Assets/Images/waves.gif')} />
        <Image source={require('../../Assets/Images/waves.gif')} />
        <Image source={require('../../Assets/Images/waves.gif')} />
        <Image source={require('../../Assets/Images/waves.gif')} />
        <View style={{marginLeft: wp(4)}}>
          <Pressable
            onPress={() => {
              if (Platform.OS == 'android') {
                setModalVisible(false);
                setRecordTime('00:00');
                clearInterval(timer.current);
              }
            }}
            onPressIn={() => {
              if (Platform.OS == 'ios') {
                setModalVisible(false);
                setRecordTime('00:00');
                clearInterval(timer.current);
              }
            }}>
            <Image
              source={require('../../Assets/Images/close.png')}
              style={{height: hp(4.2), width: hp(4.2), marginBottom: hp(2)}}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              if (Platform.OS == 'android') {
                setPlayState(false), onStopRecord();
              }
            }}
            onPressIn={() => {
              if (Platform.OS == 'ios') {
                setPlayState(false), onStopRecord();
              }
            }}>
            <Image
              source={require('../../Assets/Images/ok.png')}
              style={{height: hp(4.2), width: hp(4.2)}}
            />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary, zIndex: 1},
  mainContainerImage: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    backgroundColor: colors.primaryLight,
  },
  profileText: {
    color: colors.white,
    width: wp(80),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(3),
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
  subView: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    backgroundColor: colors.white,
    borderTopRightRadius: hp(5),
    borderTopLeftRadius: hp(5),
  },
  containerStyle: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    borderRadius: 4,
    zIndex: 1,
  },
});
