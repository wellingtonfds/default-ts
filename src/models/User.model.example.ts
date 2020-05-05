import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/User.interface';
import { IUserModel } from '../interfaces/UserModel.interface';

const schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true }
});

const User: IUserModel = model<IUser, IUserModel>('User', schema);

export default User;
