import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Podcast } from '@/types/podcast';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';

interface PodcastCardProps {
  podcast: Podcast;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ podcast }) => {
  const router = useRouter();
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const handlePress = () => {
    router.push(`/podcast/${podcast.id}`);
  };
  
  return (
    <Pressable 
      style={[styles.container, { backgroundColor: colors.card }]} 
      onPress={handlePress}
    >
      <Image source={{ uri: podcast.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {podcast.title}
        </Text>
        <Text style={[styles.author, { color: colors.subtext }]} numberOfLines={1}>
          {podcast.author}
        </Text>
        <Text style={[styles.episodeCount, { color: colors.subtext }]}>
          {podcast.episodes.length} episode{podcast.episodes.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 4,
  },
  episodeCount: {
    fontSize: 12,
  },
});