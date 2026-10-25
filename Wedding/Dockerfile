#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_DataFolder=/data
ENV ASPNETCORE_HTTP_PORTS=80
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Wedding.csproj", "./"]
RUN dotnet restore "Wedding.csproj"
COPY . .
RUN dotnet build "Wedding.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Wedding.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
HEALTHCHECK CMD curl --fail http://localhost/health || exit 1
ENTRYPOINT ["dotnet", "Wedding.dll"]