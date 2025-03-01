import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Episode } from '@/types/podcast';

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  currentEpisode: Episode | null;
  likedEpisodes: string[];
  downloadedEpisodes: string[];
  
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  setCurrentEpisode: (episode: Episode | null) => void;
  isEpisodeLiked: (id: string) => boolean;
  isEpisodeDownloaded: (id: string) => boolean;
  toggleLike: (id: string) => void;
  toggleDownload: (id: string) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
      volume: 1.0,
      currentEpisode: null,
      likedEpisodes: [],
      downloadedEpisodes: [],
      
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setPlaybackRate: (rate) => set({ playbackRate: rate }),
      setVolume: (volume) => set({ volume }),
      setCurrentEpisode: (episode) => {
        set({ 
          currentEpisode: episode,
          isPlaying: true,
          currentTime: 0
        });
      },
      isEpisodeLiked: (id) => {
        const { likedEpisodes } = get();
        return likedEpisodes ? likedEpisodes.includes(id) : false;
      },
      isEpisodeDownloaded: (id) => {
        const { downloadedEpisodes } = get();
        return downloadedEpisodes ? downloadedEpisodes.includes(id) : false;
      },
      toggleLike: (id) => {
        const { likedEpisodes } = get();
        const safeList = likedEpisodes || [];
        
        if (safeList.includes(id)) {
          set({ likedEpisodes: safeList.filter(episodeId => episodeId !== id) });
        } else {
          set({ likedEpisodes: [...safeList, id] });
        }
      },
      toggleDownload: (id) => {
        const { downloadedEpisodes } = get();
        const safeList = downloadedEpisodes || [];
        
        if (safeList.includes(id)) {
          set({ downloadedEpisodes: safeList.filter(episodeId => episodeId !== id) });
        } else {
          set({ downloadedEpisodes: [...safeList, id] });
        }
      },
    }),
    {
      name: 'audio-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        playbackRate: state.playbackRate,
        volume: state.volume,
        likedEpisodes: state.likedEpisodes,
        downloadedEpisodes: state.downloadedEpisodes,
      }),
    }
  )
);