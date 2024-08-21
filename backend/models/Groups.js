import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    tasks: [{
      description: { type: String, required: true },
      completed: { type: Boolean, default: false },
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      completionNote: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  });

export default mongoose.model('Group', groupSchema);