import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePodcastStore } from '@/hooks/use-podcast-store';
import { FrequencyPicker } from '@/components/FrequencyPicker';
import { Slider } from '@/components/Slider';
import { 
  Moon, 
  Volume2, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Mic,
  Clock,
  Calendar,
  Search
} from 'lucide-react-native';

export default function SettingsScreen() {
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { 
    specialty, 
    customSpecialty, 
    podcastLength, 
    frequency,
    setSpecialty,
    setCustomSpecialty,
    setPodcastLength,
    setFrequency
  } = usePodcastStore();
  
  const handleCustomSpecialtyChange = (text: string) => {
    setCustomSpecialty(text);
    setSpecialty('');
  };
  
  const SettingItem = ({ 
    icon, 
    title, 
    subtitle = null,
    onPress = null,
  }) => (
    <Pressable 
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
        {icon}
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.subtext }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {onPress && <ChevronRight size={20} color={colors.icon} />}
    </Pressable>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Settings',
        headerStyle: { 
          backgroundColor: 'transparent',
        },
        headerTransparent: true,
        headerTintColor: colors.text,
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Appearance
        </Text>
        
        <ThemeToggle />
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Podcast Preferences
        </Text>
        
        <View style={[styles.preferencesCard, { backgroundColor: colors.card }]}>
          <View style={styles.preferenceSection}>
            <View style={styles.preferenceHeader}>
              <Mic size={20} color={colors.primary} />
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                Medical Specialty
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.searchIconContainer}>
                <Search size={16} color={colors.icon} />
              </View>
              <TextInput
                value={customSpecialty}
                onChangeText={handleCustomSpecialtyChange}
                placeholder="E.g., Nephrology, Oncology..."
                placeholderTextColor={colors.subtext}
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme === 'dark' ? colors.card : 'white',
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
              />
            </View>
          </View>
          
          <View style={styles.preferenceSection}>
            <View style={styles.preferenceHeader}>
              <Clock size={20} color={colors.primary} />
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                Episode Length: {podcastLength} minutes
              </Text>
            </View>
            
            <Slider
              value={podcastLength}
              minimumValue={5}
              maximumValue={15}
              step={5}
              onValueChange={setPodcastLength}
              showMarkers={true}
              markerValues={[5, 10, 15]}
              markerLabels={['5 min', '10 min', '15 min']}
              style={styles.slider}
            />
          </View>
          
          <View style={[styles.preferenceSection, styles.lastPreferenceSection]}>
            <View style={styles.preferenceHeader}>
              <Calendar size={20} color={colors.primary} />
              <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                Generation Frequency
              </Text>
            </View>
            
            <FrequencyPicker
              value={frequency}
              onChange={setFrequency}
            />
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Playback
        </Text>
        
        <SettingItem
          icon={<Volume2 size={20} color={colors.icon} />}
          title="Audio Quality"
          subtitle="High quality (uses more data)"
          onPress={() => {}}
        />
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Notifications
        </Text>
        
        <SettingItem
          icon={<Bell size={20} color={colors.icon} />}
          title="Push notifications"
          subtitle="Get notified when your podcast is ready"
          onPress={() => {}}
        />
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About
        </Text>
        
        <SettingItem
          icon={<Shield size={20} color={colors.icon} />}
          title="Privacy Policy"
          onPress={() => {}}
        />
        
        <SettingItem
          icon={<HelpCircle size={20} color={colors.icon} />}
          title="Help & Support"
          onPress={() => {}}
        />
        
        <SettingItem
          icon={<LogOut size={20} color={colors.primary} />}
          title="Sign Out"
          onPress={() => {}}
        />
        
        <Text style={[styles.versionText, { color: colors.subtext }]}>
          MediCast v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 100,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  preferencesCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceSection: {
    marginBottom: 28,
  },
  lastPreferenceSection: {
    marginBottom: 0,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  searchIconContainer: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 40,
    fontSize: 16,
  },
  slider: {
    marginTop: 16,
  },
});