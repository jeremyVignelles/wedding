namespace Wedding.Data
{
    using System;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Http;
    using Wedding.Models;

    /// <summary>
    /// The extension methods for the <see cref="Repository{T}" /> class
    /// </summary>
    public static class RepositoryExtensions
    {
        /// <summary>
        /// Gets all guests within the same given household
        /// </summary>
        public static async Task<Guest[]> GetByHouseholdIdAsync(this Repository<Guest> repository, int householdId)
        {
            var allGuests = await repository.GetAllAsync();
            return allGuests.Where(g => g.HouseholdId == householdId).ToArray();
        }

        /// <summary>
        /// Writes a visit in the database
        /// </summary>
        public static async Task SetVisitAsync(this Repository<Household> repository, HttpContext context, string page)
        {
            await Task.CompletedTask; // Disabled writing for public access
            /*
            var c = context.User?.FindFirst(c => c.Type == ClaimTypes.NameIdentifier);
            if(c != null && int.TryParse(c.Value, out var id))
            {
                var h = await repository.GetByIdAsync(id).ConfigureAwait(false);
                if(h != null)
                {
                    h.LastPageVisit[page] = DateTime.Now;
                    await repository.AddOrUpdateAsync(h).ConfigureAwait(false);
                }
            }
            */
        }
    }
}