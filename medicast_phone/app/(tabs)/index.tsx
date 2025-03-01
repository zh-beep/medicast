import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';
import { Slider } from '@/components/Slider';
import { SpecialtyCard } from '@/components/SpecialtyCard';
import { FrequencyPicker } from '@/components/FrequencyPicker';
import { usePodcastStore } from '@/hooks/use-podcast-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Search, Check } from 'lucide-react-native';
import { configureNotifications, scheduleNotification } from '@/utils/notifications';

export default function GenerateScreen() {
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { 
    specialty, 
    customSpecialty, 
    podcastLength, 
    frequency,
    isGenerating,
    setSpecialty,
    setCustomSpecialty,
    setPodcastLength,
    setFrequency,
    setIsGenerating,
    addGeneratedPodcast
  } = usePodcastStore();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Pre-defined specialty cards
  const specialtyCards = [
    'Cardiology',
    'Urology',
    'Dermatology'
  ];
  
  // Initialize notifications
  useEffect(() => {
    async function setupNotifications() {
      if (Platform.OS !== 'web') {
        const enabled = await configureNotifications();
        setNotificationsEnabled(enabled);
      }
    }
    
    setupNotifications();
  }, []);
  
  const handleSubmit = async () => {
    setIsGenerating(true);
    
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/generate-podcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          specialty: specialty || customSpecialty,
          duration: podcastLength,
          frequency: frequency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate podcast');
      }

      const data = await response.json();
      
      const newPodcast = {
        id: Date.now().toString(),
        title: `${specialty || customSpecialty} Update`,
        specialty: specialty || customSpecialty,
        length: podcastLength,
        createdAt: new Date().toISOString(),
        audioUrl: `${apiUrl}/podcast/${data.podcastId}`,
      };
      
      addGeneratedPodcast(newPodcast);
      setShowSuccess(true);
      
      // Send notification
      if (notificationsEnabled && Platform.OS !== 'web') {
        scheduleNotification(
          'Podcast Generated!', 
          `Your ${podcastLength}-minute ${specialty || customSpecialty} podcast is ready to play.`
        );
      }
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating podcast:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsGenerating(false);
    }
  };
  
  const selectSpecialtyCard = (selected: string) => {
    setSpecialty(selected);
    setCustomSpecialty('');
  };
  
  const handleCustomSpecialtyChange = (text: string) => {
    setCustomSpecialty(text);
    if (text) {
      setSpecialty('');
    }
  };
  
  const isSubmitDisabled = isGenerating || (!specialty && !customSpecialty);
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'MediCast',
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
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Mic size={24} color="#fff" />
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>MediCast</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {showSuccess && (
            <View style={[styles.successAlert, { backgroundColor: theme === 'dark' ? colors.card : 'white', borderColor: '#10B981' }]}>
              <View style={styles.successIconContainer}>
                <Check size={16} color="#fff" />
              </View>
              <View style={styles.successTextContainer}>
                <Text style={[styles.successTitle, { color: colors.text }]}>
                  Your podcast is being generated!
                </Text>
                <Text style={[styles.successSubtitle, { color: colors.subtext }]}>
                  Check the Player tab when it's ready.
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Create Medical Podcast
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>
              Quick generation for busy doctors
            </Text>
          </View>
          
          <View style={styles.formSection}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Choose a specialty
            </Text>
            <View style={styles.specialtyCardsContainer}>
              {specialtyCards.map((card) => (
                <SpecialtyCard
                  key={card}
                  title={card}
                  isSelected={specialty === card}
                  onPress={() => selectSpecialtyCard(card)}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Or type your specialty
            </Text>
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
          
          <View style={styles.formSection}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Episode Length: {podcastLength} minutes
            </Text>
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
          
          <View style={styles.formSection}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Frequency
            </Text>
            <FrequencyPicker
              value={frequency}
              onChange={setFrequency}
            />
          </View>
          
          <View style={styles.submitContainer}>
            <Pressable
              style={[
                styles.submitButton,
                isSubmitDisabled && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Mic size={16} color="#fff" />
                  <Text style={styles.submitButtonText}>Generate Podcast</Text>
                </>
              )}
            </Pressable>
            
            <Text style={[styles.disclaimer, { color: colors.subtext }]}>
              Podcasts are generated using evidence-based medical content
            </Text>
          </View>
        </View>
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
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  specialtyCardsContainer: {
    flexDirection: 'row',
    gap: 8,
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
  submitContainer: {
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  successAlert: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  successIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  successSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
});