```
server:
        verbosity: 1
        num-threads: 4
        interface: 0.0.0.0
        port: 53
        outgoing-port-permit: 32768-60999
        do-ip4: yes
        do-udp: yes
        do-tcp: yes
        do-daemonize: yes
        access-control: 172.17.0.0/16 allow
        access-control: 127.0.0.0/8 allow
        unwanted-reply-threshold: 10000000
        do-not-query-localhost: no
        trust-anchor-file: "/usr/share/dnssec-root/trusted-key.key"
        domain-insecure: "cent.int"
        val-log-level: 1
        ede: yes
        ede-serve-expired: yes

remote-control:
        control-enable: yes
        control-interface: /run/unbound.control.sock

stub-zone:
        name: "cent.int"
        stub-addr: 127.0.0.1@53530

forward-zone:
        name: "."
        forward-addr: 1.1.1.1
        forward-addr: 1.0.0.1

include-toplevel: "/etc/unbound/unbound.conf.d/*.conf"
```