import drive from "../config/google-api/drive"

export const checkThumbnailImg = async (id: string) => {
  const response = await drive.files.get({
    fileId: id,
    fields: 'hasThumbnail'
  })
  return response.data.hasThumbnail
}