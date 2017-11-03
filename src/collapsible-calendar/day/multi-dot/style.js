import {StyleSheet, Platform} from 'react-native';
import * as defaultStyle from '../../../style';

const STYLESHEET_ID = 'stylesheet.day.basic';

export default function styleConstructor(theme={}) {
  const appStyle = {...defaultStyle, ...theme};
  return StyleSheet.create({
    base: {
      width: 32,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    date: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center'
    },    
    text: {
      marginTop: 0,
      fontSize: appStyle.textDayFontSize,
      fontFamily: appStyle.textDayFontFamily,
      fontWeight: '300',
      color: appStyle.dayTextColor,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      overflow: 'hidden'
    },
    alignedText: {
      marginTop: Platform.OS === 'android' ? 4 : 6
    },
    selected: {
      backgroundColor: appStyle.selectedDayBackgroundColor,
      borderRadius: 16
    },
    selectedToday: {
      backgroundColor: appStyle.selectedTodayBackgroundColor,
      borderRadius: 16
    },
    selectedTodayText: {
      color: appStyle.selectedTodayTextColor,
      fontWeight: '500'
    },
    todayText: {
      color: appStyle.todayTextColor,
      fontWeight: '500'
    },
    selectedText: {
      color: appStyle.selectedDayTextColor
    },
    disabledText: {
      color: appStyle.textDisabledColor
    },
    weekend: {
      backgroundColor: appStyle.weekendBackgroundColor
    },
    dotContainer: {
      marginTop: 2,
      height: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dot: {
      width: 4,
      height: 4,
      marginTop: 1,
      marginLeft: 1,
      marginRight: 1,
      borderRadius: 2,
      opacity: 0
    },
    visibleDot: {
      opacity: 1,
      backgroundColor: appStyle.dotColor
    },
    selectedDot: {
      backgroundColor: appStyle.selectedDotColor
    },
    ...(theme[STYLESHEET_ID] || {})
  });
}
