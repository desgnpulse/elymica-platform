# Firewall Unblock Steps for Cloudflare Tunnel

**Issue:** Cloudflare Tunnel cannot connect because outbound connections to port 7844 are blocked by the server firewall.

**Error:** `dial tcp 198.41.x.x:7844: connect: connection refused`

---

## 🔓 Manual Steps to Unblock (Requires Root Access)

### Step 1: Get Root Access

SSH to the server and switch to root:

```bash
ssh -i ~/.ssh/webuzo_id_rsa desgvjox@199.192.22.106

# Switch to root (you'll need the root password)
su -
# OR if sudo is configured:
sudo -i
```

### Step 2: Check Current Firewall Type

The server might be using one of these firewall systems:

```bash
# Check if iptables is active
iptables -L -n | head -20

# Check if firewalld is active
systemctl status firewalld

# Check if ufw is active
ufw status

# Check if CSF (ConfigServer Firewall) is active
csf -v
```

---

## 🔥 For iptables (Most Common)

### Check Current Rules

```bash
# View all rules
iptables -L -n -v

# Check OUTPUT chain (outbound connections)
iptables -L OUTPUT -n -v

# Check if there's a rule blocking port 7844
iptables -L OUTPUT -n -v | grep 7844
```

### Allow Outbound Connections to Port 7844

```bash
# Allow outbound TCP to port 7844 (Cloudflare edge)
iptables -A OUTPUT -p tcp --dport 7844 -j ACCEPT

# Allow outbound UDP to port 7844 (QUIC protocol)
iptables -A OUTPUT -p udp --dport 7844 -j ACCEPT

# Verify rules added
iptables -L OUTPUT -n -v | grep 7844
```

### Make Rules Persistent

**For Ubuntu/Debian:**
```bash
# Install iptables-persistent if not installed
apt-get install iptables-persistent -y

# Save current rules
iptables-save > /etc/iptables/rules.v4

# OR use netfilter-persistent
netfilter-persistent save
```

**For CentOS/RHEL/Webuzo:**
```bash
# Save rules
service iptables save

# OR
iptables-save > /etc/sysconfig/iptables
```

---

## 🔥 For firewalld (CentOS/RHEL 7+)

### Allow Port 7844

```bash
# Allow TCP port 7844
firewall-cmd --permanent --add-port=7844/tcp

# Allow UDP port 7844
firewall-cmd --permanent --add-port=7844/udp

# Reload firewall
firewall-cmd --reload

# Verify
firewall-cmd --list-ports
```

---

## 🔥 For UFW (Ubuntu/Debian)

### Allow Port 7844

```bash
# Allow outbound to port 7844
ufw allow out 7844/tcp
ufw allow out 7844/udp

# Reload
ufw reload

# Check status
ufw status verbose
```

---

## 🔥 For CSF (ConfigServer Firewall)

CSF is commonly used with cPanel/Webuzo servers.

### Check if CSF is Installed

```bash
csf -v
```

### Allow Port 7844

```bash
# Edit CSF configuration
nano /etc/csf/csf.conf

# Find the line: TCP_OUT = "..."
# Add 7844 to the list of allowed outbound TCP ports
# Example: TCP_OUT = "20,21,22,25,53,80,110,113,443,7844"

# Find the line: UDP_OUT = "..."
# Add 7844 to the list of allowed outbound UDP ports
# Example: UDP_OUT = "20,21,53,113,123,7844"

# Save and exit (Ctrl+X, Y, Enter)

# Restart CSF
csf -r

# Verify
csf -l | grep 7844
```

---

## 🔥 For Webuzo Firewall (Webuzo Admin Panel)

Webuzo has its own firewall management interface.

### Via Webuzo Admin Panel

1. Login to Webuzo Admin Panel: `http://199.192.22.106:2004` (or your Webuzo port)
2. Go to **System** → **Firewall**
3. In **Outbound TCP Ports**, add: `7844`
4. In **Outbound UDP Ports**, add: `7844`
5. Click **Submit**
6. Restart firewall

### Via Command Line

```bash
# Webuzo uses a custom firewall script
# Check if webuzo-firewall service exists
systemctl status webuzo-firewall

# If it exists, you may need to edit the config
# Location varies, check:
ls -la /usr/local/webuzo/firewall/
ls -la /etc/webuzo/

# Or modify iptables directly and make persistent (see iptables section above)
```

---

## ✅ Step 3: Test Cloudflare Tunnel After Unblocking

After opening the firewall, test the tunnel:

```bash
# As desgvjox user (not root)
exit  # Exit from root

# Export PATH
export PATH=$HOME/bin:$PATH

# Stop any running cloudflared processes
pkill cloudflared

# Test tunnel connectivity
cloudflared tunnel run elymica-backend
```

**Expected Output (Success):**
```
INF Connection established
INF Registered tunnel connection
INF Starting metrics server on 127.0.0.1:XXXX
```

**If still failing:**
```
ERR Unable to establish connection with Cloudflare edge error="DialContext error: dial tcp..."
```

This means the firewall is still blocking. Check for additional firewall layers.

---

## 🔍 Step 4: Verify Firewall Rules Are Active

### Check Outbound Connection

```bash
# Test if port 7844 is reachable
nc -zv 198.41.192.227 7844

# OR
telnet 198.41.192.227 7844

# Expected: "Connection succeeded" or "Connected"
# If blocked: "Connection refused" or "Connection timed out"
```

### Check for Multiple Firewall Layers

Some hosting providers have multiple firewall layers:

```bash
# Check for multiple iptables chains
iptables-save | grep 7844

# Check for network-level restrictions
ip route show

# Check if there's a WAF or security group
# (This would be in your hosting provider's control panel)
```

---

## 🚨 Step 5: Contact Hosting Provider (If Still Blocked)

If the firewall rules are correct but connection still fails, the hosting provider may have network-level restrictions.

### Information to Provide to Hosting Support:

```
Subject: Request to Allow Outbound Connections to Cloudflare Edge (Port 7844)

Hello,

I need to allow outbound TCP/UDP connections to port 7844 for Cloudflare Tunnel
(cloudflared) on my server: 199.192.22.106

Destination IPs: Cloudflare edge network (198.41.x.x range)
Required Ports: TCP/UDP 7844

Purpose: Secure tunnel for API backend connectivity

The tunnel is failing with "connection refused" errors despite local firewall rules
being configured correctly. This suggests network-level blocking.

Can you please whitelist outbound connections to port 7844?

Thank you!
```

---

## 🔄 Alternative: Use Port 443 Instead (Fallback)

If port 7844 cannot be unblocked, configure cloudflared to use port 443:

```bash
# Edit config file
nano ~/.cloudflared/config.yml

# Add this line under tunnel ID:
protocol: http2

# Full config:
tunnel: e807401d-81be-4c2c-8b05-343d29a27ab5
credentials-file: /home/desgvjox/.cloudflared/e807401d-81be-4c2c-8b05-343d29a27ab5.json
protocol: http2

ingress:
  - hostname: api.elymica.com
    service: http://localhost:8000
  - hostname: auth.elymica.com
    service: http://localhost:8007
  - service: http_status:404
```

Then run with edge IP override:

```bash
# Force connection via port 443
cloudflared tunnel --protocol http2 --edge-ip-version 4 run elymica-backend
```

**Note:** This may have reduced performance but should work if port 7844 is blocked.

---

## 📊 Quick Reference Commands

```bash
# === AS ROOT ===

# iptables: Allow port 7844
iptables -A OUTPUT -p tcp --dport 7844 -j ACCEPT
iptables -A OUTPUT -p udp --dport 7844 -j ACCEPT
iptables-save > /etc/iptables/rules.v4

# firewalld: Allow port 7844
firewall-cmd --permanent --add-port=7844/tcp
firewall-cmd --permanent --add-port=7844/udp
firewall-cmd --reload

# ufw: Allow port 7844
ufw allow out 7844/tcp
ufw allow out 7844/udp
ufw reload

# CSF: Edit config
nano /etc/csf/csf.conf
# Add 7844 to TCP_OUT and UDP_OUT
csf -r

# === AS REGULAR USER ===

# Test tunnel
export PATH=$HOME/bin:$PATH
pkill cloudflared
cloudflared tunnel run elymica-backend

# Test port connectivity
nc -zv 198.41.192.227 7844
```

---

## ✅ Success Indicators

After unblocking, you should see:

```bash
2025-11-20T12:00:00Z INF Connection <UUID> registered connIndex=0
2025-11-20T12:00:00Z INF Starting metrics server on 127.0.0.1:XXXX
```

Then test:

```bash
# From your local machine
curl https://auth.elymica.com/health

# Should return:
{"status":"healthy","service":"auth-service",...}
```

---

**Next Steps After Unblocking:**
1. Run tunnel in background: `nohup cloudflared tunnel run elymica-backend &`
2. Fix `api.elymica.com` DNS record
3. Install tunnel as system service
4. Test end-to-end connectivity from frontend

---

**Created:** 2025-11-20
**Server:** 199.192.22.106 (panel.desgnpulse.com)
**Tunnel ID:** e807401d-81be-4c2c-8b05-343d29a27ab5
