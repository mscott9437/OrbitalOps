FROM archlinux:latest

# Install Node.js
RUN pacman -Syu --noconfirm nodejs npm

# Create application directory
RUN mkdir -p /app/json

WORKDIR /app

# Copy application files
COPY server.js .
COPY main.js .
COPY naive_master_state_complete.json .
COPY master_state_ui_schema_complete.json .
COPY json ./json
COPY styles.css .

# Internal port used by server.js
EXPOSE 8080/tcp

# Run the server
ENTRYPOINT ["node", "server.js"]
