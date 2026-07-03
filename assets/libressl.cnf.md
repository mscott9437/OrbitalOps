```
[ req ]
distinguished_name = req_distinguished_name
x509_extensions    = v3_ca
prompt             = no

[ req_distinguished_name ]
C  = US
ST = Texas
L  = Dallas
O  = CENT
CN = Central Internal Authority

[ v3_ca ]
basicConstraints       = critical, CA:TRUE
keyUsage               = critical, digitalSignature, cRLSign, keyCertSign
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid:always,issuer

[ v3_server ]
basicConstraints       = CA:FALSE
nsCertType             = server
keyUsage               = critical, digitalSignature, keyEncipherment
extendedKeyUsage       = serverAuth
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid,issuer
subjectAltName         = @alt_names

[ alt_names ]
DNS.1 = para.cent.int
DNS.2 = localhost
IP.1  = 127.0.0.1
```
