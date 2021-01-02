using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Admin
{
    public class VisitsModel : PageModel
    {
        private readonly ILogger<VisitsModel> _logger;

        private readonly Repository<Household> householdRepository;

        public Household[] Households { get; set; } = Array.Empty<Household>();

        public VisitsModel(ILogger<VisitsModel> logger, Repository<Household> householdRepository)
        {
            _logger = logger;
            this.householdRepository = householdRepository;
        }

        public async Task OnGet()
        {
            this.Households = await this.householdRepository.GetAllAsync();
        }
    }
}
