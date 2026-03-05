import { useState } from 'react';
import { authApi } from '../services/api/auth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/api/queryClient';
import { useCurrentUser } from './useAuth';

export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  const uploadAvatar = async () => {
    try {
      setIsUploading(true);

      const { CameraService } = await import('../services/camera');

      // Use capturePhoto for smart web/mobile support
      const photoData = await CameraService.capturePhoto({
        quality: 80,
        allowEditing: true,
        width: 512,
        height: 512,
      });

      if (!photoData) {
        return null;
      }

      const avatarUrl = await authApi.uploadAvatar(photoData);

      if (user) {
        const updatedUser = { ...user, avatar_url: avatarUrl };
        queryClient.setQueryData(queryKeys.currentUser, updatedUser);
        // Also invalidate to be sure
        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      }

      toast.success('Profile picture updated');
      return avatarUrl;
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error('Upload failed', {
        description: error.message || 'Please try again'
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading };
};
