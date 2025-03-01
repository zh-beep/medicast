import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { medicalPodcasts } from '@/mocks/podcasts';
import { EpisodeCard } from '@/components/EpisodeCard';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useAudioStore } from '@/hooks/use-audio-store';

export default function PodcastDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const { currentEpisode } = useAudioStore();
  
  const podcast = medicalPodcasts.find(p => p.id === id);
  
  if (!podcast) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Podcast not found</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: podcast.title,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Image source={{ uri: podcast.imageUrl }} style={styles.podcastImage} />
          <View style={styles.podcastInfo}>
            <Text style={[styles.podcastTitle, { color: colors.text }]}>
              {podcast.title}
            </Text>
            <Text style={[styles.podcastAuthor, { color: colors.subtext }]}>
              {podcast.author}
            </Text>
            <Text style={[styles.episodeCount, { color: colors.subtext }]}>
              {podcast.episodes.length} episode{podcast.episodes.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.podcastDescription, { color: colors.text }]}>
          {podcast.description}
        </Text>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Episodes
        </Text>
        
        {podcast.episodes.map(episode => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </ScrollView>
      
      {currentEpisode && <AudioPlayer />}
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  podcastImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  podcastInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  podcastTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  podcastAuthor: {
    fontSize: 16,
    marginBottom: 8,
  },
  episodeCount: {
    fontSize: 14,
  },
  podcastDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});