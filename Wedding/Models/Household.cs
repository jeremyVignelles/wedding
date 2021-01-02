namespace Wedding.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Represents a household, to which invites will be sent
    /// </summary>
    public class Household : AbstractModel
    {
        /// <summary>
        /// A friendly name used to identify the household
        /// </summary>
        [Required]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// The postal address of the household. Multiple lines are separated by \n
        /// </summary>
        public string PostalAddress { get; set; } = string.Empty;

        /// <summary>
        /// Who invited the guest?
        /// </summary>
        public InvitedBy InvitedBy { get; set; } = InvitedBy.Bride;

        /// <summary>
        /// For which event is the guest invited
        /// </summary>
        public InvitationType InvitedFor { get; set; }

        /// <summary>
        /// The dates of last visit for each page
        /// </summary>
        public Dictionary<string, DateTime> LastPageVisit {get;set;} = new Dictionary<string, DateTime>();
    }
}