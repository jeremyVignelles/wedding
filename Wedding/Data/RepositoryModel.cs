namespace Wedding.Data
{
    using System.Collections.Generic;
    using Wedding.Models;

    /// <summary>
    /// The model that is stored inside a repository file
    /// </summary>
    /// <typeparam name="T">The type of data to store</typeparam>
    public class RepositoryModel<T> where T:AbstractModel
    {
        /// <summary>
        /// The constructor
        /// </summary>
        /// <param name="version">The version of the repository file</param>
        public RepositoryModel(int version)
        {
            this.Version = version;
        }

        /// <summary>
        /// The file version, useful for upgrades
        /// </summary>
        public int Version { get; }

        /// <summary>
        /// The records in the file
        /// </summary>
        public List<T> Data { get; } = new List<T>();
    }
}