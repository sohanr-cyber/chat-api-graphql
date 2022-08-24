import mongoose from "mongoose";

const mediaSchema = mongoose.Schema({
  name: { type: String },
  url: { type: String },
  type: { type: String },
});

const reactSchema = mongoose.Schema({
  name: { type: String, enum: ["haha", "love", "like", "sad", "angry"] },
  person: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    text: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    media: [mediaSchema],
    react: [reactSchema],
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
