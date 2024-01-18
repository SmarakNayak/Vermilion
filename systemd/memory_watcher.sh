#!/bin/bash
while true
do
  m=`free -m | head -n 2 |tail -n 1 | tr -s " " | cut -d " " -f 3`
  echo "Memory used: $m"
  if [ $m -ge 31000 ]; then
    echo "Way too much memory, Hard killing"
    systemctl kill -s SIGKILL ordserver.service&
    sleep 50
  elif [ $m -ge 29000 ]; then
    echo "Memory getting high, Soft killing"
    systemctl restart ordserver.service&
  fi
  sleep 10
done