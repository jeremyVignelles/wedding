namespace Wedding.Models
{
    using System.ComponentModel.DataAnnotations;
    using System;

    /// <summary>
    /// A guest, that is invited to the wedding
    /// </summary>
    public class Guest : AbstractModel
    {
        /// <summary>
        /// The first name of the guest
        /// </summary>
        [Required]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// The last name of the person
        /// </summary>
        [Required]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// An info, useful for the wedding-planner, to know who is who.
        /// </summary>
        [Required]
        public string Comment { get; set; } = string.Empty;

        /// <summary>
        /// The household to which this guest belong
        /// </summary>
        public int HouseholdId { get; set; }

        /// <summary>
        /// The age of the guest
        /// </summary>
        public Age Age { get; set; }

        /// <summary>
        /// Info about allergies...
        /// </summary>
        public string FoodInstructions { get; set; } = string.Empty;

        /// <summary>
        /// For which event will the guest come
        /// </summary>
        public InvitationType? WillComeFor { get; set; }

        /// <summary>
        /// A boolean indicating whether this guest drinks
        /// </summary>
        public bool? Alcohol { get; set; }

        /// <summary>
        /// Where does this guest sleep? (Not used)
        /// </summary>
        public string? WhereDoYouSleep { get; set; }

        /// <summary>
        /// At which table do they eat?
        /// </summary>
        public int? TableId { get; set; }

        /// <summary>
        /// On which seat do they sit?
        /// </summary>
        public int? SeatNumber { get; set; }

        /// <summary>
        /// The team id for the wedding game
        /// </summary>
        public int? TeamId { get; set; }
    }
}