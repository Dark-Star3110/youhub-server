import { User } from "./entities/User";
declare global {
  namespace Express {
    export interface Request {
      userId?: string;
      user?: User;
    }
  }
}
