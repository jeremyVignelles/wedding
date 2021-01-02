namespace Wedding.Data
{
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Options;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Text.Json;
    using System.Threading;
    using System.Threading.Tasks;
    using Wedding.Models;

    /// <summary>
    /// The repository for models of type T, stored in files.
    /// </summary>
    /// <typeparam name="T">The type of model to store</typeparam>
    public class Repository<T> : IHostedService where T : AbstractModel
    {
        private readonly string _filePath;

        /// <summary>
        /// The data stored in the file, mapped into memory
        /// </summary>
        protected RepositoryModel<T> Model { get; }

        private readonly ConcurrentExclusiveSchedulerPair _schedulers = new ConcurrentExclusiveSchedulerPair();

        protected TaskFactory ReaderTaskFactory { get; }
        protected TaskFactory WriterTaskFactory { get; }
        private readonly IRepositoryUpgrader<T> _repositoryUpgrader;

        /// <summary>
        /// The constructor
        /// </summary>
        /// <param name="foldersOptions">The options that contains the file location</param>
        /// <param name="repositoryUpgrader">The object that will upgrade the repository to a newer version</param>
        public Repository(IOptions<DataFolderOptions> foldersOptions, IRepositoryUpgrader<T> repositoryUpgrader)
        {
            var folder = foldersOptions.Value.DataFolder;
            if(!Path.IsPathRooted(folder)) {
                folder = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? "", folder);
            }

            Directory.CreateDirectory(folder);
            this._filePath = Path.Combine(folder, typeof(T).Name + ".db");
            this.Model = new RepositoryModel<T>(repositoryUpgrader.LatestVersion);
            this.ReaderTaskFactory = new TaskFactory(CancellationToken.None,
                TaskCreationOptions.DenyChildAttach | TaskCreationOptions.RunContinuationsAsynchronously,
                TaskContinuationOptions.None,
                this._schedulers.ConcurrentScheduler);
            this.WriterTaskFactory = new TaskFactory(CancellationToken.None,
                TaskCreationOptions.DenyChildAttach | TaskCreationOptions.RunContinuationsAsynchronously,
                TaskContinuationOptions.None,
                this._schedulers.ExclusiveScheduler);
            this._repositoryUpgrader = repositoryUpgrader;
        }

        /// <summary>
        /// Triggered when the application host is ready to start the service.
        /// </summary>
        /// <param name="cancellationToken">Indicates that the start process has been aborted.</param>
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var folderName = Path.GetDirectoryName(this._filePath)!;
            Directory.CreateDirectory(folderName);
            if (File.Exists(this._filePath))
            {
                await using var fileStream = File.OpenRead(this._filePath);
                var document = await JsonDocument.ParseAsync(fileStream, cancellationToken: cancellationToken);

                var fileVersion = document.RootElement.GetProperty(nameof(RepositoryModel<T>.Version)).GetInt32();
                var dataArray = document.RootElement.GetProperty(nameof(RepositoryModel<T>.Data));

                if (fileVersion == this._repositoryUpgrader.LatestVersion)
                {
                    // Direct deserialization
                    this.Model.Data.AddRange(JsonSerializer.Deserialize<IEnumerable<T>>(dataArray.GetRawText()));
                }
                else if(fileVersion < this._repositoryUpgrader.LatestVersion)
                {
                    this.Model.Data.AddRange(this._repositoryUpgrader.Upgrade(fileVersion, dataArray));
                }
                else
                {
                    throw new InvalidOperationException($"File version {fileVersion} is greater than the upgrader version {this._repositoryUpgrader.LatestVersion}");
                }
            }
        }

        /// <summary>
        /// Triggered when the application host is performing a graceful shutdown.
        /// </summary>
        /// <param name="cancellationToken">Indicates that the shutdown process should no longer be graceful.</param>
        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Gets all items from the repository
        /// </summary>
        public Task<T[]> GetAllAsync()
        {
            return this.ReaderTaskFactory.StartNew(() => this.Model.Data.ToArray());
        }

        /// <summary>
        /// Gets an item by its id
        /// </summary>
        /// <param name="id">The identifier to look for</param>
        public Task<T?> GetByIdAsync(int id)
        {
            return this.ReaderTaskFactory.StartNew(() => (T?)this.Model.Data.FirstOrDefault(d => d.Id == id));
        }

        /// <summary>
        /// Adds an item to the collection, or updates it if the item already exists
        /// </summary>
        /// <param name="item">The item to add</param>
        public Task AddOrUpdateAsync(T item)
        {
            return this.WriterTaskFactory.StartNew(async () =>
            {
                await Task.CompletedTask; // Disabled writing for public access
                /* var index = this.Model.Data.FindIndex(d => d.Id == item.Id);
                if (index != -1)
                {
                    this.Model.Data[index] = item;
                }
                else
                {
                    this.Model.Data.Add(item);
                }
                await this.SaveAsync(); */
            }).Unwrap();
        }

        /// <summary>
        /// Removes an item by its id
        /// </summary>
        /// <param name="id">The identifier of the item to remove</param>
        public Task RemoveAsync(int id)
        {
            return this.WriterTaskFactory.StartNew(async () =>
            {
                await Task.CompletedTask; // Disabled writing for public access
                /*
                this.Model.Data.RemoveAll(item => item.Id == id);
                await this.SaveAsync();
                */
            }).Unwrap();
        }

        /// <summary>
        /// Saves the files. This must be placed inside an ExclusiveScheduler
        /// </summary>
        protected async ValueTask SaveAsync()
        {
            await using var fileStream = File.Create(this._filePath);
            await JsonSerializer.SerializeAsync(fileStream, this.Model);
        }
    }
}