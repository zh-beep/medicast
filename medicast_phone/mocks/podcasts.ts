import { Podcast } from '@/types/podcast';

// Function to get tomorrow's date
const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString();
};

// Function to get API URL
const getApiUrl = () => {
  // You can configure this based on environment
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
};

export const medicalPodcasts: Podcast[] = [
  {
    id: '1',
    title: 'Cardiology Update',
    author: 'Dr. Sarah Johnson',
    description: 'The latest research and clinical insights in cardiology',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1470&auto=format&fit=crop',
    episodes: [
      {
        id: '101',
        title: 'New Approaches to Heart Failure Management',
        specialty: 'Cardiology',
        duration: 1845, // 30:45
        description: 'Dr. Johnson discusses the latest guidelines for heart failure management with special guest Dr. Michael Chen, Chief of Cardiology at University Medical Center.',
        notes: 'Topics covered include:\n- SGLT2 inhibitors in heart failure\n- Updates to ACC/AHA guidelines\n- Novel biomarkers for risk stratification\n- Patient case discussions',
        audioUrl: `${getApiUrl()}/podcast/101`,
        imageUrl: 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?q=80&w=1470&auto=format&fit=crop',
        publishedAt: getTomorrowDate(),
      },
      {
        id: '102',
        title: 'Advances in Interventional Cardiology',
        specialty: 'Cardiology',
        duration: 2250, // 37:30
        description: 'A comprehensive review of recent innovations in interventional cardiology procedures and technologies.',
        notes: 'Key points:\n- TAVR vs. SAVR outcomes\n- New stent technologies\n- Structural heart interventions\n- Post-procedure care protocols',
        audioUrl: `${getApiUrl()}/podcast/102`,
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470&auto=format&fit=crop',
        publishedAt: getTomorrowDate(),
      }
    ]
  },
  {
    id: '2',
    title: 'Neurology Insights',
    author: 'Dr. David Park',
    description: 'Exploring the latest developments in neurology and neuroscience',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-7cb057fba93c?q=80&w=1471&auto=format&fit=crop',
    episodes: [
      {
        id: '201',
        title: 'Migraine Management: New Therapeutic Approaches',
        specialty: 'Neurology',
        duration: 2100, // 35:00
        description: 'Dr. Park reviews the latest CGRP antagonists and other novel treatments for migraine prevention and acute management.',
        notes: 'Highlights:\n- CGRP pathway and migraine pathophysiology\n- Monoclonal antibodies for prevention\n- Small molecule antagonists\n- Patient selection criteria',
        audioUrl: `${getApiUrl()}/podcast/201`,
        imageUrl: 'https://images.unsplash.com/photo-1566669437687-7040a6926753?q=80&w=1374&auto=format&fit=crop',
        publishedAt: getTomorrowDate(),
      }
    ]
  }
];