# Use the official .NET 8.0 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CitizenConcernAPI.csproj", "."]
RUN dotnet restore "CitizenConcernAPI.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "CitizenConcernAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CitizenConcernAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variable for Heroku port
ENV ASPNETCORE_URLS=http://*:$PORT
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "CitizenConcernAPI.dll"]