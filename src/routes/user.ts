import { FOLDER_PROFILE_IMAGE } from "./../constant";
import { User } from "./../entities/User";
import { checkAuth2 } from "./../middleware/checkAuth";
import { Router } from "express";
import drive from "../config/google-api/drive";
import { Readable } from "stream";
import { UploadedFile } from "express-fileupload";

const router = Router();

router.post("/update/:type", checkAuth2, async (req, res) => {
  if (!req.files) {
    res.status(400).send({
      success: false,
      msg: "Bad request",
    });
    return;
  }
  let fileAvatar: UploadedFile | null = null;
  let fileBanner: UploadedFile | null = null;

  if (req.params.type === "avatar") {
    fileAvatar = req.files.file as UploadedFile;
  } else if (req.params.type === "banner") {
    fileBanner = req.files.file as UploadedFile;
  } else {
    res.status(400).send({
      success: false,
      msg: "Bad request",
    });
    return;
  }

  try {
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
        await drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            type: "anyone",
            role: "reader",
          },
        });
        await User.update(
          { id: req.body.userId },
          { image_url: response.data.id }
        );
        res.status(200).json({
          success: true,
          msg: "change avatar successfully",
        });
        return;
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
          parents: [""],
        },
        media: {
          mimeType: fileBanner.mimetype,
          body: readableStream,
        },
        fields: "id",
      });
      if (response.data.id) {
        await drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            type: "anyone",
            role: "reader",
          },
        });
        await User.update(
          { id: req.body.userId },
          { banner_id: response.data.id }
        );
        res.status(200).json({
          success: true,
          msg: "change banner successfully",
        });
        return;
      } else {
        res.status(500).send({
          success: false,
          msg: `Server upload with error at ${response.request.responseURL}`,
        });
        return;
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      msg: `Server upload error`,
    });
  }
});

export default router;
