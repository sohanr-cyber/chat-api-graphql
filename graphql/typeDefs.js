import { gql } from "apollo-server";

const typeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String!
    pic: String
    isAdmin: Boolean
    token: String!
  }

  type Chat {
    id: ID!
    chatName: String
    isGroupChat: Boolean
    users: [User]!
    latestMessage: Message
    groupAdmin: User
  }

  type Media {
    id: ID!
    name: String
    url: String
    type: String
  }

  type React {
    id: ID!
    name: String
    person: User
  }

  type Message {
    id: ID!
    sender: User!
    parent: Message
    text: String
    chat: Chat!
    readBy: [User]
    media: [Media]
    react: [React]
  }

  input RegisterInput {
    name: String!
    password: String!
    email: String!
  }

  input MessageInput {
    text: String
    chatId: ID!
    media: String
    parent: ID
  }

  type Query {
    getUser(id: ID!): User
    getUsers: [User]

    chatList: [Chat]

    getMessages(chatId: ID!): [Message]
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(email: String!, password: String!): User!

    getOrCreateChat(userId: ID!): Chat!
    createGroup(users: [ID!], name: String!): Chat!
    renameGroup(chatId: ID!, chatName: String!): Chat!
    removeFromGroup(chatId: ID!, userId: ID!): Chat!
    addToGroup(chatId: ID!, userId: ID!): Chat!

    sendMessage(messageInput: MessageInput): Message!
    deleteMessage(messageId: ID!): Message
    addReact(messageId: ID!, name: String!): Message!
    
  }
`;

export default typeDefs;
