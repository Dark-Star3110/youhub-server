import drive from "../config/google-driver-api"

export const deleteFile = async (id: string) => {
  await drive.files.delete({
    fileId: id
  })
}