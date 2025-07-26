# Anonymous Chat

A real-time anonymous chat application built with Express.js and Socket.IO that allows users to create and join chat rooms using simple room codes.

## Features

- **Anonymous Chatting**: Users are identified only by randomly assigned numbers (User 1, User 2, etc.)
- **Private Rooms**: Join rooms using 4-6 digit room codes
- **Real-time Communication**: Instant message delivery
- **Typing Indicators**: See when other users are typing
- **User Status**: Join/leave notifications and user count display
- **Responsive Design**: Works on desktop and mobile devices
- **Room Expiration**: Rooms expire after 10 minutes of inactivity

## Technology Stack

- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **UI Components**: Font Awesome for icons

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/anonymous-chatbot.git
   cd anonymous-chatbot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Use

1. Enter a 4-6 digit room code
2. Share this room code with someone you want to chat with
3. Both users will be connected in the same chat room
4. Send messages that will appear to the other user in real-time
5. Leave the room when you're done chatting

## Security and Privacy

- No user data is stored permanently
- No login required
- No message history is saved after leaving a room
- Room data is cleared when all users leave or after 10 minutes of inactivity

## Development

This application is built with:
- Express.js for serving static files and managing HTTP server
- Socket.IO for real-time bidirectional event-based communication
- Vanilla JavaScript for client-side functionality

## License

This project is open source and available under the [MIT License](LICENSE).

## Future Improvements

- End-to-end encryption for messages
- File sharing capabilities
- Custom user names (optional)
- Persistent rooms with passwords
- Dark mode theme
