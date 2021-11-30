echo "Kill all the running PM2 actions"
sudo pm2 stop twitter

echo "Jump to app folder"
cd /home/engin/twitter-screenshot

echo "Update app from Git"
git pull

echo "Install app dependencies"
sudo rm -rf node_modules package-lock.json
sudo npm install

echo "Run new PM2 action"
sudo pm2 start twitter
