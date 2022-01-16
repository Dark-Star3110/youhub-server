import { CookieOptions } from "express";
require("dotenv").config();
export const __prop__ = process.env.NODE_ENV === "production";
export const PORT = process.env.PORT || 8000;

export const COOKIE_NAME = "refreshToken";
export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: __prop__,
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  sameSite: "lax",
};

export const FOLDER_THUMBNAIL_IMAGE = "1Pwyz9kilqTILuKlIQ6qWHR7UbpC2IhrB";
export const FOLDER_VIDEO_ID = "1qY7Fcbn4QhM0nEkPpPu_C2kkwiM4NRwC";
export const FOLDER_PROFILE_IMAGE = "1x42t2CwV0x9N1dz_KPXEdykrz4wXltzr";

export const profileGenerateImg = [
  "1oqS8fpVACWXEoFVrb4N5VoVnv0S4bQ7A",
  "1cSOBvgtzIdHmaWH9oa1ln8SNp0CoyG61",
  "1X68n3aMLA0zr6esI3jCe4V9nYTTaqXfD",
  "1qboOS8TXtzCE1foRfAdsxnnrYzj9UKnk",
  "1C5B64u4FVJg4byEFLrYIC8QyiprR4naG",
  "13w8vQxQtbCODYXr6zwXbu2Ev1FnEWUGy",
  "1lwa47CDWEBg4RdOuXplr8gInKZFwWD2W",
  "1NAPhiPLpYDWT10BTWjLsqT0Ib5USE0oT",
  "1sB8QzwT8ZbDIs0PpfAPypPxyQZ_PH9a9",
  "1ZWmr9ZCi7tVIpdigkTumA-F60NgE_3jg",
];
