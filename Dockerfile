FROM node:12

# Add package file
COPY package*.json ./

# Install deps
RUN npm i

# Copy source
COPY . .

# Expose port 3000
EXPOSE 3000