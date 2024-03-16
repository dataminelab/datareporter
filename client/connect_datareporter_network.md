```bash
>> docker network connect datareporter_default router
>> docker inspect -f '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}' router
docker_default, datareporter_default
>> docker inspect -f '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}' datareporter-server-1
datareporter_default 
>> docker exec datareporter-server-1 ping router -c2
PING router (172.19.0.9) 56(84) bytes of data.
64 bytes from router.datareporter_default (172.19.0.9): icmp_seq=1 ttl=64 time=1.51 ms
64 bytes from router.datareporter_default (172.19.0.9): icmp_seq=2 ttl=64 time=0.057 ms

--- router ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 3ms
rtt min/avg/max/mdev = 0.057/0.781/1.506/0.725 ms
```