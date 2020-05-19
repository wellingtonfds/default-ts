FROM node:12

# Add package file
COPY package*.json ./

# Install deps
RUN npm i

# Copy source
COPY . .


CMD ["npm", "run", "dev"]
# Expose port 3000
EXPOSE 3100
