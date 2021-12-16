import { FileUpload } from "graphql-upload";
import { FOLDER_PROFILE_IMAGE, FOLDER_THUMBNAIL_IMAGE } from "../constant";
import drive from "../config/google-driver-api";

export type UploadType = 'thumbnail' | 'profile'

export const uploadImg = async (file: FileUpload, type: UploadType) => {
  const { createReadStream, filename, mimetype } = file

  try {
    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}_${filename}`,
        mimeType: mimetype,
        parents: type === 'thumbnail' ? [FOLDER_THUMBNAIL_IMAGE] : [FOLDER_PROFILE_IMAGE]
      },
      media: {
        mimeType: mimetype,
        body: createReadStream()
      },
      fields: 'id'
    })
    if (!response.data.id) return {
      error: true
    }
    // public anh
    await drive.permissions.create ({
      requestBody: {
        type: 'anyone',
        role: 'reader'
      },
      fileId: response.data.id
    })
    return {
      error: false,
      // url: `https://drive.google.com/uc?export=view&id=${response.data.id}`
      id: response.data.id
    }
  } catch (error) {
    return {
      error: true
    }
  }
}