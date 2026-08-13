$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
cd $mysqlBin
Write-Host "Initializing MySQL Database..."
.\mysqld.exe --initialize-insecure --console
Write-Host "Installing MySQL Service..."
.\mysqld.exe --install MySQL84
Write-Host "Starting MySQL Service..."
Start-Service MySQL84
Start-Sleep -Seconds 3
Write-Host "Setting root password..."
.\mysql.exe -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';"
Write-Host "Configuration Complete. Press any key to close."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
