using Microsoft.EntityFrameworkCore;
using CitizenConcernAPI.Data;

namespace CitizenConcernAPI.Extensions;

public static class DatabaseExtensions
{
    public static IServiceCollection AddDatabaseProvider(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ?? configuration.GetConnectionString("DefaultConnection");
        var logger = services.BuildServiceProvider().GetRequiredService<ILogger<Program>>();
        
        logger.LogInformation($"Environment: {environment.EnvironmentName}");
        logger.LogInformation($"Database URL provided: {!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_URL"))}");

        // Parse Heroku MSSQL connection string if present (Softtrends addon format)
        if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("database.windows.net"))
        {
            logger.LogInformation("Using Heroku Softtrends MSSQL connection string...");
        }

        // Use SQL Server for all environments
        logger.LogInformation("Using SQL Server database provider");
        var finalConnectionString = connectionString ?? "Server=(localdb)\\mssqllocaldb;Database=CitizenConcernDB;Trusted_Connection=true;MultipleActiveResultSets=true";
        
        logger.LogInformation($"Using connection string: {(finalConnectionString.Contains("database.windows.net") ? "Azure SQL (Heroku)" : "LocalDB")}");
        
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(finalConnectionString, ConfigureSqlServer));

        return services;
    }

    private static void ConfigureSqlServer(Microsoft.EntityFrameworkCore.Infrastructure.SqlServerDbContextOptionsBuilder sqlOptions)
    {
        sqlOptions.UseNetTopologySuite();
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    }
}