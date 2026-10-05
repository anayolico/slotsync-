import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Pattern,
  Line,
  Circle,
} from 'react-native-svg';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AppBackgroundProps {
  variant?: 'default' | 'violet' | 'indigo' | 'emerald';
  children?: React.ReactNode;
  style?: any;
}

export default function AppBackground({
  variant = 'default',
  children,
  style,
}: AppBackgroundProps) {
  // Floating Ambient Glow Animations
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const orb3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb 1: Slow organic drift & pulse
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, {
          toValue: 1,
          duration: 6800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb1Anim, {
          toValue: 0,
          duration: 6800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Orb 2: Counter-drift with different timing to prevent sync
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, {
          toValue: 1,
          duration: 8400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb2Anim, {
          toValue: 0,
          duration: 8400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Orb 3: Slow gentle breath
    const loop3 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb3Anim, {
          toValue: 1,
          duration: 9600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb3Anim, {
          toValue: 0,
          duration: 9600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop1.start();
    loop2.start();
    loop3.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, [orb1Anim, orb2Anim, orb3Anim]);

  // Interpolations for Orb 1 (Top-Left)
  const orb1TranslateX = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-25, 25],
  });
  const orb1TranslateY = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 18],
  });
  const orb1Scale = orb1Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.0, 1.14, 1.0],
  });

  // Interpolations for Orb 2 (Top-Right)
  const orb2TranslateX = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -22],
  });
  const orb2TranslateY = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 16],
  });
  const orb2Scale = orb2Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.12, 1.0, 1.12],
  });

  // Interpolations for Orb 3 (Mid-Bottom)
  const orb3TranslateY = orb3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -14],
  });
  const orb3Opacity = orb3Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.65, 0.95, 0.65],
  });

  // Palette selection based on variant
  const isViolet = variant === 'violet';
  const isEmerald = variant === 'emerald';

  const primaryOrbColor = isViolet
    ? 'rgba(139, 92, 246, 0.16)'
    : isEmerald
    ? 'rgba(16, 185, 129, 0.15)'
    : 'rgba(99, 102, 241, 0.15)';

  const secondaryOrbColor = isViolet
    ? 'rgba(192, 132, 252, 0.13)'
    : isEmerald
    ? 'rgba(6, 182, 212, 0.12)'
    : 'rgba(124, 58, 237, 0.12)';

  const tertiaryOrbColor = isViolet
    ? 'rgba(236, 72, 153, 0.08)'
    : isEmerald
    ? 'rgba(52, 211, 153, 0.09)'
    : 'rgba(6, 182, 212, 0.08)';

  const gridLineColor = isViolet
    ? 'rgba(124, 58, 237, 0.045)'
    : 'rgba(99, 102, 241, 0.045)';

  const gridDotColor = isViolet
    ? 'rgba(124, 58, 237, 0.085)'
    : 'rgba(99, 102, 241, 0.085)';

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      {/* ── Base Linear Gradient Canvas ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor={isViolet ? '#F8F5FF' : isEmerald ? '#F0FDF4' : '#F4F7FC'}
                stopOpacity={1}
              />
              <Stop
                offset="30%"
                stopColor={isViolet ? '#FAF8FF' : isEmerald ? '#F6FEFA' : '#F6F8FD'}
                stopOpacity={1}
              />
              <Stop
                offset="70%"
                stopColor="#F8FAFC"
                stopOpacity={1}
              />
              <Stop
                offset="100%"
                stopColor={isViolet ? '#F5F2FC' : isEmerald ? '#F2FBF6' : '#EEF2FB'}
                stopOpacity={1}
              />
            </LinearGradient>

            {/* Architectural Grid Pattern (34x34px) */}
            <Pattern
              id="gridPattern"
              width={34}
              height={34}
              patternUnits="userSpaceOnUse"
            >
              <Line
                x1={0}
                y1={0}
                x2={34}
                y2={0}
                stroke={gridLineColor}
                strokeWidth={0.8}
              />
              <Line
                x1={0}
                y1={0}
                x2={0}
                y2={34}
                stroke={gridLineColor}
                strokeWidth={0.8}
              />
              {/* Intersection Coordinate Dot */}
              <Circle
                cx={0}
                cy={0}
                r={1.2}
                fill={gridDotColor}
              />
            </Pattern>

            {/* Top Linear Glow Beam */}
            <LinearGradient id="topBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={isViolet ? '#8B5CF6' : '#6366F1'} stopOpacity={0} />
              <Stop offset="30%" stopColor={isViolet ? '#A855F7' : '#818CF8'} stopOpacity={0.45} />
              <Stop offset="50%" stopColor={isViolet ? '#C084FC' : '#A5B4FC'} stopOpacity={0.7} />
              <Stop offset="70%" stopColor={isViolet ? '#8B5CF6' : '#6366F1'} stopOpacity={0.45} />
              <Stop offset="100%" stopColor={isViolet ? '#7C3AED' : '#4F46E5'} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* Fill Base Gradient */}
          <Rect width="100%" height="100%" fill="url(#bgGrad)" />

          {/* Overlay Tech Grid */}
          <Rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Top Ambient Beam Line */}
          <Rect x={0} y={0} width="100%" height={2.5} fill="url(#topBeamGrad)" />
        </Svg>
      </View>

      {/* ── Animated Floating Ambient Glowing Orbs ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Floating Orb 1: Top-Left Ambient Halo */}
        <Animated.View
          style={[
            styles.glowOrb,
            styles.glowOrbPrimary,
            {
              backgroundColor: primaryOrbColor,
              transform: [
                { translateX: orb1TranslateX },
                { translateY: orb1TranslateY },
                { scale: orb1Scale },
              ],
            },
          ]}
        />

        {/* Floating Orb 2: Top-Right Secondary Halo */}
        <Animated.View
          style={[
            styles.glowOrb,
            styles.glowOrbSecondary,
            {
              backgroundColor: secondaryOrbColor,
              transform: [
                { translateX: orb2TranslateX },
                { translateY: orb2TranslateY },
                { scale: orb2Scale },
              ],
            },
          ]}
        />

        {/* Floating Orb 3: Center-Bottom Subtle Atmosphere */}
        <Animated.View
          style={[
            styles.glowOrb,
            styles.glowOrbTertiary,
            {
              backgroundColor: tertiaryOrbColor,
              opacity: orb3Opacity,
              transform: [{ translateY: orb3TranslateY }],
            },
          ]}
        />
      </View>

      {/* Screen Child Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowOrbPrimary: {
    top: -60,
    left: -40,
    width: 320,
    height: 320,
  },
  glowOrbSecondary: {
    top: 90,
    right: -70,
    width: 290,
    height: 290,
  },
  glowOrbTertiary: {
    bottom: 80,
    left: SCREEN_WIDTH * 0.15,
    width: 260,
    height: 260,
  },
});
