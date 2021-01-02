namespace Wedding.Models
{
    /// <summary>
    /// The contact options
    /// </summary>
    public class ContactOptions {
        /// <summary>
        /// The e-mail of the groom
        /// </summary>
        public string GroomMail { get; set; } = "test-groom@test.org";

        /// <summary>
        /// The phone of the groom
        /// </summary>
        public string GroomPhone { get; set; } = "0600000002";

        /// <summary>
        /// The e-mail of the bride
        /// </summary>
        public string BrideMail { get; set; } = "test-bride@test.org";

        /// <summary>
        /// The phone of the bride
        /// </summary>
        public string BridePhone { get; set; } = "0600000001";

        /// <summary>
        /// The postal address
        /// </summary>
        public string PostalAddress { get; set; } = "Dans le placard sous l'escalier\\n42 Avenue du Monkey Test\\n01337 Hill Valley";
        // Note: \\n will be replaced with a new line (\n) in the above string.
        //It's just because the env file give it to us as-is, and we better be prepared in the testing env

        /// <summary>
        /// The wedding planner name
        /// </summary>
        public string WeddingPlanner { get; set; } = "Wedding Planner";

        /// <summary>
        /// The phone number to call if someone is lost
        /// </summary>
        public string NoPanickNumber { get; set; } = "Hotline - 0600000002";
    }
}