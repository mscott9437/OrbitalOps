
## Network settings

### Check current network settings

```powershell
Get-NetIPConfiguration
```

### Disable DHCP for adapter

```powershell
Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Disabled
```

### Set new static IP and DNS servers

```powershell
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.122.10 -PrefixLength 24 -DefaultGateway 192.168.122.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("1.1.1.1", "1.0.0.1")
```

### Re-enable DHCP and reset DNS servers

```powershell
Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ResetServerAddresses
```

### Wipe IPv4 settings

```powershell
Remove-NetIPAddress -InterfaceAlias "Ethernet" -AddressFamily IPv4
```

### Disable Firewall

```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

### Enable Firewall

```powershell
Set-NetFirewallProfile -All -Enabled True
```

---

## Active Directory Domain Services

### Install Active Directory service with management tools

```powershell
Install-WindowsFeature -name AD-Domain-Services -IncludeManagementTools
```

### See available cmdlets in module

```powershell
Get-Command -Module ADDSDeployment
```

### See arguments available for specified cmdlet

```powershell
Get-Help <cmdlet name>
```

### Test installation of new forest

```powershell
Test-ADDSForestInstallation -DomainName "my.domain"
```

### Install new forest domain

```powershell
Install-ADDSForest -DomainName "my.domain"
```

---

## OpenSSH

### Check if current user has admin rights

```powershell
(New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

### Start the sshd service

```powershell
Start-Service sshd
```

### Set OpenSSH to automatically start on boot

```powershell
Set-Service -Name sshd -StartupType 'Automatic'
```

### Check if firewall rule exists and add if necessary

```powershell
if (!(Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue)) {
    Write-Output "Firewall Rule 'OpenSSH-Server-In-TCP' does not exist, creating it..."
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
} else {
    Write-Output "Firewall rule 'OpenSSH-Server-In-TCP' has been created and exists."
}
```

### Connect to remote server via ssh

```powershell
ssh domain\username@servername
```

### Stop the sshd service

```powershell
Stop-Service sshd
```

### Disable automatic startup of OpenSSH

```powershell
Set-Service -Name sshd -StartupType 'Disabled
```

### Check if firewall rule exists and delete if necessary

```powershell
if ((Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue)) {
    Write-Output "Firewall rule 'OpenSSH-Server-In-TCP' is being disabled."
    Disable-NetFirewallRule -Name 'OpenSSH-Server-In-TCP'
} else {
    Write-Output "Firewall Rule 'OpenSSH-Server-In-TCP' does not exist, disable failed..."
}
```
