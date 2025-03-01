import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure notifications
export async function configureNotifications() {
  if (Platform.OS === 'web') {
    console.log('Notifications not fully supported on web');
    return false;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get notification permissions');
    return false;
  }

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return true;
}

// Schedule a notification
export async function scheduleNotification(title: string, body: string, seconds = 1) {
  if (Platform.OS === 'web') {
    console.log('Notifications not fully supported on web');
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { seconds },
    });
    console.log('Notification scheduled');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}