/**
 * Delivers a message to the recipient if they are currently connected to the WebSocket server.
 *
 * @param {string} recipientID - The ID of the recipient to whom the message should be delivered.
 * @param {object} data - The message data to be delivered.
 */
const deliverMessage = (recipientID, data, ActiveConnections) => {
  if (ActiveConnections.has(recipientID)) {
    ActiveConnections.get(recipientID).send(JSON.stringify(data));
    return true;
  } else {
    return null;
  }
};

module.exports = deliverMessage;
