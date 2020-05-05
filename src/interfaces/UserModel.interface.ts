import { Model } from "mongoose";
import { IUser } from "./User.interface";

export interface IUserModel extends Model<IUser> { }
