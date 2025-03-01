import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, LayoutChangeEvent, Text } from 'react-native';
import { Platform } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';

interface SliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
  showMarkers?: boolean;
  markerValues?: number[];
  markerLabels?: string[];
}

export const Slider: React.FC<SliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  style,
  showMarkers = false,
  markerValues = [],
  markerLabels = [],
}) => {
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  minimumTrackTintColor = minimumTrackTintColor || colors.primary;
  maximumTrackTintColor = maximumTrackTintColor || colors.border;
  thumbTintColor = thumbTintColor || colors.primary;
  
  const [width, setWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // For web, use the native input range
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <input
          type="range"
          min={minimumValue}
          max={maximumValue}
          step={step}
          value={value}
          onChange={(e) => onValueChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: 4,
            appearance: 'none',
            backgroundColor: maximumTrackTintColor,
            outline: 'none',
            opacity: 0.7,
            transition: 'opacity .2s',
            cursor: 'pointer',
          }}
        />
        
        {showMarkers && (
          <View style={styles.labelsContainer}>
            {markerValues.map((markerValue, index) => {
              const percent = ((markerValue - minimumValue) / (maximumValue - minimumValue)) * 100;
              return (
                <View 
                  key={markerValue} 
                  style={[
                    styles.labelContainer,
                    { left: `${percent}%` }
                  ]}
                >
                  <Text style={[
                    styles.labelText, 
                    { 
                      color: value === markerValue 
                        ? colors.primary 
                        : colors.subtext 
                    }
                  ]}>
                    {markerLabels ? markerLabels[index] : `${markerValue}`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  // Calculate the position of the thumb
  const percentage = (value - minimumValue) / (maximumValue - minimumValue);
  const thumbPosition = percentage * width;

  // Handle layout changes to get the width of the slider
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setWidth(width);
  };

  // Handle touch on the track
  const handleTrackPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const newPercentage = Math.max(0, Math.min(1, locationX / width));
    const newValue = minimumValue + newPercentage * (maximumValue - minimumValue);
    
    // Snap to step
    const steps = Math.round((newValue - minimumValue) / step);
    const snappedValue = minimumValue + steps * step;
    
    onValueChange(Math.min(maximumValue, Math.max(minimumValue, snappedValue)));
  };

  return (
    <View style={[styles.sliderContainer, style]}>
      <Pressable 
        style={styles.trackContainer} 
        onLayout={handleLayout}
        onPress={handleTrackPress}
      >
        <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]} />
        <View
          style={[
            styles.filledTrack,
            {
              width: `${percentage * 100}%`,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: thumbPosition - 8, // Adjust for thumb width
              backgroundColor: thumbTintColor,
            },
          ]}
        />
      </Pressable>
      
      {showMarkers && (
        <View style={styles.labelsContainer}>
          {markerValues.map((markerValue, index) => {
            const percent = ((markerValue - minimumValue) / (maximumValue - minimumValue)) * 100;
            return (
              <View 
                key={markerValue} 
                style={[
                  styles.labelContainer,
                  { left: `${percent}%` }
                ]}
              >
                <Pressable onPress={() => onValueChange(markerValue)}>
                  <Text style={[
                    styles.labelText, 
                    { 
                      color: value === markerValue 
                        ? colors.primary 
                        : colors.subtext 
                    }
                  ]}>
                    {markerLabels ? markerLabels[index] : `${markerValue}`}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    height: 40,
  },
  container: {
    width: '100%',
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  filledTrack: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: 12,
  },
  labelsContainer: {
    position: 'relative',
    height: 20,
    marginTop: 4,
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    transform: [{ translateX: -15 }],
  },
  labelText: {
    fontSize: 12,
  },
});