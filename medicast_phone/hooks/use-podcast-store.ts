import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PodcastFrequency = 'once' | 'weekly' | 'monthly';

interface PodcastState {
  specialty: string;
  customSpecialty: string;
  podcastLength: number;
  frequency: PodcastFrequency;
  isGenerating: boolean;
  generatedPodcasts: Array<{
    id: string;
    title: string;
    specialty: string;
    length: number;
    createdAt: string;
    audioUrl: string;
  }>;
  
  setSpecialty: (specialty: string) => void;
  setCustomSpecialty: (customSpecialty: string) => void;
  setPodcastLength: (length: number) => void;
  setFrequency: (frequency: PodcastFrequency) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  addGeneratedPodcast: (podcast: {
    id: string;
    title: string;
    specialty: string;
    length: number;
    createdAt: string;
    audioUrl: string;
  }) => void;
}

export const usePodcastStore = create<PodcastState>()(
  persist(
    (set, get) => ({
      specialty: '',
      customSpecialty: '',
      podcastLength: 10,
      frequency: 'once',
      isGenerating: false,
      generatedPodcasts: [],
      
      setSpecialty: (specialty) => set({ specialty }),
      setCustomSpecialty: (customSpecialty) => set({ customSpecialty }),
      setPodcastLength: (podcastLength) => set({ podcastLength }),
      setFrequency: (frequency) => set({ frequency }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      addGeneratedPodcast: (podcast) => {
        set({ 
          generatedPodcasts: [...get().generatedPodcasts, podcast],
          isGenerating: false
        });
      },
    }),
    {
      name: 'podcast-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);