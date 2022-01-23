import { CookieOptions } from "express";
require("dotenv").config();
export const __prop__ = process.env.NODE_ENV === "production";
export const PORT = process.env.PORT || 8000;

export const COOKIE_NAME = "refreshToken";
export const COOKIE_OPTIONS: CookieOptions = {
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  httpOnly: true,
  secure: __prop__,
  sameSite: __prop__ ? "none" : "lax",
  signed: true,
};

export const FOLDER_THUMBNAIL_IMAGE = "1Pwyz9kilqTILuKlIQ6qWHR7UbpC2IhrB";
export const FOLDER_VIDEO_ID = "1qY7Fcbn4QhM0nEkPpPu_C2kkwiM4NRwC";
export const FOLDER_PROFILE_IMAGE = "1x42t2CwV0x9N1dz_KPXEdykrz4wXltzr";
export const FOLDER_BANNER_IMAGE = "1POdhrGo_FnG4oqY4DJNcoX34AH3k-gga";

export const profileGenerateImg: { [key: string]: string } = {
  A: "1QUcAjC3ZYuaRKB1WfEhdbI-5jFIhumhM",
  B: "1xhpxq7B9xAbfb-fZ_-HyWQvzwv4dCu-Z",
  C: "1uOQJtjX3LHujW8BzoQKevEybtG9V5rqf",
  D: "1bQUagu7daD6Xt8tjLNwcJStgpwYRXyrf",
  E: "11deaBiwX-Z4eMRrTQH4a0IfWsKo4pjXA",
  F: "1RFu7VPZDQvTVkR6-Q0LRYMkerYET3f4A",
  G: "1wejaJk0yx5womqRW0vdJSscbKoRnDYue",
  H: "1Bf7SkRUZ2Vmryr-sL0Qsghmbw1WEqfIC",
  I: "1bs7J5vzHWKZ_42QIpl6kVF6NEADq2phP",
  J: "1l8WVhMhuLmtH0GEZKTdMxX7ln_CdJCq9",
  K: "1pUaoE-_Xb3W0vC1H9yiqw4x1FtiMnIQ4",
  L: "1OQcoAHXK8SH-H9Ot9uhhPFbdv4EKKDEi",
  M: "1-bROuLUJpychBDPiWFxYL2Flus6EGp-A",
  N: "1KGSipthLeiVEKtsOW6wQoJWkrm-SmjkB",
  O: "1La7VlkmK6-ZUKo0m3PimpNrrd8xhBypv",
  P: "1rSiXax4nwnwOGNFPeD1TDnmCTs35zS1N",
  Q: "1stwCiG1B_4BhfpdDyni3Mp2KAl2Kcgks",
  R: "14rXpjRA7pQdBNsS8DZ5_k4nbGR4qdFgZ",
  S: "1hSqXnQIcfBhZ7a9njNxur5A126d_2g1G",
  T: "1pGiLGx_rvcLkENiwsTFYBTV1LUEBz6YS",
  U: "1i-pGWZD5vXzkcprk_LTPaYe4IyeENglp",
  V: "1iYttejsf-O4LLCOu0pgV7ngLHnLIo6Ao",
  W: "1qgbBQeAMTnMswLteY74DW4b8RF6Xi5LY",
  X: "19NRS-zxADiLYVFZ0Hp3wAfwfXV4LubH5",
  Y: "1d0NJaT_EypG7eIe1IWnP41DvoRuvndXp",
  Z: "1rlICygfZc_aVUNyHbviUMs2Goy0jP61D",
};
