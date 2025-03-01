import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';

interface SpecialtyCardProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({ 
  title, 
  isSelected, 
  onPress 
}) => {
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  return (
    <Pressable
      style={[
        styles.card,
        { 
          borderColor: isSelected ? colors.primary : theme === 'dark' ? colors.border : '#E5E7EB',
          backgroundColor: isSelected 
            ? theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
            : 'transparent'
        }
      ]}
      onPress={onPress}
    >
      <Text 
        style={[
          styles.title, 
          { 
            color: isSelected ? colors.primary : colors.text,
            fontWeight: isSelected ? '600' : 'normal'
          }
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
  },
});