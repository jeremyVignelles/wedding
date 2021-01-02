namespace Wedding.Models
{
    /// <summary>
    /// The configuration of the admin user
    /// </summary>
    public class AdministratorOptions {
        /// <summary>
        /// The user name
        /// </summary>
        public string User { get; set; } = "root";

        /// <summary>
        /// The hashed password
        /// </summary>
        public string Password { get; set; } = "AQAAAAEAACcQAAAAEKVVbJJwH4KesfaaHcVGC/JdGpsAyeY45Or9DCAZXyvgv43AgGobvOFyymrcq+4XmQ==";
    }
}