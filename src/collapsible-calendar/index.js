import React, {Component} from 'react';
import { View, ViewPropTypes, Text, Animated, ScrollView, Dimensions, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import XDate from 'xdate';
import dateutils from '../dateutils';
import {xdateToData, parseDate} from '../interface';
import styleConstructor from './style';
import Day from './day/basic';
import UnitDay from './day/interactive';
import MultiDotDay from './day/multi-dot';
import CalendarHeader from './header';
import shouldComponentUpdate from './updater';
import { weekDayNames, fromTo, firstSelectedDate } from '../dateutils';

//Fallback when RN version is < 0.44
const viewPropTypes = ViewPropTypes || View.propTypes;

const EmptyArray = [];

class CollapsibleCalendar extends Component {
  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    // Collection of dates that have to be marked. Default = {}
    markedDates: PropTypes.object,

    // Specify style for calendar container element. Default = {}
    style: viewPropTypes.style,
    // Initially visible month. Default = Date()
    current: PropTypes.any,
    // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
    minDate: PropTypes.any,
    // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
    maxDate: PropTypes.any,

    // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
    firstDay: PropTypes.number,

    // Date marking style [simple/interactive]. Default = 'simple'
    markingType: PropTypes.string,

    // Hide month navigation arrows. Default = false
    hideArrows: PropTypes.bool,
    // Display loading indicador. Default = false
    displayLoadingIndicator: PropTypes.bool,
    // Do not show days of other months in month page. Default = false
    hideExtraDays: PropTypes.bool,

    // Handler which gets executed on day press. Default = undefined
    onDayPress: PropTypes.func,
    // Handler which gets executed when visible month changes in calendar. Default = undefined
    onMonthChange: PropTypes.func,
    onVisibleMonthsChange: PropTypes.func,
    // Replace default arrows with custom ones (direction can be 'left' or 'right')
    renderArrow: PropTypes.func,
    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
    monthFormat: PropTypes.string,
    // Disables changing month when click on days of other months (when hideExtraDays is false). Default = false
    disableMonthChange: PropTypes.bool,
    //Hide day names. Default = false
    hideDayNames: PropTypes.bool,
    //Disable days by default. Default = false
    disabledByDefault: PropTypes.bool,
    // Display content below calendar
    footer: PropTypes.object,
    // Divider image below the month name
    dividerImage: PropTypes.any,
    // Min height and max height of the calendar
    heightLimits: PropTypes.object
  };

  collapsibleMinHeight;
  collapsibleMaxHeight;

  constructor(props) {
    super(props);
    this.style = styleConstructor(this.props.theme);
    let currentMonth;
    if (props.current) {
      currentMonth = parseDate(props.current);
    } else {
      currentMonth = XDate();
    }

    this.collapsibleMinHeight = StyleSheet.flatten(this.style.collapsible).minHeight;
    this.collapsibleMaxHeight = StyleSheet.flatten(this.style.collapsible).maxHeight;

    this.state = {
      currentMonth,
      expanded: false,
      selectedDay: new XDate(),
      calendarHeight: new Animated.Value(this.collapsibleMinHeight),
      calendarOpacity: new Animated.Value(0),
      dateListOpacity: new Animated.Value(1)
    };

    this.updateMonth = this.updateMonth.bind(this);
    this.addMonth = this.addMonth.bind(this);
    this.pressDay = this.pressDay.bind(this);
    this.shouldComponentUpdate = shouldComponentUpdate;
    this.toggleCalendarView = this.toggleCalendarView.bind(this);
    this.onDateListScroll = this.onDateListScroll.bind(this);

  }

  componentWillMount() {
    setTimeout(() => { this.scrollToDate(); }, 100);
  }

  componentWillReceiveProps(nextProps) {
    const current= parseDate(nextProps.current);
    if (current && current.toString('yyyy MM') !== this.state.currentMonth.toString('yyyy MM')) {
      this.setState({
        currentMonth: current.clone()
      });
    }

    if (this.props.markedDates !== nextProps.markedDates) {
      const currentSelectedDate = firstSelectedDate(this.props.markedDates);
      const newSelectedDate = firstSelectedDate(nextProps.markedDates);
      if (newSelectedDate && currentSelectedDate !== newSelectedDate) {
        this.setState({
          selectedDay: parseDate(newSelectedDate)
        });
      }
    }
  }

  updateMonth(day, doNotTriggerListeners) {
    if (day.toString('yyyy MM') === this.state.currentMonth.toString('yyyy MM')) {
      return;
    }
    this.setState({
      currentMonth: day.clone()
    }, () => {
      if (!doNotTriggerListeners) {
        const currMont = this.state.currentMonth.clone();
        if (this.props.onMonthChange) {
          this.props.onMonthChange(xdateToData(currMont));
        }
        if (this.props.onVisibleMonthsChange) {
          this.props.onVisibleMonthsChange([xdateToData(currMont)]);
        }
      }
    });
  }

  pressDay(day) {
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    if (!(minDate && !dateutils.isGTE(day, minDate)) && !(maxDate && !dateutils.isLTE(day, maxDate))) {
      const shouldUpdateMonth = this.props.disableMonthChange === undefined || !this.props.disableMonthChange;
      if (shouldUpdateMonth && this.state.expanded) {
        this.updateMonth(day);
      }

      this.setState({
        selectedDay: day
      });

      if (this.props.onDayPress) {
        this.props.onDayPress(xdateToData(day));
      }
    }
  }

  addMonth(count) {
    this.updateMonth(this.state.currentMonth.clone().addMonths(count, true));
  }

  getFirstDayInWeek(date) {
    let diff = date.getDay() - this.props.firstDay;
    if (diff < 0) {
      diff += 7;
    }
    return date.clone().addDays(-diff);
  }

  scrollToDate() {
    if (this.dateListScroll) {      
      const selectedDay = this.state.selectedDay;
      let scrollToDay;
      if (selectedDay) {
        scrollToDay = new XDate(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), 1, 0, 0, 0, true);
        scrollToDay = this.getFirstDayInWeek(scrollToDay);
      } else {
        const currentMonth = this.state.currentMonth;
        scrollToDay = new XDate(currentMonth.getFullYear(), currentMonth.getMonth(), 1, 0, 0, 0, true);
      }

      const minDate = parseDate(this.props.minDate);
      const firstDay = this.getFirstDayInWeek(minDate);
      const dayIndex = firstDay.diffDays(scrollToDay);
      let xPosition = 0;
      if (dayIndex > -1) {
        xPosition = dayIndex * this.getDayWidth();
      }

      this.dateListScroll.scrollTo({y: 0, x: xPosition, animated: false});
      this.setMonthHeader(scrollToDay);
    }
  }

  setMonthHeader(date) {
    const selectedDay = this.state.selectedDay;
    let currentDate = date;
    if (selectedDay) {
      const diff = date.diffDays(selectedDay); 
      if (diff >= 0 && diff < 7) {
        currentDate = selectedDay;
      }
    }
    this.updateMonth(currentDate);
  }

  getDayWidth() {
    const screenWidth = Dimensions.get('window').width;
    return screenWidth / 7;
  }

  onDateListScroll(event) {
    const xpos = event.nativeEvent.contentOffset.x;

    // On Android, onScroll could be triggered even though there is no scroll and x-position will be near 0.
    if (xpos < 1) {
      return;
    }
    const minDate = parseDate(this.props.minDate);
    const firstDay = this.getFirstDayInWeek(minDate);

    // Add 10 offset becase x-position might be off screen
    const dayIndex = Math.floor((xpos + 10) / this.getDayWidth());
    firstDay.addDays(dayIndex);

    const shouldUpdateMonth = (this.props.disableMonthChange === undefined || !this.props.disableMonthChange);
    if (shouldUpdateMonth) {
      this.setMonthHeader(firstDay);
    }
  }

  toggleCalendarView() {
    this.changeCalendarView(!this.state.expanded);
  }

  changeCalendarView(expand) {
    if (this.state.expanded === expand) {
      return;
    }

    let startHeight;
    let endHeight;
    let startOpacity;
    let endOpacity;
    if (expand) {
      startHeight = this.collapsibleMinHeight;
      endHeight = this.collapsibleMaxHeight;
      startOpacity = 0;
      endOpacity = 1;
      
    } else {
      startHeight = this.collapsibleMaxHeight;
      endHeight = this.collapsibleMinHeight;
      startOpacity = 1;
      endOpacity = 0;

      setTimeout(() => { this.scrollToDate(); }, 10);
    }

    this.setState({
      expanded : expand
    });

    this.state.calendarHeight.setValue(startHeight);
    this.state.calendarOpacity.setValue(startOpacity);
    this.state.dateListOpacity.setValue(1 - startOpacity);

    Animated.parallel([
      Animated.spring(
        this.state.calendarHeight,
        {
          toValue: endHeight,
          bounciness: 0
        }
      ),
      Animated.spring(
        this.state.calendarOpacity, {
          toValue: endOpacity,
          bounciness: 0
        }
      ), 
      Animated.spring(
        this.state.dateListOpacity, {
          toValue: 1 - endOpacity,
          bounciness: 0
        }
      )]).start();
  }

  renderDay(day, id, enableDiffMonth = false, highlightWeekend = true) {
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    let state = '';
    if (this.props.disabledByDefault) {
      state = 'disabled';
    } else if ((minDate && !dateutils.isGTE(day, minDate)) || (maxDate && !dateutils.isLTE(day, maxDate))) {
      state = 'disabled';
    } else if (!dateutils.sameMonth(day, this.state.currentMonth) && !enableDiffMonth) {
      state = 'disabled';
    } else if (dateutils.sameDate(day, XDate())) {
      state = 'today';
    }
    let dayComp;
    if (!dateutils.sameMonth(day, this.state.currentMonth) && this.props.hideExtraDays) {
      if (this.props.markingType === 'interactive') {
        dayComp = (<View key={id} style={{flex: 1}}/>);
      } else {
        dayComp = (<View key={id} style={{width: 32}}/>);
      }
    } else {
      const DayComp = this.getDayComponent();
      dayComp = (
        <DayComp
          key={id}
          state={state}
          theme={this.props.theme}
          onPress={this.pressDay}
          day={day}
          marked={this.getDateMarking(day)}
          highlightWeekend={highlightWeekend}
        >
          {day.getDate()}
        </DayComp>
      );
    }
    return dayComp;
  }

  getDayComponent() {
    switch (this.props.markingType) {
    case 'interactive':
      return UnitDay;
    case 'multi-dot':
      return MultiDotDay;
    default:
      return Day;
    }
  }

  getDateMarking(day) {
    if (!this.props.markedDates) {
      return false;
    }
    const dates = this.props.markedDates[day.toString('yyyy-MM-dd')] || EmptyArray;
    if (dates.length || dates) {
      return dates;
    } else {
      return false;
    }
  }

  renderWeek(days, id) {
    const week = [];
    days.forEach((day, id2) => {
      week.push(this.renderDay(day, id2, false, true));
    }, this);
    return (<View style={this.style.week} key={id}>{week}</View>);
  }

  renderWeekView() {
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    let minDiff = minDate.getDay() - this.props.firstDay;
    if (minDiff < 0) {
      minDiff += 7;
    }
    minDate.addDays(-minDiff);

    let maxDiff = 6 - maxDate.getDay() + this.props.firstDay;
    if (maxDiff > 6) {
      maxDiff -= 7;
    }
    maxDate.addDays(maxDiff);

    const days = fromTo(minDate, maxDate);
    const week =[];
    days.forEach((day, idx) => {
      week.push(this.renderDay(day, idx, true, false));
    }, this);
    return (<View style={this.style.week}>{week}</View>);
  }

  render() {
    const days = dateutils.page(this.state.currentMonth, this.props.firstDay);
    const weeks = [];
    while (days.length) {
      weeks.push(this.renderWeek(days.splice(0, 7), weeks.length));
    }
    let indicator;
    const current = parseDate(this.props.current);
    if (current) {
      const lastMonthOfDay = current.clone().addMonths(1, true).setDate(1).addDays(-1).toString('yyyy-MM-dd');
      if (this.props.displayLoadingIndicator &&
          !(this.props.markedDates && this.props.markedDates[lastMonthOfDay])) {
        indicator = true;
      }
    }
    
    const weekDaysNames = weekDayNames(this.props.firstDay);
    return (
      <View style={[this.style.container, this.props.style, {backgroundColor: this.state.expanded ? '#ffffff': '#f5f5f5'}]}>
        <CalendarHeader
          theme={this.props.theme}
          hideArrows={this.props.hideArrows || !this.state.expanded}
          month={this.state.currentMonth}
          addMonth={this.addMonth}
          showIndicator={indicator}
          firstDay={this.props.firstDay}
          renderArrow={this.props.renderArrow}
          monthFormat={this.props.monthFormat}
          hideDayNames={this.props.hideDayNames}
          onMonthPress={this.toggleCalendarView}
          minDate={this.props.minDate}
          maxDate={this.props.maxDate}
          dividerImage={this.props.dividerImage}
        />

        <View style={[this.style.weekName]}>
          {weekDaysNames.map((day, idx) => (  
            <Text key={idx} style={this.style.dayHeader} numberOfLines={1}>{day}</Text>
          ))}
        </View>
        
        <Animated.View style={[this.style.collapsible, {height: this.state.calendarHeight, overflow: 'hidden', alignItems: 'center'}]}>
          <Animated.View style={{overflow: 'hidden', opacity: this.state.calendarOpacity}}>
            {weeks}
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end'}}>
              { this.props.footer }
            </View>
          </Animated.View>

          <Animated.View style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden',
            display: this.state.expanded ? 'none' : 'flex', opacity: this.state.dateListOpacity}}>
            <ScrollView ref={ref => {this.dateListScroll = ref;}} horizontal={true} pagingEnabled={true} scrollEventThrottle={0} overScrollMode='never'
              showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} onScroll={this.onDateListScroll}>
              { this.renderWeekView() }
            </ScrollView>
          </Animated.View>
        </Animated.View>

      </View>);
  }
}

export default CollapsibleCalendar;
