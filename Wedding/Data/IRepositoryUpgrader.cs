namespace Wedding.Data
{
    using System.Collections.Generic;
    using System.Text.Json;
    using Wedding.Models;

    /// <summary>
    /// The interface that performs upgrades on the repository model
    /// </summary>
    /// <typeparam name="T">The type of model contained in the repository</typeparam>
    public interface IRepositoryUpgrader<T> where T : AbstractModel
    {
        /// <summary>
        /// The latest version that this software expects (the version of the model "T")
        /// </summary>
        int LatestVersion { get; }

        /// <summary>
        /// Deserializes the list of items and upgrade them in the process
        /// </summary>
        /// <param name="fileVersion">The version as read from the file</param>
        /// <param name="itemArray">The item array to deserialize from</param>
        IEnumerable<T> Upgrade(int fileVersion, JsonElement itemArray);
    }
}