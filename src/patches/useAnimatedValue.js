import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Custom hook to create and manage animated values
 * This patch fixes the missing module in react-native-tab-view
 * @param {number} initialValue - Initial value for the animation
 * @returns {Animated.Value} - Animated value reference
 */
export function useAnimatedValue(initialValue) {
  const animatedValue = useRef(new Animated.Value(initialValue));
  return animatedValue.current;
}
