import { Schema, model } from 'mongoose';

export const rolePermission = model('rolePermission', new Schema({
  roleId: {
    type: String,
    required: false,
    unique: true
  },
  addSongs: {
    type: Boolean,
    required: true,
    default: true
  },
  manageQueue: {
    type: Boolean,
    required: true,
    default: true
  },
  managePlayer: {
    type: Boolean,
    required: true,
    default: true
  },
}));