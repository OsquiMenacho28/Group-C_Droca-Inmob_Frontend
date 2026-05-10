import { ref } from 'vue';
import { propertyService } from '../services/propertyService';
import { usePropertyStore } from '../stores/propertyStore';

export interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  objectKey?: string;
}

export function useImageUpload(propertyId: string) {
  const store = usePropertyStore();
  const uploadingFiles = ref<FileUploadState[]>([]);

  const uploadFiles = async (files: File[]) => {
    const newFiles = files.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    uploadingFiles.value.push(...newFiles);

    // Process each file
    for (const fileState of newFiles) {
      await processFileUpload(fileState);
    }

    // Refresh images in store after all uploads finish (or progressively)
    await store.fetchPropertyImages(propertyId);
  };

  const processFileUpload = async (fileState: FileUploadState) => {
    try {
      fileState.status = 'uploading';
      fileState.progress = 10;

      // 1. Generate Upload Policy
      const policy = await propertyService.generateImageUploadPolicy(propertyId, fileState.file);
      fileState.progress = 30;

      // 2. Upload directly to MinIO
      const formData = new FormData();
      Object.entries(policy.formData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      // The 'file' field MUST be the last one in the FormData for S3/MinIO POST
      formData.append('file', fileState.file);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', policy.url);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 40; // Scale to 40% of total bar
            fileState.progress = 30 + percentComplete;
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            console.error('MinIO Error Response:', xhr.responseText);
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      fileState.progress = 80;
      fileState.objectKey = policy.objectKey;

      // 3. Confirm with Backend
      await propertyService.confirmImageUpload(propertyId, {
        objectKey: policy.objectKey,
        originalFileName: fileState.file.name,
        isPrimary: false,
      });

      fileState.progress = 100;
      fileState.status = 'success';
    } catch (err: any) {
      console.error('Upload failed for', fileState.file.name, err);
      fileState.status = 'error';
      fileState.error = err.message || 'Upload failed';
    }
  };

  const clearCompleted = () => {
    uploadingFiles.value = uploadingFiles.value.filter((f) => f.status !== 'success');
  };

  return {
    uploadingFiles,
    uploadFiles,
    clearCompleted,
  };
}
