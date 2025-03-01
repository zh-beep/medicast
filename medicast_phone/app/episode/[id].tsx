import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, Pressable, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { medicalPodcasts } from '@/mocks/podcasts';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useAudioStore } from '@/hooks/use-audio-store';
import { formatDate, formatTime } from '@/utils/format';
import { 
  Play, 
  Heart, 
  Share2, 
  Download, 
  ArrowLeft,
  ChevronDown
} from 'lucide-react-native';

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { 
    currentEpisode, 
    setCurrentEpisode, 
    isPlaying,
    setIsPlaying,
    isEpisodeLiked,
    isEpisodeDownloaded,
    toggleLike,
    toggleDownload
  } = useAudioStore();
  
  // Find the episode in all podcasts
  const episode = medicalPodcasts.flatMap(p => p.episodes).find(e => e.id === id);
  
  if (!episode) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Episode not found</Text>
      </SafeAreaView>
    );
  }
  
  const handlePlay = () => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
    }
  };
  
  const handleLike = () => {
    toggleLike(episode.id);
  };
  
  const handleDownload = () => {
    toggleDownload(episode.id);
  };
  
  const handleShare = () => {
    // Share functionality would go here
    console.log('Share episode:', episode.title);
  };
  
  const isCurrentlyPlaying = currentEpisode?.id === episode.id && isPlaying;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        headerShown: false,
      }} />
      
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.minimizeButton}>
          <ChevronDown size={24} color={colors.text} />
        </Pressable>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Image source={{ uri: episode.imageUrl }} style={styles.episodeImage} />
        
        <View style={styles.episodeInfo}>
          <View style={styles.specialtyContainer}>
            <Text style={[styles.specialtyTag, { backgroundColor: colors.primary }]}>
              {episode.specialty}
            </Text>
          </View>
          
          <Text style={[styles.episodeTitle, { color: colors.text }]}>
            {episode.title}
          </Text>
          
          <View style={styles.metaContainer}>
            <Text style={[styles.publishDate, { color: colors.subtext }]}>
              {formatDate(episode.publishedAt)}
            </Text>
            <Text style={[styles.duration, { color: colors.subtext }]}>
              {formatTime(episode.duration)}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.playButton, { backgroundColor: colors.primary }]} 
              onPress={handlePlay}
            >
              <Play size={20} color="#fff" />
              <Text style={styles.playButtonText}>
                {isCurrentlyPlaying ? 'Pause' : 'Play'}
              </Text>
            </Pressable>
            
            <View style={styles.secondaryActions}>
              <Pressable style={styles.actionButton} onPress={handleLike}>
                <Heart 
                  size={24} 
                  color={isEpisodeLiked(episode.id) ? colors.primary : colors.icon} 
                  fill={isEpisodeLiked(episode.id) ? colors.primary : 'transparent'} 
                />
              </Pressable>
              
              <Pressable style={styles.actionButton} onPress={handleShare}>
                <Share2 size={24} color={colors.icon} />
              </Pressable>
              
              <Pressable style={styles.actionButton} onPress={handleDownload}>
                <Download 
                  size={24} 
                  color={isEpisodeDownloaded(episode.id) ? colors.primary : colors.icon} 
                />
              </Pressable>
            </View>
          </View>
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {episode.description}
          </Text>
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Episode Notes
          </Text>
          <Text style={[styles.notes, { color: colors.text }]}>
            {episode.notes}
          </Text>
        </View>
      </ScrollView>
      
      {currentEpisode && <AudioPlayer />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  minimizeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  episodeImage: {
    width: '100%',
    height: 240,
  },
  episodeInfo: {
    padding: 16,
  },
  specialtyContainer: {
    marginBottom: 12,
  },
  specialtyTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  episodeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  publishDate: {
    fontSize: 14,
    marginRight: 16,
  },
  duration: {
    fontSize: 14,
  },
  actionButtons: {
    marginBottom: 24,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  playButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});