```
"mod_setenv",
"mod_openssl"

$SERVER["socket"] == ":443" {
    ssl.engine  = "enable"
    ssl.pemfile = "/etc/ssl/private/lighttpd.cert.pem"
    ssl.privkey = "/etc/ssl/private/lighttpd.key.pem"
    ssl.ca-file = "/etc/ssl/private/ca.cert.pem"

    setenv.add-response-header = (
        "Access-Control-Allow-Origin"  => "https://blue-river.6253.workers.dev",
        "Access-Control-Allow-Methods" => "GET, PUT, POST, OPTIONS",
        "Access-Control-Allow-Headers" => "Content-Type, Accept, Authorization"
    )
}
```
