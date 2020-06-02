import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

import PropTypes from 'prop-types';

const AnimationState = Object.freeze({
  expanding: 'EXPANDING',
  expanded: 'EXPANDED',
  contracting: 'CONTRACTING',
  fadingIn: 'FADING_IN',
  idle: 'IDLE',
});

type PIPViewProps = {
  mainView: any,
  miniView: any,
}

const PIPView = (props: PIPViewProps) => {
  const {
    mainView,
    miniView,
  } = props;

  const [transitionAnimValue] = useState(new Animated.Value(0));

  const [layoutDimensions, setLayoutDimensions] = useState({width: null, height: null});
  const [animationState, setAnimationState] = useState(AnimationState.idle);
  const [areViewsSwapped, setAreViewsSwapped] = useState(false);
  const [isMiniViewExpanded, setIsMiniViewExpanded] = useState(false);

  // useEffect(() => {
  //   animateTransition();
  // }, []);


  const setDimensions = ({
    nativeEvent: {layout: {width, height}},
  }) => {
    // setLayoutDimensions({
    //   width,
    //   height,
    // });
  };

  const animateExpandMiniView = () => {
    if (isMiniViewExpanded) {
      setAnimationState(AnimationState.contracting);
    } else {
      setAnimationState(AnimationState.expanding);
    }

    Animated.timing(
      transitionAnimValue,
      {
        toValue: isMiniViewExpanded ? 0 : 1,
        duration: 500,
        useNativeDriver: false,
      },
    ).start(() => {
      if (isMiniViewExpanded) {
        setAnimationState(AnimationState.idle);
      } else {
        setAnimationState(AnimationState.expanded);
      }
      setIsMiniViewExpanded(!isMiniViewExpanded);
    });
  }

  const animateSwapViewTransition = () => {
    setAnimationState(AnimationState.expanding);
    Animated.timing(
      transitionAnimValue,
      {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      },
    ).start(() => {
      setAreViewsSwapped(!areViewsSwapped);
      setAnimationState(AnimationState.fadingIn);
      Animated.timing(
        transitionAnimValue,
        {
          toValue: 2,
          duration: 300,
          useNativeDriver: false,
        },
      ).start(() => {
        setAnimationState(AnimationState.idle);
        transitionAnimValue.setValue(0); // Reset animation
      });
    });
  }

  const onPress = (view: 'miniview' | 'mainview') => {
    if (view === 'miniview') {
      if (areViewsSwapped) {
        animateSwapViewTransition();
      } else {
        animateExpandMiniView();
      }
    } else if (view === 'mainview') {
      if (areViewsSwapped) {
        animateExpandMiniView();
      } else {
        animateSwapViewTransition();
      }
    }
  }

  // TODO: (AR) rename these
  const getExpandedViewStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      zIndex: 1,
    };
    switch (animationState) {
      default:
        return {
          ...baseStyle,
        };
    }
  };

  const getContractedViewStyle = () => {
    const baseStyle = {
      zIndex: 2,
    };

    switch (animationState) {
      case AnimationState.contracting:
      case AnimationState.expanding:
      case AnimationState.expanded:
        return {
          ...baseStyle,
          width: transitionAnimValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['10%', '100%'],
          }),
          height: transitionAnimValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['10%', '100%'],
          }),
          top: transitionAnimValue.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          }),
          right: transitionAnimValue.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          }),
        }

      case AnimationState.fadingIn:
        return {
          ...baseStyle,
          width: 50,
          height: 50,
          top: 10,
          right: 10,
          opacity: transitionAnimValue.interpolate({
            inputRange: [1, 2],
            outputRange: [0, 1],
          }),
        };

      default:
        return {
          ...baseStyle,
          width: 50,
          height: 50,
          top: 10,
          right: 10,
        };

    }
  };

  return(
    <View
      onLayout={setDimensions}
      style={{
        width: '100%',
        height: '100%',
      }}
    >

    <Animated.View
      style={[
        areViewsSwapped ? getContractedViewStyle() : getExpandedViewStyle(),
        {
          position: 'absolute',
        },
      ]}
    >
      <TouchableWithoutFeedback
        onPress={() => onPress('mainview')}
      >
        {mainView}
      </TouchableWithoutFeedback>
    </Animated.View>

    <Animated.View
      style={[
        areViewsSwapped ? getExpandedViewStyle() : getContractedViewStyle(),
        {
          position: 'absolute',
        },
      ]}
    >
      <TouchableWithoutFeedback
        onPress={() => onPress('miniview')}
      >
        {miniView}
      </TouchableWithoutFeedback>
    </Animated.View>

    </View>
  );
};


export default PIPView;
