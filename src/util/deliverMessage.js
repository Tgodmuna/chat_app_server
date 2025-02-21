/**
 * Delivers a message to the recipient if they are currently connected to the WebSocket server.
 *
 * @param {string} recipientID - The ID of the recipient to whom the message should be delivered.
 * @param {object} message - The message data to be delivered.
 */
function deliverMessage(recipientID, message, ActiveConnections) {
  if (!ActiveConnections.has(recipientID)) {
    console.log(`⚠️ User ${recipientID} is not online. Cannot deliver message.`);
    return false;
  }

  try {
    const socket = ActiveConnections.get(recipientID);
    console.log(`📨 Sending message to ${recipientID}:`, message);
    socket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.log(`❌ Error delivering message to ${recipientID}:`, error);
    return false;
  }
}

module.exports = deliverMessage;
