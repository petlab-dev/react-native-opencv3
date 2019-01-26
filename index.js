
// @author Adam G. Freeman, adamgf@gmail.com
import { NativeModules, requireNativeComponent, View } from 'react-native';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
const  { RNOpencv3 } = NativeModules;
import { ColorConv, CvType } from './constants';
import { Mat, MatOfInt, MatOfFloat } from './mats';

const CvCameraView = requireNativeComponent('CvCameraView', CvCamera);

class CvCamera extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (<CvCameraView {...this.props} />);
  }
}

CvCamera.propTypes = {
  ...View.propTypes,
  facing: PropTypes.string
};

class CvInvokeGroup extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    groupid: PropTypes.string.isRequired
  }
  constructor(props) {
    super(props)
  }
  renderChildren() {
    const { children, groupid, cvinvoke } = this.props

    let functions = []
    let paramsArr = []
    let callbacks = []
    let groupids = []

    if (cvinvoke && cvinvoke.functions) {
      functions = cvinvoke.functions
    }
    if (cvinvoke && cvinvoke.paramsArr) {
      paramsArr = cvinvoke.paramsArr
    }
    if (cvinvoke && cvinvoke.callbacks) {
      callbacks = cvinvoke.callbacks
    }
    if (cvinvoke && cvinvoke.groupids) {
      groupids = cvinvoke.groupids
    }

    let maxIndex = React.Children.count(children)
    const newKidsOnTheBlock = React.Children.map(children,
      (child,i) => {
        if (child.type.displayName === 'CvInvokeGroup') {
            maxIndex = i
        }
        if (child.type.displayName === 'CvInvoke' && i < maxIndex) {
          const {func, params, callback} = child.props
          functions.push(func)
          paramsArr.push(params)
          callbacks.push(callback) // can be nil
          groupids.push(groupid)
        }
        else if (i <= maxIndex) {
          return React.cloneElement(child, {
            // pass info down to the next CvInvokeGroup or to the CvCamera
            ...child.props, "cvinvoke" : { "functions" : functions, "paramsArr": paramsArr, "callbacks": callbacks, "groupids": groupids }
          })
        }
    })
    return newKidsOnTheBlock
  }
  render() {
    return (
      <React.Fragment>
        {this.renderChildren()}
      </React.Fragment>
    )
  }
}

class CvInvoke extends Component {
  static propTypes = {
    func: PropTypes.string.isRequired,
    params: PropTypes.any.isRequired,
    callback: PropTypes.string
  }
  constructor(props) {
    super(props)
  }
  render() {
    const { func, params, callback } = this.props
    return (
      <CvInvoke func={func} params={params} callback={callback}/>
    )
  }
}

const RNCv = RNOpencv3

export {
  RNCv,
  CvCamera,
  CvInvoke,
  CvInvokeGroup,
  ColorConv,
  CvType,
  Mat,
  MatOfInt,
  MatOfFloat
};
