# ==== BUILD =====
FROM node:22-alpine AS build
# set the workdir
WORKDIR /app
# copy package files
COPY package*.json .
# install packages
RUN npm install
# Copy everything from local to build stage
COPY . .
# build!
RUN npm run build

# ==== PRODUCTION BUILD =======
FROM node:22-alpine AS production
# set the workdir
WORKDIR /app
# set env to production
ENV NODE_ENV=production
# copy package files
COPY package*.json .
# make sure all packages come from production only
RUN npm ci --omit=dev
# Copy everything from build stage
COPY --from=build /app/build ./build

# ==== RUN =======
# Set the env to "production"
EXPOSE 3000
# Start the app
CMD [ "npm", "start" ]
