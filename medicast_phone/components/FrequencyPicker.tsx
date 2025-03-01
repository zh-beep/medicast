import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';
import { ChevronDown } from 'lucide-react-native';
import { PodcastFrequency } from '@/hooks/use-podcast-store';

interface FrequencyPickerProps {
  value: PodcastFrequency;
  onChange: (value: PodcastFrequency) => void;
}

const frequencyOptions: { value: PodcastFrequency; label: string }[] = [
  { value: 'once', label: 'Once' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const FrequencyPicker: React.FC<FrequencyPickerProps> = ({ value, onChange }) => {
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedOption = frequencyOptions.find(option => option.value === value);
  
  return (
    <View>
      <Pressable
        style={[
          styles.pickerButton,
          { 
            backgroundColor: theme === 'dark' ? colors.card : 'white',
            borderColor: colors.border
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerText, { color: colors.text }]}>
          {selectedOption?.label || 'Select frequency'}
        </Text>
        <ChevronDown size={18} color={colors.icon} />
      </Pressable>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: theme === 'dark' ? colors.card : 'white',
                borderColor: colors.border
              }
            ]}
          >
            <FlatList
              data={frequencyOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.optionItem,
                    item.value === value && { 
                      backgroundColor: theme === 'dark' 
                        ? 'rgba(59, 130, 246, 0.2)' 
                        : 'rgba(59, 130, 246, 0.1)' 
                    }
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.optionText, 
                      { 
                        color: item.value === value ? colors.primary : colors.text,
                        fontWeight: item.value === value ? '600' : 'normal'
                      }
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 48,
  },
  pickerText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '50%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 16,
  },
});