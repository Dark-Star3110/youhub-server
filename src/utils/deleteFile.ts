import drive from "../config/google-api/drive"

export const deleteFile = async (id: string) => {
  await drive.files.delete({
    fileId: id
  })
}