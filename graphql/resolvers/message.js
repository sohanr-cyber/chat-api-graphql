import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserInputError } from "apollo-server";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../../util/validators.js";

import checkAuth from "../../util/check-auth.js";
import Message from "../../model/Message.js";

const SECRET_KEY = "secret_key";

const resolver = {
  Mutation: {
    sendMessage: async (
      _,
      { messageInput: { text, chatId, media, parent } },
      context
    ) => {
      try {
        // const chatId = req.query.chatId;

        const user = checkAuth(context);

        if (!chatId) {
          return "Invalid data passed into request";
        }
        var data = {
          sender: user._id,
          text: text,
          chat: chatId,
          media,
          parent,
        };

        const newMessage = await new Message(data);
        const message = await newMessage.save();
        const createdOne = await Message.findOne({ _id: message._id })
          .populate("sender", "name pic")
          .populate({
            path: "chat",
            populate: {
              path: "users",
              select: "name pic email",
            },
          });

        return createdOne;
      } catch (error) {
        console.log(error);

        throw new Error(error.message);
      }
    },

    deleteMessage: async (_, { messageId: id }, context) => {
      try {
        const user = checkAuth(context);
        const message = await Message.findOneAndUpdate(
          {
            _id: id,
            sender: user._id,
          },
          {
            $set: { text: "", media: [] },
          }
        );

        return message;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    addReact: async (_, { messageId, name }, context) => {
      try {
        const user = checkAuth(context);

        if (!messageId || !name) {
          console.log("Invalid data passed into request");
          return res.sendStatus(400);
        }

        const message = await Message.findOne({ _id: messageId });
        const existedReact = message.react.find(
          (item) => item.person == user._id
        );

        console.log({ existedReact });

        if (existedReact) {
          if (existedReact.name == name) {
            message.react = message.react.filter(
              (item) => item.person != user._id
            );
          } else {
            message.react = message.react.filter(
              (item) => item.person != user._id
            );

            message.react.push({
              name,
              person: user._id,
            });
          }
        } else {
          message.react.push({
            name,
            person: user._id,
          });
        }

        await message.save();

        return message;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Query: {
    getMessages: async (_, { chatId }, context) => {
      try {
        const user = checkAuth(context);

        const messages = await Message.find({ chat: chatId })
          .populate("sender", "name pic email")
          .populate("chat")
          .populate({
            path: "parent",
            select: { _id: 1, text: 1, media: 1 },
            populate: {
              path: "sender",
              select: "name",
            },
          });

        return messages;
      } catch (error) {
        console.log(error);

        throw new Error(error.message);
      }
    },
  },
};

export default resolver;
