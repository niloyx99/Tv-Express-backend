import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const serverBootLogSchema = new Schema(
  {
    bootedAt: { type: Date, required: true, default: Date.now },
    hostname: { type: String, default: 'unknown' },
    nodeVersion: { type: String, default: '' },
    pid: { type: Number, default: 0 },
    mongoDb: { type: String, default: '' },
    appVersion: { type: String, default: '1.0.0' },
    status: { type: String, default: 'API running' },
    message: { type: String, default: 'API running' },
  },
  { timestamps: true, versionKey: false, collection: 'server_boot_logs' }
);

export type ServerBootLogDocument = InferSchemaType<typeof serverBootLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ServerBootLog = mongoose.model('ServerBootLog', serverBootLogSchema);
