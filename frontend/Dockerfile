FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# We use the build script for production later, but for now we expose the dev port
EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host"]
