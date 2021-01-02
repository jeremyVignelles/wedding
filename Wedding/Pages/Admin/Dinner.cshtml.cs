using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Admin
{
    public class DinnerModel : PageModel
    {
        private readonly ILogger<DinnerModel> _logger;
        private readonly Repository<Guest> guestRepository;
        private readonly Repository<Household> householdRepository;

        public Guest[] Guests{ get; set; } = Array.Empty<Guest>();

        public DinnerModel(ILogger<DinnerModel> logger, Repository<Guest> guestRepository, Repository<Household> householdRepository)
        {
            _logger = logger;
            this.guestRepository = guestRepository;
            this.householdRepository = householdRepository;
        }

        public async Task OnGet()
        {
            var households = (await this.householdRepository.GetAllAsync()).ToDictionary(h => h.Id);
            this.Guests = (await this.guestRepository.GetAllAsync())
                .Where(g => (g.WillComeFor.HasValue && g.WillComeFor.Value.HasFlag(InvitationType.Dinner))
                    || (!g.WillComeFor.HasValue && households[g.HouseholdId].InvitedFor.HasFlag(InvitationType.Dinner)))
                .ToArray();
        }
    }
}
