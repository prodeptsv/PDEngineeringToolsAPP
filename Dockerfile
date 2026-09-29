# ETAPA 1: Construcción
FROM node:20-alpine AS build
WORKDIR /app

# Copiar paquetes e instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código
COPY . .

# Aumentar límite de memoria para Node.js y compilar
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# ETAPA 2: Servidor Web Nginx
FROM nginx:alpine

# Copiar los archivos compilados al directorio de Nginx
COPY --from=build /app/dist/pd-engineering-tools/browser /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]