FROM node:18-alpine

WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 5173

# Vite requires --host to be accessible from outside
CMD ["npm", "run", "dev", "--", "--host"]
