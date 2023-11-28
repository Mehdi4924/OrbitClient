import {useIsFocused} from '@react-navigation/native';
import {Icon} from '@rneui/base';
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
import {Card, Provider} from 'react-native-paper';
import {useSelector} from 'react-redux';
import CustomButton from '../../Components/CustomButton';
import Header from '../../Components/Header';
import ListEmptyComponent from '../../Components/ListEmptyComponent';
import Loader from '../../Components/Loader';
import {members} from '../../Utils/Apis/ApiCalls';
import {colors} from '../../Utils/Colors';
import Toast from 'react-native-simple-toast';
import Images from '../../Utils/Images';
import {hp, wp} from '../../Utils/Responsive';

export default function LoanStats(props) {
  const authUserData = useSelector(state => state.ConstantData.dashboardData);
  const [loanData, setLoanData] = useState([]);
  const [refreshing, setRefreshing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [alredyLoanTaken, setAlredyLoanTaken] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    GetLoanHistory();
  }, [isFocused]);
  async function GetLoanHistory() {
    setLoading(true);
    await members
      .getLoanHistory(authUserData?.employeeDetails?.employeeId || 0)
      .then(res => {
        console.log(
          'Success Getting Loan',
          JSON.stringify(res.data, null, 2),
          // res,
        );
        setLoanData(res?.data);
        if (res?.data?.message?.loanPaymentHistories?.length > 0) {
          const status =
            res?.data?.message?.loanPaymentHistories[0]?.state == 'Open'
              ? true
              : false;
          setAlredyLoanTaken(status);
        } else if (res?.data?.message?.loanHistoryDtos?.length > 0) {
          const indexFinding = res?.data?.message?.loanHistoryDtos?.findIndex(
            item => item.isApproved === true,
          );
          setAlredyLoanTaken(indexFinding != -1 ? true : false);
        } else {
          setAlredyLoanTaken(false);
        }
      })
      .catch(err => {
        console.log('Error Getting Loan', err);
      })
      .finally(function () {
        setLoading(false);
      });
  }
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Header
          icon={true}
          title="Loan History"
          onBackPress={() => props.navigation.goBack()}
        />
        <Loader loading={loading} />
        <View style={styles.mainContainerImage}>
          {/* <Text style={styles.profileText}>Loan History</Text> */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={
                authUserData?.employeeDetails?.photo
                  ? {
                      uri: authUserData?.employeeDetails?.photo,
                    }
                  : Images.dummyUser
              }
              style={styles.userImage}
              resizeMode="contain"
            />
            <View style={{marginLeft: wp(5)}}>
              <Text style={styles.nameText}>
                {authUserData?.employeeDetails?.employeeName || ''}
              </Text>
              <Text style={styles.nameText}>
                {authUserData?.employeeDetails?.designation || ''}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.subView}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={GetLoanHistory} />
            }>
            <View style={{marginBottom: hp(8)}}>
              <View style={styles.applyLoanView}>
                <Text style={styles.reportText}>Previous Loan History</Text>
                <CustomButton
                  isLoading={false}
                  name={'Apply Loan'}
                  buttonStyles={styles.submitButton}
                  textStyles={{color: colors.white, fontSize: hp(1.6)}}
                  onPress={() =>
                    alredyLoanTaken
                      ? Toast.show(
                          'You Have Already Taken The Loan, Please Payback First',
                          Toast.SHORT,
                        )
                      : props.navigation.navigate('ApplyLoan')
                  }
                />
              </View>
              <View style={styles.applyLoanView}>
                <Text style={styles.previousReportText}>
                  Current Loan Stats
                </Text>
              </View>
              <View style={styles.statsMainView}>
                <Text style={styles.monthText}>
                  Total Loan Amount{'\n'}
                  <Text style={[styles.monthText, {color: colors.white}]}>
                    {loanData?.currentLoanStats?.totalLoanAmount || 0}
                  </Text>
                </Text>
                <Text style={styles.monthText}>
                  Total Installments{'\n'}
                  <Text style={[styles.monthText, {color: colors.white}]}>
                    {loanData?.currentLoanStats?.totalInstallments || 0}
                  </Text>
                </Text>
                <Text style={styles.monthText}>
                  Amount Payed Back{'\n'}
                  <Text style={[styles.monthText, {color: colors.white}]}>
                    {loanData?.currentLoanStats?.amountPayedBack || 0}
                  </Text>
                </Text>
                <Text style={[styles.monthText, {borderRightWidth: 0}]}>
                  This Month Installment{'\n'}
                  <Text style={[styles.monthText, {color: colors.white}]}>
                    {loanData?.currentLoanStats?.thisMonthInstallment || 0}
                  </Text>
                </Text>
              </View>
              <Text style={styles.previousReportText}>Installment Details</Text>
              <FlatList
                data={
                  loanData?.message?.loanPaymentHistories?.length > 0
                    ? loanData.message.loanPaymentHistories.filter(
                        item => item.status != '',
                      )
                    : []
                }
                contentContainerStyle={{
                  paddingVertical: hp(2),
                  paddingHorizontal: 5,
                  // marginBottom: hp(5),
                }}
                ListEmptyComponent={
                  <ListEmptyComponent emptyContainer={{height: hp(20)}} />
                }
                renderItem={({item, index}) => {
                  const findedItem = loanData?.message?.loanHistoryDtos?.filter(
                    historyItem => historyItem.id == item.id,
                  );
                  return (
                    <Card
                      style={{backgroundColor: colors.white, marginTop: hp(1)}}>
                      <TouchableOpacity
                        activeOpacity={0.6}
                        style={[
                          styles.listParentView,
                          {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          },
                        ]}
                        onPress={() => {
                          const newFilteredData = [
                            ...loanData.message.loanPaymentHistories,
                          ].filter(item => item.status != '');
                          newFilteredData[index].isOpen
                            ? (newFilteredData[index].isOpen = false)
                            : (newFilteredData[index].isOpen = true);
                          setLoanData({
                            ...loanData,
                            message: {
                              ...loanData.message,
                              loanPaymentHistories: newFilteredData,
                            },
                          });
                        }}>
                        <Text style={styles.purposeText}>
                          {`${item.amountPayed} ${item.status}`}
                        </Text>
                        <Text style={styles.dateText}>
                          For Loan Of {findedItem[0].totalLoanAmount}
                        </Text>
                      </TouchableOpacity>
                      {item.isOpen ? (
                        <View
                          style={[styles.listParentView, {marginVertical: 0}]}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text style={styles.applicationForText}>
                              Loan Applied On:
                            </Text>
                            <Text style={styles.descText}>
                              {findedItem[0]?.appliedOn.split('T')[0] || ''}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text style={styles.applicationForText}>
                              Deduction Type:
                            </Text>
                            <Text style={styles.descText}>
                              {findedItem[0]?.deductionType || ''}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text style={styles.applicationForText}>
                              Amount Paid:
                            </Text>
                            <Text style={styles.descText}>
                              {item?.amountPayed || ''}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text style={styles.applicationForText}>
                              Amount Paid For:
                            </Text>
                            <Text style={styles.descText}>
                              {item?.loanPaymentMonthAndYear.item1 || ''}
                              {', '}
                              {item?.loanPaymentMonthAndYear.item2 || ''}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </Card>
                  );
                }}
              />
              <Text style={styles.previousReportText}>Previous Loans</Text>
              <FlatList
                data={loanData?.message?.loanHistoryDtos || []}
                contentContainerStyle={{
                  paddingVertical: hp(2),
                  paddingHorizontal: 5,
                  // marginBottom: hp(5),
                }}
                ListEmptyComponent={
                  <ListEmptyComponent emptyContainer={{height: hp(20)}} />
                }
                renderItem={({item, index}) => {
                  let itemStatus = '';
                  if (item?.isApproved == false && item?.isRejected == false) {
                    itemStatus = 'Pending';
                  } else if (
                    item?.isApproved == false &&
                    item?.isRejected == true
                  ) {
                    itemStatus = 'Rejected';
                  } else {
                    itemStatus = 'Approved';
                  }
                  return (
                    <Card
                      style={{backgroundColor: colors.white, marginTop: hp(1)}}>
                      <TouchableOpacity
                        activeOpacity={0.6}
                        style={styles.listParentView}
                        onPress={() => {
                          loanData?.message?.loanHistoryDtos[index]?.isOpen
                            ? (loanData.message.loanHistoryDtos[
                                index
                              ].isOpen = false)
                            : (loanData.message.loanHistoryDtos[
                                index
                              ].isOpen = true);
                          setRefreshing(!refreshing);
                        }}>
                        <View style={styles.listSubView}>
                          <Text style={styles.purposeText}>
                            Applied On: {item?.appliedOn?.split('T')[0] || ''}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text style={styles.dateText}>
                              {itemStatus}
                              {/* {new Date().toISOString().split('T')[0]} */}
                            </Text>
                            <Icon
                              name={
                                itemStatus == 'Pending'
                                  ? 'circle-slice-3'
                                  : itemStatus == 'Approved'
                                  ? 'check-circle'
                                  : 'close-circle'
                              }
                              type="material-community"
                              color={
                                itemStatus == 'Pending'
                                  ? 'green'
                                  : itemStatus == 'Approved'
                                  ? colors.primary
                                  : colors.red
                              }
                              style={{marginLeft: wp(1)}}
                              size={hp(2.5)}
                            />
                          </View>
                        </View>
                        {item.isOpen ? (
                          <View>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginVertical: hp(1),
                              }}>
                              <Text style={styles.applicationForText}>
                                Total Loan Amount:
                              </Text>
                              <Text style={styles.loanAmoutText}>
                                {item?.totalLoanAmount || ''}
                              </Text>
                            </View>
                            {item.isApproved ? (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  marginBottom: hp(1),
                                }}>
                                <Text style={styles.applicationForText}>
                                  Number Of Installments:
                                </Text>
                                <Text style={styles.loanAmoutText}>
                                  {item?.noofinstallments || ''}
                                </Text>
                              </View>
                            ) : null}
                            {item.approved ? (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  marginBottom: hp(1),
                                }}>
                                <Text style={styles.applicationForText}>
                                  Payment Status:{' '}
                                </Text>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                  }}>
                                  <Text
                                    style={[
                                      styles.applicationForText,
                                      {color: colors.primary},
                                    ]}>
                                    {item?.repayed ? 'Repayed' : 'No Payed'}
                                  </Text>
                                  <Icon
                                    name={
                                      item.repayed
                                        ? 'check-circle'
                                        : 'close-circle'
                                    }
                                    type="material-community"
                                    color={
                                      item.repayed ? colors.primary : colors.red
                                    }
                                    style={{marginLeft: wp(1)}}
                                    size={hp(2.5)}
                                  />
                                </View>
                              </View>
                            ) : null}
                            <Text style={styles.applicationForText}>
                              Loan Description
                            </Text>
                            <Text style={styles.descText}>
                              {item?.loanDescription || ''}
                            </Text>
                            {item?.approved ? (
                              <>
                                <Text style={styles.approvedForText}>
                                  Leave Approved For {item.approvedFor} Pkr
                                </Text>
                              </>
                            ) : null}
                            <Text style={styles.applicationForText}>
                              Comments
                            </Text>
                            <Text style={styles.descText}>
                              {item?.comments || 'No Comments'}
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
    backgroundColor: 'lightgrey',
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
  applyLoanView: {
    width: wp(90),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  previousReportText: {
    color: colors.black,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(2),
  },
  appliedOnText: {
    color: colors.black,
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.4),
  },
  statsMainView: {
    backgroundColor: colors.primary,
    width: wp(90),
    height: hp(10),
    marginVertical: hp(1),
    borderRadius: hp(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(1),
  },
  monthText: {
    color: colors.white,
    width: wp(22),
    fontFamily: 'Poppins-Bold',
    fontSize: hp(1.4),
    textAlignVertical: 'center',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.white,
  },
  listParentView: {
    backgroundColor: colors.white,
    marginVertical: hp(0.5),
    borderRadius: 10,
    padding: 10,
  },
  listSubView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applicationForText: {
    maxWidth: wp(50),
    color: colors.black,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.6),
  },
  loanAmoutText: {
    color: colors.white,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.8),
    backgroundColor: colors.grey,
    paddingHorizontal: wp(2),
    marginHorizontal: wp(4),
    borderRadius: 5,
  },
  purposeText: {
    maxWidth: wp(50),
    color: colors.black,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.6),
  },
  dateText: {
    color: colors.grey,
    fontFamily: 'Poppins-Regular',
    fontSize: hp(1.6),
  },
  descText: {
    color: colors.black,
    paddingHorizontal: wp(2),
  },
  approvedForText: {
    maxWidth: wp(50),
    color: colors.primary,
    fontFamily: 'Poppins-SemiBold',
    fontSize: hp(1.6),
    marginVertical: hp(1),
  },
  smallButton: {
    height: hp(4),
    borderRadius: 5,
    marginVertical: hp(1),
    elevation: 5,
  },
});
