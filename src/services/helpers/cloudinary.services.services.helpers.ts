import { configs } from '@/configs';
import { InternalServerErrorException } from '@dolphjs/dolph/common';
import { v2 } from 'cloudinary';

v2.config({ ...configs.cloudinary, cloud_name: configs.cloudinary.name });

export const uploadOneToCloud = async (filePath: string) => {
  const { secure_url } = await v2.uploader.upload(filePath);
  return secure_url;
};

export const deleteOneFromCloud = async (url: string) => {
  return v2.uploader.destroy(url);
};

export const uploadManyToCloud = async (filePaths: string[]) => {
  const result = Promise.all(filePaths.map((path) => uploadOneToCloud(path)));
  if (!result) throw new InternalServerErrorException('cannot upload media files');
  return result;
};

export const deleteManyFromCloud = async (urls: string[]) => {
  return v2.api.delete_resources(urls);
};
