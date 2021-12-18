import drive from "../config/google-api/drive"

export const getThumbnail = async (id: string) => {
  const response = await drive.files.get({
    fileId: id,
    fields: 'thumbnailLink'
  })
  return response.data.thumbnailLink
}