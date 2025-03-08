# README

### What is this repository for?
* **Quick summary** - Telemedicine portal. 
* **Version** - The project has on continuous development and contains different modules.

### Architecture
* Environments - NodeJS, Docker, Linux
* The project has 2 packages -
  * Frontend - A React app served using nginx
    * Uses WebRTC for audio/video calling
  * Backend - An Express app served using pm2
    * Uses socket.io to establish a realtime connection with the client
* A functional production deployment requires the following -
  1. A configuration file in `/etc/nginx/sites-enabled`
  2. SSL
  3. Built files in `/var/www/tele`
  4. `tele/Backend` packege
  5. `mongodb` running as a service or as a container.
  6. `redis` running as a service or as a container

### How do I get set up?

* **Dependencies**
1. nodeJS 18
2. yarn
3. docker
4. docker compose
5. redis
6. mongodb
7. nginx

### Summary of set up
1. Make sure that you have installed `nodejs 18`, `yarn`, `git`, `nginx`.
2. [Download](https://github.com/maniksejwal/tele) the repository using the command `git clone https://github.com/maniksejwal/tele.git`
3. **Setting up the frontend service**
   * Navigate to `./Frontend` and run `yarn install`.
   * To deploy in the development environment, `yarn start`.
   * Run `yarn build-linux` for production, or `yarn build-linux-deobfuscated` to enable client side logging in production. For Windows, `yarn build`.
   * Copy the contents of [nginx_conf](https://github.com/maniksejwal/tele/blob/master/Frontend/nginx_conf) file to `/etc/nginx/sites-enabled/tele` file.
   * Copy the contents of `./Frontend/build` to `/var/www/tele`.
   * Run `sudo nginx -t` to verify the `etc/nginx/nginx.conf` and `/etc/nginx/sites-enabled/*`.
   * Execute using `sudo systemctl restart nginx`. Make sure that the express service is running first.
6. **Setting up the backend service**
  * Navigate to `./Backend` and run `yarn install`.
  * Start in the development mode using `yarn start`.
  * Start the production service using `pm2 --name tele start yarn -- start`.
  * OR
  * **For a dockerized deployment**,
    * Navigate to to the project root.
    * First start using `sudo docker compose up --build -d backend`.
    * Restart using `sudo docker compose up -d backend`.
    * Check status using `sudo docker ps` and `sudo docker logs backend`.
    * To enter the container and use it like a VM, `sudo docker exec -it backend bash`.
  * Dependencies - redis and mongodb
7. **Mongodb** can be started as a service using `sudo systemctl restart mongod`, or
  * As a container (preferred) by navigating to the project root and executing `sudo docker compose up --build -d mongo`
  * Restart using `sudo docker compose up -d mongo`.
  * Check logs using `sudo docker ps` and `sudo docker logs backend`.
  * Use the mongo shell using `mongosh`, or `sudo docker exec -it mongo mongosh`.
  * The container can be accessed using `sudo docker exec -it mongo bash`.
9. **Redis** can be started as a service using `redis-server --daemonize yes`, or
  * as a container by navigating to the project root and executing `sudo docker compose up --build -d redis`
  * Restart using `sudo docker compose up -d redis`

### Restore a mongodb backup
* To restore a backup,
  * Navigate to the project root
  * Stop the MongoDB container `sudo docker stop mongo`
  * Delete the MongoDB container `sudo docker rm -f mongo`
  * Wipe the MongoDB volume `sudo rm -r /var/lib/mongodb/*`
  * Restore data `sudo cp -r <source directory>/* /var/lib/mongodb/`. Example `sudo cp -r /mnt/pd/250222/m/* /var/lib/mongodb/`
  * Cross check the contents
  * Start the mongo container from the project root using `sudo docker compose up --build -d mongo`.
  * To validate the db contents -
    * `sudo docker exec -it mongo mongosh`
    * `show databases`. `covid` should exist
    * `use covid` to select the db
    * `show collections` to see the collections
    * `db.<collection_name>.find()` to view the contents of a collection.
