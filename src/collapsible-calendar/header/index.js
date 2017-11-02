import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import XDate from 'xdate';
import PropTypes from 'prop-types';
import styleConstructor from './style';
import { sameMonth } from '../../dateutils';
import { parseDate } from '../../interface';

class CalendarHeader extends Component {
  static propTypes = {
    theme: PropTypes.object,
    hideArrows: PropTypes.bool,
    month: PropTypes.instanceOf(XDate),
    addMonth: PropTypes.func,
    showIndicator: PropTypes.bool,
    firstDay: PropTypes.number,
    renderArrow: PropTypes.func,
    hideDayNames: PropTypes.bool,
    onMonthPress: PropTypes.func,
    minDate: PropTypes.any,
    maxDate: PropTypes.any,
    dividerImage: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
    this.addMonth = this.addMonth.bind(this);
    this.substractMonth = this.substractMonth.bind(this);
  }

  addMonth() {
    this.props.addMonth(1);
  }

  substractMonth() {
    this.props.addMonth(-1);
  }

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.month.toString('yyyy MM') !==
      this.props.month.toString('yyyy MM')
    ) {
      return true;
    }
    if (nextProps.showIndicator !== this.props.showIndicator) {
      return true;
    }

    if (nextProps.hideArrows !== this.props.hideArrows) {
      return true;
    }
    return false;
  }

  render() {
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    const currentMonth = this.props.month;

    let leftArrow = <View style={{width: 24}}/>;
    let rightArrow = <View style={{width: 24}}/>;
    if (!this.props.hideArrows) {
      if (!sameMonth(currentMonth, minDate) && minDate.diffDays(currentMonth) > 0) {
        leftArrow = (
          <TouchableOpacity
            onPress={this.substractMonth}
            style={this.style.arrow}
          >
            {this.props.renderArrow
              ? this.props.renderArrow('left')
              : <Image
                source={require('../img/previous.png')}
                style={this.style.arrowImage}
              />}
          </TouchableOpacity>
        );
      }

      if (!sameMonth(currentMonth, maxDate) && currentMonth.diffDays(maxDate) > 0) {
        rightArrow = (
          <TouchableOpacity onPress={this.addMonth} style={this.style.arrow}>
            {this.props.renderArrow
              ? this.props.renderArrow('right')
              : <Image
                source={require('../img/next.png')}
                style={this.style.arrowImage}
              />}
          </TouchableOpacity>
        );
      }
    }
    let indicator;
    if (this.props.showIndicator) {
      indicator = <ActivityIndicator />;
    }
    return (
      <View>
        <View style={this.style.header}>
          {leftArrow}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center' }}>
            <TouchableOpacity onPress={this.props.onMonthPress}>
              <View style={{flexDirection: 'row'}}>
                <Text style={this.style.monthText}>
                  {this.props.month.toString(this.props.monthFormat ? this.props.monthFormat : 'MMMM yyyy')}
                </Text>
                <Text style={[{transform: [{ rotate: this.props.hideArrows ? '90deg' : '270deg'}], alignSelf: 'center', fontSize: 18, color: '#a0a0a0'}]}>&gt;</Text>
              </View>
            </TouchableOpacity>
            {indicator}
          </View>
          {rightArrow}
        </View>
        {
          this.props.dividerImage &&
          <Image source={this.props.dividerImage} style={this.style.dividerImage}/>
        }
      </View>
    );
  }
}

export default CalendarHeader;
