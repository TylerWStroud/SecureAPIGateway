FROM node:22
WORKDIR /usr/src/app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the app source
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
