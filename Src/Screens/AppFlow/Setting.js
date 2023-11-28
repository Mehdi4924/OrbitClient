import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import Header from '../../Components/Header';
import {colors} from '../../Utils/Colors';
import {hp, wp} from '../../Utils/Responsive';
import {Card, Switch} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {clearDashboardData} from '../../Redux/actions/Action';

const Setting = props => {
  const dispatch = useDispatch();
  const [isSwitchOn, setIsSwitchOn] = React.useState(false);
  const enableSwitch = async e => {
    setIsSwitchOn(!isSwitchOn);
    await AsyncStorage.setItem('fingerprint', JSON.stringify(e));
  };
  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    let b = await AsyncStorage.getItem('fingerprint');
    let a = JSON.parse(b);
    setIsSwitchOn(a);
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      <View>
        <Header
          icon={true}
          title="Settings"
          onBackPress={() => props.navigation.goBack()}
        />
        <Card style={{marginHorizontal: wp(3), marginVertical: hp(1)}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: wp(3),
              marginVertical: hp(2),
            }}>
            <Text style={{color: colors.black, fontWeight: '700'}}>
              Login with fingerprint
            </Text>
            <Switch value={isSwitchOn} onValueChange={e => enableSwitch(e)} />
          </View>
        </Card>
        <Card style={{marginHorizontal: wp(3), marginVertical: hp(1)}}>
          <TouchableOpacity
            style={styles.viewStyles}
            onPress={() => {
              dispatch(clearDashboardData()),
                props.navigation.reset({
                  index: 0,
                  routes: [{name: 'AuthStack'}],
                });
            }}>
            <Text style={{color: colors.black, fontWeight: '700'}}>Logout</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  );
};

export default Setting;

const styles = StyleSheet.create({
  viewStyles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3),
    marginVertical: hp(2),
  },
});
