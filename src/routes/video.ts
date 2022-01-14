import { Video } from "./../entities/Video";
import { FOLDER_THUMBNAIL_IMAGE } from "./../constant";
import { checkAuth2 } from "./../middleware/checkAuth";
import { Router } from "express";
import { UploadedFile } from "express-fileupload";
import { Readable } from "stream";
import drive from "../config/google-api/drive";
import { FOLDER_VIDEO_ID } from "../constant";

const router = Router();

router.post("/upload", checkAuth2, async (req, res) => {
  if (!req.files) {
    res.status(400).send({
      success: false,
      msg: "Upload failed",
    });
    return;
  }
  let fileVideo: UploadedFile;
  let fileImg: UploadedFile | null = null;

  if (req.files.file instanceof Array) {
    if (req.files.file[0].mimetype.indexOf("video/") !== -1) {
      fileVideo = req.files.file[0];
      fileImg = req.files.file[1];
    } else {
      fileVideo = req.files.file[1];
      fileImg = req.files.file[0];
    }
  } else {
    fileVideo = req.files.file;
  }

  // upload video
  try {
    const readableVideo = new Readable();
    readableVideo.push(fileVideo.data);
    readableVideo.push(null);
    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}_${fileVideo.name}`,
        mimeType: fileVideo.mimetype,
        parents: [FOLDER_VIDEO_ID],
      },
      media: {
        mimeType: fileVideo.mimetype,
        body: readableVideo,
      },
      fields: "id,size",
    });
    if (!response.data.id) {
      res.status(500).json({
        success: false,
        msg: "upload video failed",
      });
      return;
    }
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        type: "anyone",
        role: "reader",
      },
    });
    let imgId: string | null | undefined;
    if (fileImg) {
      const readableImg = new Readable();
      readableImg.push(fileImg.data);
      readableImg.push(null);
      const response2 = await drive.files.create({
        requestBody: {
          name: `${Date.now()}_${fileImg.name}`,
          mimeType: fileImg.mimetype,
          parents: [FOLDER_THUMBNAIL_IMAGE],
        },
        media: {
          mimeType: fileImg.mimetype,
          body: readableImg,
        },
        fields: "id",
      });
      imgId = response2.data.id;
      if (imgId)
        await drive.permissions.create({
          requestBody: {
            type: "anyone",
            role: "reader",
          },
          fileId: imgId,
        });
    }

    res.json({
      success: true,
      msg: "all successfully",
      videoId: response.data.id,
      size: response.data.size,
      imgId,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      msg: "server internal error",
    });
  }
});

router.get("/play-video/:id", async (req, res) => {
  if (!req.headers.range) {
    res.status(400).send("bad request");
    return;
  }
  const videoId = req.params.id;
  const videoInfo = await Video.findOne(videoId);
  if (!videoInfo) {
    res.status(400).send("video not found");
    return;
  }
  const VIDEO_SIZE = videoInfo.size;
  const CHUNK_SIZE = 3 * 10 ** 6;
  const start = Number(req.headers.range?.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, eval(`${VIDEO_SIZE}-1`));
  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${VIDEO_SIZE}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);

  drive.files
    .get(
      {
        fileId: videoId,
        alt: "media",
      },
      {
        headers: {
          Range: `bytes=${start}-${end}`,
        },
        responseType: "stream",
      }
    )
    .then((result) => {
      result.data.pipe(res);
    });
});

export default router;
