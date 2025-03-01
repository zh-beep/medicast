import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Slider } from '@/components/Slider';
import { useAudioStore } from '@/hooks/use-audio-store';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX } from 'lucide-react-native';
import { scheduleNotification } from '@/utils/notifications';

export const AudioPlayer = () => {
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { 
    isPlaying, 
    currentTime, 
    duration,
    volume,
    currentEpisode,
    setIsPlaying, 
    setCurrentTime,
    setDuration,
    setVolume
  } = useAudioStore();
  
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element for web
  useEffect(() => {
    console.log('AudioPlayer mounted');
    
    if (Platform.OS === 'web') {
      console.log('Creating audio element for web');
      if (!audioRef.current && typeof window !== 'undefined') {
        audioRef.current = new Audio();
        console.log('Audio element created');
        
        // Add event listeners
        audioRef.current.addEventListener('timeupdate', () => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        });
        
        audioRef.current.addEventListener('ended', () => {
          console.log('Audio playback ended');
          setIsPlaying(false);
          setCurrentTime(0);
          setHasEnded(true);
          
          // Send notification when podcast finishes
          if (Platform.OS !== 'web' && currentEpisode) {
            scheduleNotification(
              'Podcast Completed', 
              `You've finished listening to ${currentEpisode.title}`
            );
          }
        });
        
        audioRef.current.addEventListener('loadedmetadata', () => {
          if (audioRef.current) {
            console.log('Audio metadata loaded, duration:', audioRef.current.duration);
            setDuration(audioRef.current.duration);
          }
        });
        
        // Add error handling
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          console.error('Error code:', audioRef.current?.error?.code);
          console.error('Error message:', audioRef.current?.error?.message);
          setIsPlaying(false);
        });
      }
    }
    
    return () => {
      console.log('AudioPlayer unmounting');
      if (Platform.OS === 'web' && audioRef.current) {
        console.log('Cleaning up audio element');
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Handle episode changes
  useEffect(() => {
    if (currentEpisode) {
      console.log('Loading episode:', currentEpisode.title);
      console.log('Audio URL:', currentEpisode.audioUrl);
      setHasEnded(false);
      
      if (Platform.OS === 'web' && audioRef.current) {
        // Set the audio source
        console.log('Setting audio source for web');
        audioRef.current.src = currentEpisode.audioUrl;
        audioRef.current.load();
        console.log('Audio loaded');
        
        if (isPlaying) {
          console.log('Auto-playing after load');
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Audio playback error:", error);
              setIsPlaying(false);
            });
          }
        }
      } else {
        // For non-web platforms, simulate playback
        console.log('Simulating playback for non-web platform');
        setDuration(12); // Default to 12 seconds for our sample
        setCurrentTime(0);
      }
    }
  }, [currentEpisode]);
  
  // Handle play/pause
  useEffect(() => {
    if (Platform.OS === 'web' && audioRef.current && currentEpisode) {
      if (isPlaying) {
        console.log('Playing audio...');
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio playback error:", error);
            setIsPlaying(false);
          });
        }
      } else {
        console.log('Pausing audio...');
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    if (Platform.OS === 'web' && audioRef.current) {
      console.log('Setting volume:', volume);
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Simulate audio playback for non-web platforms
  useEffect(() => {
    if (!currentEpisode || Platform.OS === 'web') return;
    
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      console.log('Starting simulation interval for non-web platform');
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            console.log('Simulation reached end');
            setIsPlaying(false);
            setHasEnded(true);
            
            // Send notification when podcast finishes
            if (currentEpisode) {
              scheduleNotification(
                'Podcast Completed', 
                `You've finished listening to ${currentEpisode.title}`
              );
            }
            
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    
    return () => {
      if (interval) {
        console.log('Clearing simulation interval');
        clearInterval(interval);
      }
    };
  }, [isPlaying, currentEpisode, duration, Platform.OS]);
  
  const handlePlayPause = () => {
    console.log('Play/Pause clicked, current state:', isPlaying);
    
    // If the audio has ended, reset to beginning
    if (hasEnded) {
      setCurrentTime(0);
      setHasEnded(false);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (value: number) => {
    console.log('Seeking to:', value);
    setCurrentTime(value);
    if (Platform.OS === 'web' && audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };
  
  const handleSkipBackward = () => {
    const newTime = Math.max(0, currentTime - 10);
    console.log('Skipping backward to:', newTime);
    setCurrentTime(newTime);
    if (Platform.OS === 'web' && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    console.log('Skipping forward to:', newTime);
    setCurrentTime(newTime);
    if (Platform.OS === 'web' && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  const handleVolumeChange = (value: number) => {
    console.log('Changing volume to:', value);
    setVolume(value);
  };
  
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} color={colors.icon} />;
    if (volume < 0.5) return <Volume1 size={20} color={colors.icon} />;
    return <Volume2 size={20} color={colors.icon} />;
  };
  
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (!currentEpisode) {
    console.log('No current episode, not rendering player');
    return null;
  }
  
  console.log('Rendering player with episode:', currentEpisode.title);
  console.log('Current time:', currentTime, 'Duration:', duration);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.episodeInfo}>
        <Text style={[styles.episodeTitle, { color: colors.text }]} numberOfLines={1}>
          {currentEpisode.title}
        </Text>
        <Text style={[styles.episodeSpecialty, { color: colors.subtext }]}>
          {currentEpisode.specialty}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <Slider
          value={currentTime}
          minimumValue={0}
          maximumValue={duration || 12} // Default to 12 seconds if duration not loaded
          step={0.1}
          onValueChange={handleSeek}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.subtext }]}>
            {formatTime(currentTime)}
          </Text>
          <Text style={[styles.timeText, { color: colors.subtext }]}>
            {formatTime(duration || 12)}
          </Text>
        </View>
      </View>
      
      <View style={styles.controlsContainer}>
        <Pressable 
          onPress={() => setShowVolumeControl(!showVolumeControl)}
          style={styles.volumeButton}
        >
          {getVolumeIcon()}
        </Pressable>
        
        {showVolumeControl && Platform.OS === 'web' && (
          <View style={styles.volumeSliderContainer}>
            <Slider
              value={volume}
              minimumValue={0}
              maximumValue={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
              style={styles.volumeSlider}
            />
          </View>
        )}
        
        <View style={styles.mainControls}>
          <Pressable onPress={handleSkipBackward} style={styles.controlButton}>
            <SkipBack size={24} color={colors.icon} />
          </Pressable>
          
          <Pressable onPress={handlePlayPause} style={styles.playButton}>
            {isPlaying ? (
              <Pause size={28} color={colors.background} />
            ) : (
              <Play size={28} color={colors.background} />
            )}
          </Pressable>
          
          <Pressable onPress={handleSkipForward} style={styles.controlButton}>
            <SkipForward size={24} color={colors.icon} />
          </Pressable>
        </View>
        
        <View style={styles.placeholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  episodeInfo: {
    marginBottom: 12,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeSpecialty: {
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  volumeButton: {
    padding: 12,
  },
  volumeSliderContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    width: 36,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  volumeSlider: {
    height: '100%',
    transform: [{ rotate: '-90deg' }],
  },
  placeholder: {
    width: 44,
  },
});