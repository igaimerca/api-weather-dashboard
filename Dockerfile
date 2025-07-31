# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Add a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S weather -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Change ownership to the nodejs user
RUN chown -R weather:nodejs /app

# Switch to non-root user
USER weather

# Expose the port the app runs on
EXPOSE 8080

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "http.get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"]