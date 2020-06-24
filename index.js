import React, {
  useEffect,
  useState,
  useRef,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

import PropTypes from 'prop-types';

const AnimationState = Object.freeze({
  resizing: 'RESIZING',
  fadingIn: 'FADING_IN',
  idle: 'IDLE',
});

type PIPViewProps = {
  primaryView: any,
  secondaryView: any,
}

const PIPView = (props: PIPViewProps) => {
  const {
    primaryView,
    secondaryView,
  } = props;

  const [transitionAnimValue] = useState(new Animated.Value(0));

  const [layoutDimensions, setLayoutDimensions] = useState({width: null, height: null});
  const [animationState, setAnimationState] = useState(AnimationState.idle);
  const [areViewsSwapped, setAreViewsSwapped] = useState(false);
  const [showBackgroundDimmer, setShowBackgroundDimmer] = useState(false);
  const isMiniViewExpanded = useRef(0);

  // useEffect(() => {
  //   console.log(action);
  // });


  const setDimensions = ({
    nativeEvent: {layout: {width, height}},
  }) => {
    // setLayoutDimensions({
    //   width,
    //   height,
    // });
  };

  const toggleExpandMiniView = async (shouldDimBackground = true) => {
    setShowBackgroundDimmer(shouldDimBackground);
    setAnimationState(AnimationState.resizing);
    await new Promise((resolve) => {
      Animated.timing(
        transitionAnimValue,
        {
          toValue: isMiniViewExpanded.current ? 0 : 1,
          duration: 500,
          useNativeDriver: false,
        }
      ).start(() => {
        isMiniViewExpanded.current = !isMiniViewExpanded.current;
        resolve();
      });
    });
  };

  const animateSwapViews = async () => {
    if (!isMiniViewExpanded.current) {
      await toggleExpandMiniView(false);
    }
    setAreViewsSwapped(!areViewsSwapped);
    setAnimationState(AnimationState.fadingIn);
    await new Promise((resolve) => {
      Animated.timing(
        transitionAnimValue,
        {
          toValue: 2,
          duration: 500,
          useNativeDriver: false,
        }
      ).start(() => {
        resetAnimationState();
        resolve();
      });
    });
  };

  const resetAnimationState = () => {
    isMiniViewExpanded.current = false;
    setAnimationState(AnimationState.idle);
    transitionAnimValue.setValue(0);
  }

  const onPress = (view: 'primaryView' | 'secondaryView') => {
    const actions = new Map([
      ['primaryView', [animateSwapViews, toggleExpandMiniView]],
      ['secondaryView', [toggleExpandMiniView, animateSwapViews]],
    ]);
    const action = actions.get(view);
    if (areViewsSwapped) {
      action[1]();
    } else {
      action[0]();
    }
  }

  const shouldFadeInBackgroundShow = () => {
    return showBackgroundDimmer;
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
      zIndex: 3,
    };

    switch (animationState) {
      case AnimationState.resizing:
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
          width: '10%',
          height: '10%',
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
          width: '10%',
          height: '10%',
          top: 10,
          right: 10,
        };

    }
  };

  // The initial expanded view
  const getPrimaryViewStyle = () => {
    if (areViewsSwapped) {
      return getContractedViewStyle();
    } else {
      return getExpandedViewStyle();
    }
  };

  // The initial PIP view
  const getSecondaryViewStyle = () => {
    if (areViewsSwapped) {
      return getExpandedViewStyle();
    } else {
      return getContractedViewStyle();
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
        getPrimaryViewStyle(),
        {
          position: 'absolute',
        },
      ]}
    >
      <TouchableWithoutFeedback
        onPress={() => onPress('primaryView')}
      >
        {primaryView}
      </TouchableWithoutFeedback>
    </Animated.View>

    {
      shouldFadeInBackgroundShow() ?
      <Animated.View
        pointerEvents={animationState === AnimationState.expanded ? 'auto' : 'none'}
        style={{
          width: '100%',
          height: '100%',
          opacity: transitionAnimValue,
          backgroundColor: 'black',
          zIndex: 2,
        }}
      />
      :
      null
    }

    <Animated.View
      style={[
        getSecondaryViewStyle(),
        {
          position: 'absolute',
        },
      ]}
    >
      <TouchableWithoutFeedback
        onPress={() => onPress('secondaryView')}
      >
        {secondaryView}
      </TouchableWithoutFeedback>
    </Animated.View>

    </View>
  );
};


export default PIPView;
