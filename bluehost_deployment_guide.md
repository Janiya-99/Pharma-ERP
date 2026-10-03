# Bluehost VPS Deployment Guide

This guide covers the full process of deploying the Pharma ERP project onto a Bluehost server.

> **Important Limitation:** Docker requires root system access. You **cannot** run Docker on a Bluehost "Shared Hosting" plan. You must use a **Bluehost VPS** or **Dedicated Server**.

---

## 1. Prerequisites

Before you start, make sure you have:
1. Active Bluehost VPS or Dedicated Server.
2. SSH access to your server (username and password/key).
3. A domain name pointed to your Bluehost server's IP address (optional but recommended).

---

## 2. SSH into Your Server

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and connect to your server:

```bash
ssh root@your_bluehost_server_ip
```
*(Replace `your_bluehost_server_ip` with your actual server IP address)*

---

## 3. Install Docker and Docker Compose

Your server needs Docker to run the containerized backend, frontend, database, and cache.

```bash
# Update the package index
sudo apt update && sudo apt upgrade -y

# Download and install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin -y

# Verify installations
docker --version
docker compose version
```

---

## 4. Transfer the Project to the Server

You need to move your project files onto the Bluehost server. You can do this by cloning from Git or transferring directly via SCP.

### Option A: Clone via Git (Recommended)
```bash
# Install git if not installed
sudo apt install git -y

# Clone your repository
git clone https://github.com/your-username/your-erp-repo.git /root/erp
cd /root/erp
```

### Option B: Copy from your local machine via SCP
Run this command from your **local computer's terminal** (not the Bluehost server):
```bash
# Upload the entire erp folder to the server
scp -r /path/to/your/erp/folder root@your_bluehost_server_ip:/root/erp
```

---

## 5. Configure Environment Variables

Before starting the containers, review the `docker-compose.yml` file.

```bash
cd /root/erp
nano docker-compose.yml
```

**Security Warning:** In a real production environment, you should change the following default values in the `docker-compose.yml`:
- `MYSQL_ROOT_PASSWORD` (under the mysql service)
- `PLATFORM_DB_PASSWORD` (under the backend service)
- `JWT_SECRET` (under the backend service)
- `JWT_REFRESH_SECRET` (under the backend service)

Press `CTRL+X`, then `Y`, then `Enter` to save and exit nano.

---

## 6. Start the Application

Once your configuration is ready, you can build and spin up the entire stack.

```bash
docker compose up -d --build
```

**What this command does:**
- `-d`: Runs the containers in the background (detached mode).
- `--build`: Forces Docker to build the Go backend and Vite frontend from their respective `Dockerfile`s.
- It will also download the official MySQL and Redis images.

---

## 7. Verify the Deployment

Check if all containers (frontend, backend, mysql, redis) are running properly:

```bash
docker compose ps
```

If any container is crashing, you can view the logs to debug:

```bash
# View logs for all services
docker compose logs -f

# View logs for a specific service (e.g., backend)
docker compose logs -f backend
```

---

## 8. Accessing the Application

If everything is running successfully, you can open your web browser and navigate to:

```
http://your_bluehost_server_ip
```

The Nginx container (Frontend) is listening on port `80` and will serve your React application. The React application will seamlessly communicate with the Go backend container running internally.

## Multithreading and Caching Note

- **Multithreading:** The Go backend inherently handles requests concurrently via "Goroutines" out of the box, meaning your API is automatically multithreaded.
- **Caching:** The Redis caching layer is actively running and managing session/permission caching to optimize database queries.
