# Use the Node.js 18 Alpine image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install all necessary compilers and runtimes in one command
# Also install docker-cli so this container can run 'docker' commands
RUN apk add --no-cache docker-cli gcc g++ python3 openjdk11

# Copy package files and install dependencies first to leverage Docker caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the service runs on
EXPOSE 3000

# Specify the command to run when the container starts
CMD [ "node", "index.js" ]