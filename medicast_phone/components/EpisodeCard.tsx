import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Episode } from '@/types/podcast';
import { formatTime, formatDate } from '@/utils/format';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';
import { Play, Heart } from 'lucide-react-native';
import { useAudioStore } from '@/hooks/use-audio-store';

interface EpisodeCardProps {
  episode: Episode;
  showPodcastTitle?: boolean;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ 
  episode,
  showPodcastTitle = false
}) => {
  const router = useRouter();
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { setCurrentEpisode, isEpisodeLiked, toggleLike } = useAudioStore();
  
  const handlePress = () => {
    router.push(`/episode/${episode.id}`);
  };
  
  const handlePlay = () => {
    setCurrentEpisode(episode);
  };
  
  const handleLike = () => {
    toggleLike(episode.id);
  };
  
  return (
    <Pressable 
      style={[styles.container, { backgroundColor: colors.card }]} 
      onPress={handlePress}
    >
      <Image source={{ uri: episode.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {episode.title}
        </Text>
        
        {showPodcastTitle && (
          <Text style={[styles.podcastTitle, { color: colors.subtext }]} numberOfLines={1}>
            {episode.specialty}
          </Text>
        )}
        
        <View style={styles.metaContainer}>
          <Text style={[styles.date, { color: colors.subtext }]}>
            {formatDate(episode.publishedAt)}
          </Text>
          <Text style={[styles.duration, { color: colors.subtext }]}>
            {formatTime(episode.duration)}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <Pressable 
          style={[styles.actionButton, { backgroundColor: colors.primary }]} 
          onPress={handlePlay}
        >
          <Play size={16} color="#fff" />
        </Pressable>
        
        <Pressable 
          style={styles.likeButton} 
          onPress={handleLike}
        >
          <Heart 
            size={20} 
            color={isEpisodeLiked(episode.id) ? colors.primary : colors.icon} 
            fill={isEpisodeLiked(episode.id) ? colors.primary : 'transparent'} 
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  podcastTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    marginRight: 12,
  },
  duration: {
    fontSize: 12,
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  likeButton: {
    padding: 4,
  },
});