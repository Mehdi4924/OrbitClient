import axios from 'axios';
// import PropTypes from 'prop-types';
import React, {Component} from 'react';
// import { AlertIOS } from 'react-native';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import {AuthApi} from '../Utils/Apis/ApiCalls';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setDashboardData} from '../Redux/actions/Action';
// import { connect } from 'react-redux';
import {store} from '../Redux/Store';
import Loader from '../Components/Loader';

class FingerprintPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    FingerprintScanner.authenticate({
      description: 'Scan your fingerprint on the device scanner to continue',
    })
      .then(async res => {
        this.setState({loading: true});
        let body = await AsyncStorage.getItem('login');
        // console.log(JSON.parse(body), "bodyyy");
        if (res) {
          axios.defaults.headers.post['Content-Type'] = 'application/json';
          AuthApi.login(JSON.parse(body))
            .then(result => {
              console.log(
                'response loging in',
                JSON.stringify(result.data, null, 2),
              );
              if (result?.data?.message == 'Logged in successfully') {
                store?.dispatch(setDashboardData(result?.data));
                Toast.show(result?.data?.message, Toast.LONG);
                this?.props?.navigation?.replace('AppFlow');
              }
            })
            .catch(err => {
              console.log(err);
              Toast.show(err?.message, Toast.SHORT);
            })
            .finally(() => {
              this.setState({loading: false});
            });
        }
      })
      .catch(error => {
        console.log('error authentication', error);
        this.props.handlePopupDismissed();
      })
      .finally(function () {
        FingerprintScanner.release();
      });
  }
  render() {
    return <Loader loading={this.state.loading} />;
  }
}

export default FingerprintPopup;
