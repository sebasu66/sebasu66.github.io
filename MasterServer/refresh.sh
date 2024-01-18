sudo -u nodejs pm2 stop /src/server/index.js
git fetch
git pull
sudo -u nodejs pm2 start /src/server/index.js
