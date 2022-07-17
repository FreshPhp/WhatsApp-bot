#!/usr/bin/bash
clear
apt-get update
apt-get upgrade
pkg install nodejs -y; pkg install nodejs-lts
clear
npm install -no-bin-links
sh start.sh
