namespace Wedding.Data.Upgraders
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Text.Json;
    using Wedding.Models;

    /// <summary>
    /// The default implementation of the upgrader, that doesn't upgrade anything and that has a version of 1 (first version)
    /// </summary>
    /// <typeparam name="T">The type of model</typeparam>
    public class DefaultUpgrader<T> : IRepositoryUpgrader<T> where T : AbstractModel
    {
        /// <summary>
        /// The latest version that this software expects (the version of the model "T")
        /// </summary>
        public int LatestVersion => 1;

        /// <summary>
        /// Deserializes the list of items and upgrade them in the process
        /// </summary>
        /// <param name="fileVersion">The version as read from the file</param>
        /// <param name="itemArray">The item array to deserialize from</param>
        public IEnumerable<T> Upgrade(int fileVersion, JsonElement itemArray)
        {
            return Enumerable.Empty<T>();
        }
    }
}