import {StyleSheet} from 'react-native';
import * as defaultStyle from '../style';

const STYLESHEET_ID = 'stylesheet.calendar.main';

export default function getStyle(theme={}) {
  const appStyle = {...defaultStyle, ...theme};
  return StyleSheet.create({
    container: {
      paddingLeft: 5,
      paddingRight: 5,
      flex: 1,
      backgroundColor: appStyle.calendarBackground,
      overflow: 'hidden'
    },
    collapsedContainer: {
      backgroundColor: appStyle.collapsedBackground
    },
    week: {
      marginTop: 0,
      marginBottom: 0,
      flexDirection: 'row',
      justifyContent: 'center'
    },
    weekName: {
      marginTop: 3,
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    dayHeader: {
      marginTop: 2,
      marginBottom: 2,
      width: 42,
      textAlign: 'center',
      fontSize: appStyle.textDayHeaderFontSize,
      fontFamily: appStyle.textDayHeaderFontFamily,
      color: appStyle.textSectionTitleColor
    },
    collapsibleMain: {
      minHeight: appStyle.collapsibleMinHeight,
      maxHeight: appStyle.collapsibleMaxHeight,
      overflow: 'hidden',
      alignItems: 'center'
    },
    collapsibleDateList: {
      position: 'absolute',
      top: 0,
      left: 0,
      overflow: 'hidden'
    },
    ...(theme[STYLESHEET_ID] || {})
  });
}

