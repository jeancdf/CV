FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.mjs ./
COPY --from=build /app/dist/jean-cazals-cv/browser ./dist/jean-cazals-cv/browser
EXPOSE 80
CMD ["node", "server.mjs"]
