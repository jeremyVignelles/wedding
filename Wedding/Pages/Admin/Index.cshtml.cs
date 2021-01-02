using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Admin
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly Repository<Guest> guestRepository;
        private readonly Repository<Household> householdRepository;

        public Guest[] Guests{ get; set; } = Array.Empty<Guest>();

        public Household[] Households { get; set; } = Array.Empty<Household>();

        public IndexModel(ILogger<IndexModel> logger, Repository<Guest> guestRepository, Repository<Household> householdRepository)
        {
            _logger = logger;
            this.guestRepository = guestRepository;
            this.householdRepository = householdRepository;
        }

        public async Task OnGet()
        {
            this.Guests = await this.guestRepository.GetAllAsync();
            this.Households = await this.householdRepository.GetAllAsync();
        }
    }
}
