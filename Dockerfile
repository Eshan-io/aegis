FROM node:22-alpine

ARG COMMIT_HASH

# Set up files
WORKDIR /app
COPY . .

# Canvas text rendering on Alpine needs actual font packages.
RUN apk add --no-cache fontconfig ttf-dejavu

# Install dependencies
ENV NODE_ENV=production
RUN npm ci

# Environment
ENV ROBOBOT_COMMIT_HASH=$COMMIT_HASH
ENV ROBOBOT_USE_ENV=1
CMD ["npm", "start"]
