// Manual mock for react-native to avoid ESM import issues in Jest Node environment.
// Provides the minimal surface area needed by @testing-library/react-native.

const React = require('react');

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (!style) return {};
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.filter(Boolean));
    }
    return style;
  },
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
};

const Platform = {
  OS: 'ios',
  select: (obj) => (obj.ios !== undefined ? obj.ios : obj.default),
  Version: '16.0',
};

const Dimensions = {
  get: () => ({ width: 390, height: 844 }),
  addEventListener: () => {},
  removeEventListener: () => {},
};

const AccessibilityInfo = {
  isBoldTextEnabled: () => Promise.resolve(false),
  isGrayscaleEnabled: () => Promise.resolve(false),
  isInvertColorsEnabled: () => Promise.resolve(false),
  isReduceMotionEnabled: () => Promise.resolve(false),
  isReduceTransparencyEnabled: () => Promise.resolve(false),
  isScreenReaderEnabled: () => Promise.resolve(false),
};

module.exports = {
  StyleSheet,
  Platform,
  Dimensions,
  AccessibilityInfo,
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  Pressable: 'Pressable',
  Modal: 'Modal',
  Switch: 'Switch',
  Button: 'Button',
  ActivityIndicator: 'ActivityIndicator',
  FlatList: 'FlatList',
  SectionList: 'SectionList',
  RefreshControl: 'RefreshControl',
  StatusBar: 'StatusBar',
  useWindowDimensions: () => ({ width: 390, height: 844 }),
  useColorScheme: () => 'light',
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    ScrollView: 'Animated.ScrollView',
    FlatList: 'Animated.FlatList',
    createAnimatedComponent: (component) => component,
    Value: class {
      constructor(val) {
        this._value = val;
      }
    },
    timing: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    spring: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    decay: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    parallel: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    sequence: () => ({ start: (cb) => cb && cb({ finished: true }) }),
    stagger: () => ({ start: (cb) => cb && cb({ finished: true }) }),
  },
  NativeModules: {},
  NativeEventEmitter: class {
    addListener() {
      return { remove: () => {} };
    }
  },
  AppState: {
    currentState: 'active',
    addEventListener: () => ({ remove: () => {} }),
  },
  // Include process polyfill that react-native normally provides
  process: {
    env: {},
  },
};
