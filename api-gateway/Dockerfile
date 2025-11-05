# Base image
FROM node:22

# Create app directory
WORKDIR /usr/src/app

# Copy package and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose port 3000
EXPOSE 3000

# Start gateway
CMD ["node", "index.js"]
