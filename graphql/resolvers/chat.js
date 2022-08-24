import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserInputError } from "apollo-server";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../../util/validators.js";

import checkAuth from "../../util/check-auth.js";
import Chat from "../../model/Chat.js";

const SECRET_KEY = "secret_key";

const resolver = {
  Mutation: {  
    getOrCreateChat: async (_, { userId }, context) => {
      try {
        const user = checkAuth(context);
        if (!userId) {
          return "UserId param not sent with request";
        }

        var existetChat = await Chat.find({
          isGroupChat: false,
          $and: [
            { users: { $elemMatch: { $eq: user.id } } },
            { users: { $elemMatch: { $eq: userId } } },
          ],
        })
          .populate("users", "-password")
          .populate("latestMessage");

        if (existetChat.length > 0) {
          return existetChat[0];
        } else {
          console.log("new chat");
          let chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [user.id, userId],
          };
          const newChat = await new Chat(chatData);
          const createdChat = await newChat.save();
          const FullChat = await Chat.findOne({ _id: createdChat._id })
            .populate("latestMessage")
            .populate("users", "-password");

          return FullChat;
        }
      } catch (error) {
        console.log(error);

        throw new Error(error.message);
      }
    },

    createGroup: async (_, args, context) => {
      try {
        const user = checkAuth(context);
        let users = args.users;
        const name = args.name;

        if (!users || !name) {
          return { message: "Please Fill all the feilds" };
        }

        // users = JSON.parse(users);

        if (users.length < 2) {
          return "More than 2 users are required to form a group chat";
        }

        users.push(user);

        const groupChat = await Chat.create({
          chatName: name,
          users: users,
          isGroupChat: true,
          groupAdmin: user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
          .populate("users", "-password")
          .populate("groupAdmin", "-password");
        return fullGroupChat;
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
    },

    renameGroup: async (_, args, context) => {
      try {
        const user = checkAuth(context);
        const { chatId, chatName } = args;

        // check if the requester is admin

        const updatedChat = await Chat.findByIdAndUpdate(
          chatId,
          {
            chatName: chatName,
          },
          {
            new: true,
          }
        )
          .populate("users", "-password")
          .populate("groupAdmin", "-password");

        if (!updatedChat) {
          throw new Error("Chat Not Found");
        } else {
          return updatedChat;
        }
      } catch (error) {
        console.log(error);
      }
    },

    removeFromGroup: async (_, args, context) => {
      try {
        const { chatId, userId } = args;

        // check if the requester is admin
        const chat = await Chat.findOne({
          isGroupChat: true,
          _id: chatId,
        }).select("groupAdmin");

        console.log(chat);
        // ObjectId("507c7f79bcf86cd7994f6c0e").toString()

        // if (req.user._id !== chat.groupAdmin._id.toString()) {
        //   return "you are not admin";
        // }

        const removed = await Chat.findByIdAndUpdate(
          chatId,
          {
            $pull: { users: userId },
          },
          {
            new: true,
          }
        )
          .populate("users", "-password")
          .populate("groupAdmin", "-password");

        if (!removed) {
          throw new Error("Chat Not Found");
        } else {
          return removed;
        }
      } catch (error) {
        console.log(error);
        return;
      }
    },

    addToGroup: async (_, args, context) => {
      try {


        const user = checkAuth(context);
        const { chatId, userId } = args;

        // check if the requester is admin
        const chat = await Chat.findOne({
          isGroupChat: true,
          _id: chatId,
        }).select("groupAdmin");

        // if (req.user._id !== chat.groupAdmin._id.toString()) {
        //   return res.status(403).send({ message: "your are not admin" });
        // }

        const added = await Chat.findByIdAndUpdate(
          chatId,
          {
            $addToSet: { users: userId },
          },
          {
            new: true,
          }
        )
          .populate("users", "-password")
          .populate("groupAdmin", "-password");

        if (!added) {
          throw new Error("Chat Not Found");
        } else {
          return added;
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  },

  Query: {
    chatList: async (_, args, context) => {
      try {
        const user = checkAuth(context);
        const chats = await Chat.find({
          users: { $elemMatch: { $eq: user.id } },
        })
          .populate("users", "-password")
          .populate("groupAdmin", "-password")
          .populate("latestMessage")
          .sort({ updatedAt: -1 });

        console.log(chats);
        return chats;
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
    },
  },
};

export default resolver;
