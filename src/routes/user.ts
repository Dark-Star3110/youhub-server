import { FOLDER_BANNER_IMAGE, FOLDER_PROFILE_IMAGE } from "./../constant";
import { User } from "./../entities/User";
import { checkAuth2 } from "./../middleware/checkAuth";
import { Router } from "express";
import drive from "../config/google-api/drive";
import { Readable } from "stream";
import { UploadedFile } from "express-fileupload";
import { getConnection } from "typeorm";
import { redis } from "../config/redis";
import { deleteFile } from "../utils/deleteFile";

const router = Router();

router.post("/update", checkAuth2, async (req, res) => {
  if (!req.files) {
    res.status(400).send({
      success: false,
      msg: "Bad request",
    });
    return;
  }
  let fileAvatar: UploadedFile | null = null;
  let fileBanner: UploadedFile | null = null;
  fileAvatar = req.files.fileAvatar as UploadedFile | null;
  fileBanner = req.files.fileBanner as UploadedFile | null;
  const connection = getConnection();

  await connection.transaction(async (transactionEntityManager) => {
    try {
      let avatarId: string | undefined;
      let bannerId: string | undefined;
      if (fileAvatar) {
        const readableStream = new Readable();
        readableStream.push(fileAvatar.data);
        readableStream.push(null);
        const response = await drive.files.create({
          requestBody: {
            name: `${Date.now()}_${fileAvatar.name}`,
            mimeType: fileAvatar.mimetype,
            parents: [FOLDER_PROFILE_IMAGE],
          },
          media: {
            mimeType: fileAvatar.mimetype,
            body: readableStream,
          },
          fields: "id",
        });
        if (response.data.id) {
          avatarId = response.data.id;
          await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
              type: "anyone",
              role: "reader",
            },
          });
          await transactionEntityManager.update(
            User,
            { id: req.userId },
            { image_url: response.data.id }
          );
        } else {
          res.status(500).send({
            success: false,
            msg: `Server upload with error at ${response.request.responseURL}`,
          });
          return;
        }
      }

      if (fileBanner) {
        const readableStream = new Readable();
        readableStream.push(fileBanner.data);
        readableStream.push(null);
        const response = await drive.files.create({
          requestBody: {
            name: `${Date.now()}_${fileBanner.name}`,
            mimeType: fileBanner.mimetype,
            parents: [FOLDER_BANNER_IMAGE],
          },
          media: {
            mimeType: fileBanner.mimetype,
            body: readableStream,
          },
          fields: "id",
        });
        if (response.data.id) {
          bannerId = response.data.id;
          await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
              type: "anyone",
              role: "reader",
            },
          });
          await transactionEntityManager.update(
            User,
            { id: req.userId },
            { banner_id: response.data.id }
          );
        } else {
          res.status(500).send({
            success: false,
            msg: `Server upload with error at ${response.request.responseURL}`,
          });
          return;
        }
      }
      if (
        req.user?.image_url &&
        !req.user.image_url.includes("http") &&
        fileAvatar
      )
        await deleteFile(req.user.image_url);
      if (req.user?.banner_id && fileBanner)
        await deleteFile(req.user.banner_id);
      await redis.del(`user_${req.userId}`);
      res.status(200).json({
        success: true,
        msg: "change banner successfully",
        avatarUrl: avatarId
          ? `https://drive.google.com/uc?export=view&id=${avatarId}`
          : undefined,
        bannerUrl: bannerId
          ? `https://drive.google.com/uc?export=view&id=${bannerId}`
          : undefined,
      });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        msg: `Server upload error`,
      });
    }
  });
});

export default router;
