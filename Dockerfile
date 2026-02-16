# Dockerfile for Growth Estate CRM Backend (Render)
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package.json only
COPY package.json ./

# Install dependencies (will generate lockfile)
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Expose port (Render uses PORT env variable)
EXPOSE ${PORT:-10000}

# Start the server
CMD ["pnpm", "start"]
