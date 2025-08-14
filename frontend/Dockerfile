# Stage 1: Build the Angular application
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker's layer caching
# This step only runs if the dependency files change, which speeds up subsequent builds
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Angular application for production
# The --output-path flag specifies where the compiled files will be placed
# The --base-href flag is crucial for single-page applications served from a sub-path
# Adjust these values as needed for your specific deployment environment
RUN npm run build -- --output-path=./dist/app --base-href=/qualisoft/

# Stage 2: Serve the application with NGINX
# Use a lean NGINX image
FROM nginx:1.25.4-alpine AS production

# Set the working directory for NGINX
WORKDIR /usr/share/nginx/html

# Remove the default NGINX configuration
RUN rm -rf ./*

# Copy the built application from the 'build' stage
# The 'from=build' flag tells Docker to get the files from the named 'build' stage
COPY --from=build /app/dist/app/browser ./

# Copy custom NGINX configuration to the container
# This is essential for routing in a single-page application (SPA)
# It ensures that all requests that don't match a static file are served with index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# The default command to run when the container starts is already `nginx -g 'daemon off;'`
# in the official NGINX image, which is perfect for running NGINX in the foreground.
# So, we don't need to specify a CMD.