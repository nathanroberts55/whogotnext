# Create certs directory
New-Item -ItemType Directory -Force -Path ./certs

# Check multiple possible OpenSSL locations
$opensslPaths = @(
    "C:\Program Files\OpenSSL-Win64\bin\openssl.exe",
    "C:\Program Files (x86)\OpenSSL-Win32\bin\openssl.exe",
    "C:\OpenSSL-Win64\bin\openssl.exe",
    "C:\OpenSSL-Win32\bin\openssl.exe"
)

$openssl = $null
foreach ($path in $opensslPaths) {
    if (Test-Path $path) {
        $openssl = $path
        break
    }
}

if (-not $openssl) {
    Write-Host "OpenSSL not found. Please install it using: winget install ShiningLight.OpenSSL"
    Write-Host "After installation, restart PowerShell and try again."
    exit 1
}

Write-Host "Using OpenSSL from: $openssl"

try {
    # Generate CA key and certificate
    & $openssl genrsa -out ./certs/ca.key 2048
    if ($LASTEXITCODE -ne 0) { throw "Failed to generate CA key" }

    & $openssl req -new -x509 -days 365 -key ./certs/ca.key -out ./certs/ca.crt -subj "/CN=Redis CA"
    if ($LASTEXITCODE -ne 0) { throw "Failed to generate CA certificate" }

    # Generate Redis server key and CSR
    & $openssl genrsa -out ./certs/redis.key 2048
    if ($LASTEXITCODE -ne 0) { throw "Failed to generate Redis key" }

    & $openssl req -new -key ./certs/redis.key -out ./certs/redis.csr -subj "/CN=localhost"
    if ($LASTEXITCODE -ne 0) { throw "Failed to generate CSR" }

    # Sign the Redis server certificate with CA
    & $openssl x509 -req -days 365 -in ./certs/redis.csr -CA ./certs/ca.crt -CAkey ./certs/ca.key -CAcreateserial -out ./certs/redis.crt
    if ($LASTEXITCODE -ne 0) { throw "Failed to sign certificate" }

    Write-Host "Certificates generated successfully in ./certs directory"
} catch {
    Write-Host "Error generating certificates: $_"
    exit 1
}