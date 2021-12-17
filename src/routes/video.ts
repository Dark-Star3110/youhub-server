import { Router } from "express";
import { UploadedFile } from "express-fileupload";
import { Readable } from "stream";
import drive from "../config/google-driver-api/index";

const router = Router();

const FOLDER_VIDEO_ID = "1ZSq94MYhSjiSYq4ts_F08UB1b4TIyElw";
// const FOLDER_THUMBNAIL_IMAGE = '1XIoZdnySItH2z7H3IjwmgHpEECMGFl69'

router.post("/upload", async (req, res) => {
  if (!req.files) {
    res.status(400).send({
      success: false,
      msg: "Upload failed",
    });
    return;
  }
  const file = req.files.file as UploadedFile;
  const readableStream = new Readable();
  readableStream.push(file.data);
  readableStream.push(null);

  try {
    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}_${file.name}`,
        mimeType: file.mimetype,
        parents: [FOLDER_VIDEO_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: readableStream,
      },
      fields: "id",
    });
    if (response.data.id) {
      res.json({
        success: true,
        msg: "successfully",
        videoId: response.data.id,
      });
    } else {
      res.status(500).json({
        success: false,
        msg: "server internal error",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "server internal error",
    });
  }
});

export default router;
