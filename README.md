# AI Agent Hub

A powerful platform for creating and managing AI agents using OpenAI's Assistant API.

## Features

- Create and manage AI agents with custom instructions
- Real-time chat interface with AI agents
- Share agents with clients via public links
- Webhook integration for external communication
- Chat history and feedback system
- GoHighLevel integration
- Notification system for agent interactions

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Dexie.js (IndexedDB)
- OpenAI API
- Netlify Functions

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-agent-hub.git
   cd ai-agent-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Deployment

The project is set up for deployment on Netlify with serverless functions. The `netlify.toml` file contains the necessary configuration.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.