import { defineStore } from 'pinia';
import { ref } from 'vue';
import { propertyService, type ImageResponse } from '../services/propertyService';
import type { Property } from '@/types/property';

export const usePropertyStore = defineStore('property', () => {
  const currentProperty = ref<Property | null>(null);
  const images = ref<ImageResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchPropertyImages = async (propertyId: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      images.value = await propertyService.getPropertyImages(propertyId);
    } catch (err: unknown) {
      error.value = (err as Error).message || 'Failed to fetch images';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const setPrimaryImage = async (propertyId: string, imageId: string) => {
    try {
      await propertyService.setPrimaryImage(propertyId, imageId);
      // Update local state instead of refetching everything
      images.value = images.value.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }));
    } catch (err: unknown) {
      console.error('Error setting primary image:', err);
      throw err;
    }
  };

  const deleteImage = async (propertyId: string, imageId: string) => {
    try {
      await propertyService.deleteImage(propertyId, imageId);
      images.value = images.value.filter((img) => img.id !== imageId);
    } catch (err: unknown) {
      console.error('Error deleting image:', err);
      throw err;
    }
  };

  const reorderImages = async (propertyId: string, orderedIds: string[]) => {
    try {
      images.value = await propertyService.reorderImages(propertyId, orderedIds);
    } catch (err: unknown) {
      console.error('Error reordering images:', err);
      throw err;
    }
  };

  return {
    currentProperty,
    images,
    isLoading,
    error,
    fetchPropertyImages,
    setPrimaryImage,
    deleteImage,
    reorderImages,
  };
});
