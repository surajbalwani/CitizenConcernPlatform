# ============================================
# Citizen Concern Platform - Database Seeding PowerShell Script
# ============================================
# This script runs the database seeding SQL script
# ============================================

param(
    [Parameter(Mandatory=$false)]
    [string]$ConnectionString = "Server=(localdb)\mssqllocaldb;Database=CitizenConcernDB;Trusted_Connection=true;MultipleActiveResultSets=true",
    
    [Parameter(Mandatory=$false)]
    [string]$SqlFilePath = "..\Data\SeedData.sql"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Citizen Concern Platform - Database Seeder" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if SQL file exists
if (-not (Test-Path $SqlFilePath)) {
    Write-Host "ERROR: SQL file not found at: $SqlFilePath" -ForegroundColor Red
    Write-Host "Please ensure the SeedData.sql file exists in the correct location." -ForegroundColor Red
    exit 1
}

Write-Host "Connection String: $ConnectionString" -ForegroundColor Yellow
Write-Host "SQL File Path: $SqlFilePath" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Executing database seeding script..." -ForegroundColor Green
    
    # Use sqlcmd to execute the script
    $result = sqlcmd -S "(localdb)\mssqllocaldb" -d "CitizenConcernDB" -i $SqlFilePath -b
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Database seeding completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=== READY TO USE LOGIN CREDENTIALS ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "👥 Citizens:" -ForegroundColor White
        Write-Host "   📧 citizen1@test.com / Citizen@123" -ForegroundColor Gray
        Write-Host "   📧 citizen2@test.com / Citizen@123" -ForegroundColor Gray
        Write-Host ""
        Write-Host "👮 Staff Accounts:" -ForegroundColor White
        Write-Host "   📧 officer1@government.local / Officer@123" -ForegroundColor Gray
        Write-Host "   📧 depthead@government.local / DeptHead@123" -ForegroundColor Gray
        Write-Host "   📧 admin1@government.local / Admin@123" -ForegroundColor Gray
        Write-Host "   📧 superadmin@government.local / SuperAdmin@123" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🌐 Frontend URL: http://localhost:4202" -ForegroundColor Yellow
        Write-Host "🔗 Login Page: http://localhost:4202/auth/login" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "✨ Ready to test the application!" -ForegroundColor Green
        Write-Host "=================================" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Database seeding failed!" -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error occurred during database seeding:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting Tips:" -ForegroundColor Yellow
    Write-Host "1. Ensure SQL Server LocalDB is installed and running" -ForegroundColor Gray
    Write-Host "2. Verify the database 'CitizenConcernDB' exists" -ForegroundColor Gray
    Write-Host "3. Run 'dotnet ef database update' first if needed" -ForegroundColor Gray
    Write-Host "4. Check that sqlcmd is available in your PATH" -ForegroundColor Gray
    exit 1
}