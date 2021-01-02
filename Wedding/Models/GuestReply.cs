namespace Wedding.Models
{
    using System.ComponentModel.DataAnnotations;
    using System;

    /// <summary>
    /// A reply from a guest
    /// </summary>
    public class GuestReply : AbstractModel
    {
        /// <summary>
        /// The first name of the guest
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// The last name of the person
        /// </summary>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// For which event will the guest come for town hall
        /// </summary>
        public bool TownHall { get; set; } = true;
        
        /// <summary>
        /// For which event will the guest come for cocktail
        /// </summary>
        public bool Cocktail { get; set; } = true;

        /// <summary>
        /// For which event will the guest come for dinner
        /// </summary>
        public bool Dinner { get; set; } = true;

        /// <summary>
        /// For which event will the guest come for brunch
        /// </summary>
        public bool Brunch { get; set; } = true;

        /// <summary>
        /// A boolean indicating whether this guest drinks
        /// </summary>
        public bool Alcohol { get; set; }

        /// <summary>
        /// Info about allergies...
        /// </summary>
        public string FoodInstructions { get; set; } = string.Empty;
    }
}