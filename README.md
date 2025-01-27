# Chat App Server

This is the server-side implementation of a chat application. It handles user connections, message broadcasting, and other backend functionalities required for a real-time chat application.

## Features

- User authentication and authorization
- Real-time messaging
- Message history storage
- User presence tracking
- Friendship management

## Technologies Used

- Node.js
- Express.js
- WS
- MongoDB

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Tgodmuna/chat_app_server.git
    ```

2. Navigate to the project directory:

    ```bash
    cd chat_app_server
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Usage

1. Start the server:

    ```bash
    node server.js
    ```

2. The server will be running on `http://localhost:7000`.

## API Endpoints

### User Authentication and Authorization

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/sign-in` - Authenticate a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get the currently authenticated user's profile

### User Management

- `GET /api/user/details/:id` - Get user profile by ID
- `PUT /api/user/update/:id` - Update user profile by ID
- `POST /api/user/profile/upload` - Upload user profile picture
- `GET /api/user/profile/pic` - Get user profile picture
- `GET /api/user/friends_list` - Get user friend list
- `PATCH /api/user/friend_list/unfriend/:friend_id` - Remove a friend from the list
- `GET /api/user/friend_requests` - Get user friend requests

### Friendship Management

- `POST /api/friend/request` - Send a friend request
- `POST /api/friend/accept` - Accept a friend request
- `POST /api/friend/block-user` - Block a user
- `PATCH /api/friend/rejected` - Reject a friend request

### Messaging

- `GET /api/messages/message/:conversationID` - Get messages for a conversation
- `PATCH /api/messages/mark-read/:messageID/:conversationID` - Mark a message as read
- `PATCH /api/messages/mark-read/all/:conversationID` - Mark all messages as read
- `DELETE /api/messages/delete-message/:messageID` - Delete a message

### Conversations

- `GET /api/conversations/conversations` - Get all conversations user is involved in
- `DELETE /api/conversations/delete-conversation/:conversationID` - Delete a conversation

## WebSocket Events

- `connection` - When a user connects
- `disconnect` - When a user disconnects
- `message` - When a user sends a message
- `friendRequestSent` - When a friend request is sent
- `friendRequestAccepted` - When a friend request is accepted
- `userBlocked` - When a user is blocked
- `messageRead` - When a message is read

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, please contact [aguthankgod@gmail.com](mailto:aguthankgod@gmail.com).

## Connect with Me

- [X](https://x.com/Dev_Tgod1)
- [LinkedIn](https://www.linkedin.com/in/tg-agu/)