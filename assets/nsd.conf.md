```
server:
   ip-address: 127.0.0.1
   port: 53530
   do-ip4: yes
   username: nsd
   zonesdir: "/etc/nsd"
   logfile: "/var/log/nsd.log"
   pidfile: "/run/nsd/nsd.pid"

remote-control:
   control-enable: yes
   control-interface: /run/nsd.control.sock

zone:
   name: "cent.int"
   zonefile: "cent.int.zone"
```