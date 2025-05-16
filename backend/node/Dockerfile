FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Create a directory for the SQLite database if it doesn't exist
RUN mkdir -p /app/data

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application (using compiled JavaScript)
CMD ["npm", "run", "start:prod"] 