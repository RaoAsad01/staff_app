import { eventService } from '../api/apiService';

// Function to fetch updated event info and return the new scan count
export const fetchUpdatedScanCount = async (eventUuid) => {
  try {
    const eventInfoData = await eventService.fetchEventInfo(eventUuid);
    return eventInfoData?.data?.scan_count || 0;
  } catch (error) {
    console.error('Error fetching updated scan count:', error);
    return null;
  }
};

// Function to update eventInfo object with new scan count
export const updateEventInfoScanCount = (eventInfo, newScanCount) => {
  if (!eventInfo || newScanCount === null) return eventInfo;
  
  return {
    ...eventInfo,
    scanCount: newScanCount
  };
}; 