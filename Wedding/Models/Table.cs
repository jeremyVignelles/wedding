namespace Wedding.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// A table for the dinner
    /// </summary>
    public class Table : AbstractModel
    {
        /// <summary>
        /// The name of the table
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// The number of people that can theoretically fit in that table
        /// </summary>
        public int Capacity { get; set; }

        /// <summary>
        /// The X position on the map
        /// </summary>
        public int X { get; set; }

        /// <summary>
        /// The Y position on the map
        /// </summary>
        public int Y { get; set; }

        /// <summary>
        /// The table radius, in cm
        /// </summary>
        public int Radius { get; set; }

        /// <summary>
        /// The Angle of chair 0 on the map, in degrees
        /// </summary>
        public double Angle { get; set; }
    }
}