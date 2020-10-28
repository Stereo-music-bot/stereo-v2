import { Schema, model } from 'mongoose';

export const rolePermission = model('rolePermission', new Schema({
  guildId: {
    type: String,
    required: false,
    unique: false
  },
  roleId: {
    type: String,
    required: false,
    unique: false
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