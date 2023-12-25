forever start --uid "dou" /home/server/dou-server/dist/index.js -a

forever restart dou

forever stop dou

tail -n 15 -f /root/.forever/dou.log
