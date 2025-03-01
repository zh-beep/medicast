import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';
import { AudioPlayer } from '@/components/AudioPlayer';
import { usePodcastStore } from '@/hooks/use-podcast-store';
import { useAudioStore } from '@/hooks/use-audio-store';
import { Headphones, Play } from 'lucide-react-native';
import { scheduleNotification } from '@/utils/notifications';
import { Platform } from 'react-native';

export default function PlayerScreen() {
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const { generatedPodcasts } = usePodcastStore();
  const { currentEpisode, setCurrentEpisode, isPlaying, setIsPlaying } = useAudioStore();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const handlePlayPodcast = (podcast) => {
    console.log('Playing podcast:', podcast.title);
    console.log('Audio URL:', podcast.audioUrl);
    
    // Convert the generated podcast to an episode format
    const episode = {
      id: podcast.id,
      title: podcast.title,
      specialty: podcast.specialty,
      duration: podcast.length * 60, // Convert minutes to seconds
      description: `${podcast.specialty} podcast generated on ${formatDate(podcast.createdAt)}`,
      notes: '',
      audioUrl: podcast.audioUrl,
      imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1470&auto=format&fit=crop',
      publishedAt: podcast.createdAt
    };
    
    // Set as current episode to play
    setCurrentEpisode(episode);
    setIsPlaying(true);
    
    // Send notification when podcast starts playing
    if (Platform.OS !== 'web') {
      scheduleNotification(
        'Now Playing', 
        `${podcast.title} - ${podcast.length} minutes`
      );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Podcast Player',
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
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Your Medical Podcasts
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
            Listen to your generated content
          </Text>
        </View>
        
        <AudioPlayer />
        
        <View style={styles.podcastListContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Generated Podcasts
          </Text>
          
          {generatedPodcasts.length > 0 ? (
            generatedPodcasts.map((podcast) => (
              <Pressable 
                key={podcast.id} 
                style={[styles.podcastItem, { backgroundColor: colors.card }]}
                onPress={() => handlePlayPodcast(podcast)}
              >
                <View style={styles.podcastIconContainer}>
                  <Headphones size={24} color={colors.primary} />
                </View>
                <View style={styles.podcastInfo}>
                  <Text style={[styles.podcastTitle, { color: colors.text }]}>
                    {podcast.title}
                  </Text>
                  <Text style={[styles.podcastMeta, { color: colors.subtext }]}>
                    {podcast.length} minutes • {formatDate(podcast.createdAt)}
                  </Text>
                </View>
                <Pressable 
                  style={[styles.playButton, { backgroundColor: colors.primary }]}
                  onPress={() => handlePlayPodcast(podcast)}
                >
                  <Play size={16} color="#fff" />
                </Pressable>
              </Pressable>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Headphones size={48} color={colors.subtext} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No podcasts yet
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: colors.subtext }]}>
                Generate your first podcast from the Generate tab
              </Text>
            </View>
          )}
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
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  podcastListContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  podcastItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  podcastIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  podcastInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  podcastMeta: {
    fontSize: 14,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});