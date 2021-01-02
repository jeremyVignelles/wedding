namespace Wedding.Models
{
    using System;

    /// <summary>
    /// To which event will the guest come/ is invited?
    /// </summary>
    [Flags]
    public enum InvitationType
    {
        NotInvited = 0,
        
        TownHall = 1,

        //WelcomeDrink = 2,

        Cocktail = 4,

        CocktailPackage = TownHall | Cocktail,

        Dinner = 8,

        AllDay1 = TownHall | Cocktail | Dinner,

        Brunch = 16,

        All = AllDay1 | Brunch
    }
}