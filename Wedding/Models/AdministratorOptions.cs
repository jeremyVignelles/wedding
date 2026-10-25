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
        public string Password { get; set; } = "AQAAAAIAAYagAAAAEC7FBMERp0anvoQw1f+KH7kUAPmvCEwADrFKXVALp8PKVnX2oPu+nB1No1yRfH9yHA==";
    }
}