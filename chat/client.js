import { ChatClient } from "@azure/communication-chat";
import { AzureCommunicationUserCredential } from "@azure/communication-common";

// Your unique Azure Communication service endpoint
let endpointUrl = process.env["ACS_ENDPOINT_URL"];
let userAccessToken = process.env["USER_ACCESS_TOKEN"];

let chatClient = new ChatClient(
  endpointUrl,
  new AzureCommunicationUserCredential(userAccessToken)
);
console.log("Azure Communication Chat client created!");

let user1_id = process.env["USER1_ID"];
let user1_displayname = process.env["USER1_DISPLAY_NAME"];
let user2_id = process.env["USER2_ID"];
let user2_displayname = process.env["USER2_DISPLAY_NAME"];

async function createChatThread() {
  let createThreadRequest = {
    topic: "Preparation for upcoming hack",
    members: [
      {
        user: { communicationUserId: user1_id },
        displayName: user1_displayname,
      },
      {
        user: { communicationUserId: user2_id },
        displayName: user2_displayname,
      },
    ],
  };
  let chatThreadClient = await chatClient.createChatThread(createThreadRequest);
  let threadId = chatThreadClient.threadId;
  return threadId;
}

createChatThread().then(async (threadId) => {
  console.log(`Thread created:${threadId}`);
  // CREATE CHAT THREAD CLIENT
  let chatThreadClient = await chatClient.getChatThreadClient(threadId);
  console.log(`Chat Thread client for threadId:${chatThreadClient.threadId}`);
  // RECEIVE A CHAT MESSAGE FROM A CHAT THREAD
  // open notifications channel
  await chatClient.startRealtimeNotifications();
  // subscribe to new notification
  chatClient.on("chatMessageReceived", (e) => {
    console.log("Notification chatMessageReceived!");
    // your code here
  });
  // SEND MESSAGE TO A CHAT THREAD
  let sendMessageRequest = {
    content: "Hello ! Shall I schedule a meeting for tomorrow?",
  };
  let sendMessageOptions = {
    priority: "Normal",
    senderDisplayName: user1_displayname,
  };
  let sendChatMessageResult = await chatThreadClient.sendMessage(
    sendMessageRequest,
    sendMessageOptions
  );
  let messageId = sendChatMessageResult.id;
  console.log(`Message sent!, message id:${messageId}`);
  // LIST MESSAGES IN A CHAT THREAD
  let pagedAsyncIterableIterator = await chatThreadClient.listMessages();
  let nextMessage = await pagedAsyncIterableIterator.next();
  while (!nextMessage.done) {
    let chatMessage = nextMessage.value;
    console.log(`Message :${chatMessage.content}`);
    // your code here
    nextMessage = await pagedAsyncIterableIterator.next();
  }
  // ADD NEW MEMBER TO THREAD
  let addMembersRequest = {
    members: [
      {
        user: { communicationUserId: user2_id },
        displayName: user2_id,
      },
    ],
  };

  await chatThreadClient.addMembers(addMembersRequest);
  // LIST MEMBERS IN A THREAD
  async function listThreadMembers() {
    let pagedAsyncIterableIterator = await chatThreadClient.listMembers();
    let next = await pagedAsyncIterableIterator.next();
    while (!next.done) {
      let user = next.value;
      console.log(`User :${user.displayName}`);
      next = await pagedAsyncIterableIterator.next();
    }
  }
  await listThreadMembers();
});
