import {Icon} from '@rneui/base';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import {colors} from '../Utils/Colors';
import {hp, wp} from '../Utils/Responsive';

const CalendarTheme = {
  textSectionTitleColor: colors.primary,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: colors.primary,
  todayTextColor: colors.primary,
  dayTextColor: colors.primary,
  textDisabledColor: colors.primary,
  dotColor: colors.primary,
  selectedDotColor: colors.primary,
  arrowColor: colors.primary,
  disabledArrowColor: '#d9e1e8',
  monthTextColor: colors.primary,
  indicatorColor: colors.primary,
  textDayFontFamily: 'Poppins_Regular',
  textMonthFontFamily: 'Poppins_Regular',
  textDayHeaderFontFamily: 'Poppins_Regular',
  textDayFontSize: hp(1.5),
  textMonthFontSize: hp(1.5),
  textDayHeaderFontSize: hp(1.5),
};
export default function Calender(props) {
  const d = new Date();
  const c = d.toISOString().split('T');
  const b = d.setDate(d.getDate() + 1000);
  const dateCheck = new Date(b).toISOString();
  const [initalDate, setInitalDate] = useState(c[0]);
  const [selectedDate, setSelectedDate] = useState([]);
  useEffect(() => {
    clearSelction();
    setSelectedDate([{dateString: c[0]}]);
  }, [props.refresh]);
  function renderCustomHeader(date) {
    const header = date.toString('MMMM yyyy');
    const [month, year] = header.split(' ');
    const textStyle = {
      fontFamily: 'Poppins-Bold',
      color: colors.white,
    };
    function increment() {
      const a = initalDate.split('-');
      const x = Number(a[1]);
      const y = x - 1 > 0 ? x - 1 : '12';
      a[1] = y > 9 ? `${y}` : `0${y}`;
      a[2] = '01';
      a[0] = x - 1 == 0 ? a[0] - 1 : a[0];
      setInitalDate(a.join('-'));
      props.onMonthChange(a.join('-'));
    }
    function decrement() {
      const a = initalDate.split('-');
      const x = Number(a[1]);
      const y = x + 1 > 12 ? '1' : x + 1;
      a[1] = y > 9 ? `${y}` : `0${y}`;
      a[2] = '01';
      a[0] = x + 1 == 13 ? parseInt(a[0]) + 1 : a[0];
      setInitalDate(a.join('-'));
      props.onMonthChange(a.join('-'));
    }
    const check = Platform.OS == 'android';
    return (
      <View style={styles.arrowContainer}>
        <TouchableOpacity
          onPress={() => {
            if (check) {
              increment();
            }
          }}
          onPressIn={() => {
            if (!check) {
              increment();
            }
          }}>
          <Icon
            name="chevron-left"
            type="material-community"
            color={colors.white}
            size={hp(2.5)}
          />
        </TouchableOpacity>
        <View style={{flexDirection: 'row'}}>
          <Text style={textStyle}>{`${month}`}</Text>
          <Text style={textStyle}> {year}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (check) {
              decrement();
            }
          }}
          onPressIn={() => {
            if (!check) {
              decrement();
            }
          }}>
          <Icon
            name="chevron-right"
            type="material-community"
            color={colors.white}
            size={hp(2.5)}
          />
        </TouchableOpacity>
      </View>
    );
  }
  function renderCustomDays({date, state}) {
    let newDateArr = selectedDate;
    let selectIndex =
      newDateArr.length == 0
        ? -1
        : selectedDate.findIndex(item => item.dateString == date.dateString);
    return !props.dayShown ? (
      <TouchableOpacity
        onPress={() => {
          if (
            date.dateString >= c[0] &&
            date.dateString <= dateCheck.split('T')[0]
          ) {
            if (state.date != 'disabled') {
              if (selectIndex == -1) {
                if (
                  props?.selectionLimit
                    ? selectedDate.length > props.selectionLimit - 1
                    : selectedDate.length > 1
                ) {
                  selectedDate.splice(-1);
                }
                const a = [...selectedDate, date];
                setSelectedDate(a), props.onDatePress(a);
              } else {
                const a = selectedDate.filter(
                  item => item.dateString != date.dateString,
                );
                setSelectedDate(a), props.onDatePress(a);
              }
            }
          }
        }}>
        <Text
          style={{
            textAlign: 'center',
            borderRadius: hp(2),
            width: wp(8),
            padding: hp(0.7),
            backgroundColor: selectIndex != -1 ? colors.primary : colors.white,
            color:
              date.dateString >= c[0] &&
              date.dateString <= dateCheck.split('T')[0]
                ? selectIndex != -1
                  ? colors.white
                  : colors.black
                : '#AFAFAF',
          }}>
          {date.day}
        </Text>
      </TouchableOpacity>
    ) : null;
  }
  function clearSelction() {
    setSelectedDate([]);
  }
  return (
    <View style={{flex: 1}}>
      <Calendar
        enableSwipeMonths={true}
        style={[styles.calendar, {height: !props.dayShown ? hp(45) : hp(10)}]}
        renderHeader={renderCustomHeader}
        hideArrows={true}
        initialDate={initalDate}
        theme={CalendarTheme}
        dayComponent={renderCustomDays}
        hideDayNames={props?.hideDayNames || false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  arrowContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    marginVertical: hp(1),
    borderRadius: 25,
  },
});
