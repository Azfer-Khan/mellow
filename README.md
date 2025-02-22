# MellowMind.ai

An AI-powered therapy chat application designed to provide compassionate support for users with anxiety. This project uses a modular architecture with a Node.js/TypeScript backend, a Python microservice for AI tasks, and an Electron/React desktop frontend. It is designed to allow hotswapping of AI models and includes robust local data storage (SQLite) with future potential for RAG and knowledge graph integration.

## Features
- **Cross-platform Desktop App:** Built with Electron and React.
- **Modular Backend:** Node.js/TypeScript (with Express/Fastify) and a dedicated Python microservice for AI.
- **Data Storage:** Local encrypted SQLite database with an eye toward future cloud sync.
- **AI Integration:** Easy-to-swap AI modules, starting with a fine-tuned Llama 2 variant.
- **Expandable Architecture:** Ready for advanced features like retrieval-augmented generation (RAG) and agentic AI.

## Installation

### Prerequisites
- Node.js (>=14.x) and npm or Yarn
- SQLite3 (if not bundled)
- Python 3.x (for the AI microservice)

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/therapy-chat-app.git

2. **Navigate to the project directory:**
   ```bash
   cd therapy-chat-app

3. **Install dependencies:**
   ```bash
   npm install # or yarn install

4. **Start the Electron app:**
   ```bash
   npm start # or yarn start

5. **Run the Python AI service:**
   ```bash
   cd backend
    python -m venv venv
    source venv/bin/activate   # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python app.py

##Usage
- Launch the desktop application.
- Type your message in the chat interface.
- The app processes your message through the AI integration module and displays an empathetic response.
- Conversation data is stored locally in an encrypted SQLite database.

##Project Structure
mellow/
├── frontend/             # Contains the Electron app code with React components
│   ├── public/           # Static assets (e.g., index.html, images, icons)
│   ├── src/              # React components, styles, and Electron renderer code
│   |   ├── components/   # React components 
│   |   ├── styles/       # CSS styles
│   |   ├── utils/        # Utility functions
│   |   ├── App.tsx       # Main App component
│   |   ├── index.tsx     # Entry point for React app
│   |   ├── main.tsx      # Electron main process
│   ├── package.json      # Frontend-specific dependencies and scripts
│   ├── tsconfig.json     # TypeScript configuration
│   ├── build/            # Production build output
│   ├── main.js           # Electron main process file
│   ├── preload.js        # Preload script for Node.js integration in renderer
│   └── package.json      # Frontend-specific dependencies and scripts
├── backend/              # Contains server code
│   ├── node/             # Node.js/TypeScript API and logic (Express app)
│   ├── node/src/         # Node.js/TypeScript source code
│   ├── node/package.json # Node.js/TypeScript dependencies and scripts
│   ├── python-ai/        # Python microservice for AI tasks (FastAPI ap   p)
│   ├── python-ai/app.py  # Python source code
│   └── package.json      # Backend-specific dependencies and scripts
├── docs/                 # Documentation, tutorials, and technical specs
├── tests/                # Unit and integration tests for both frontend and backend
├── README.md             # Overview, setup instructions, and usage details
├── CONTRIBUTING.md       # Guidelines on how to contribute to the project
├── CODE_OF_CONDUCT.md    # Community rules and expectations
└── .github/             # GitHub templates and CI/CD workflow files

## Community
Join our community channels:
- [Discord](pending)
- [Reddit](pending)
- [Newsletter](pending)

## Contributing
We welcome contributions! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
