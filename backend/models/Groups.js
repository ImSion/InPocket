import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  completionNote: { type: String },
  scheduledDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    tasks: [taskSchema]
  });

export default mongoose.model('Group', groupSchema);