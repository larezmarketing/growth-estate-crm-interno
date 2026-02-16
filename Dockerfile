# Dockerfile for Growth Estate CRM Backend (Render)
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Expose port (Render uses PORT env variable)
EXPOSE ${PORT:-10000}

# Start the server
CMD ["pnpm", "start"]
