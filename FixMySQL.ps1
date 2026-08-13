$mysqlDir = "C:\Program Files\MySQL\MySQL Server 8.4"
$mysqlBin = "$mysqlDir\bin"
cd $mysqlBin

Write-Host "Stopping and removing broken service..."
Stop-Service MySQL84 -ErrorAction SilentlyContinue
.\mysqld.exe --remove MySQL84 

Write-Host "Cleaning up corrupted data directory..."
if (Test-Path "$mysqlDir\data") {
    Remove-Item -Path "$mysqlDir\data" -Recurse -Force
}

Write-Host "Creating low-memory my.ini config..."
$myIniPath = "$mysqlDir\my.ini"
$myIniContent = @"
[mysqld]
basedir=C:/Program Files/MySQL/MySQL Server 8.4
datadir=C:/Program Files/MySQL/MySQL Server 8.4/data
innodb_buffer_pool_size=32M
innodb_log_buffer_size=1M
key_buffer_size=8M
max_connections=50
"@
Set-Content -Path $myIniPath -Value $myIniContent -Force

Write-Host "Re-initializing Database with low memory settings..."
.\mysqld.exe --defaults-file="$myIniPath" --initialize-insecure --console

Write-Host "Installing MySQL Service..."
.\mysqld.exe --install MySQL84 --defaults-file="$myIniPath"

Write-Host "Starting MySQL Service..."
Start-Service MySQL84
Start-Sleep -Seconds 3

Write-Host "Setting root password..."
.\mysql.exe -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';"

Write-Host "Configuration Complete. Press any key to close."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
