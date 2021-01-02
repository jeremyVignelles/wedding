using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Home
{
    public class RoadmapModel : PageModel
    {
        private readonly Repository<Household> householdRepository;

        public RoadmapModel(Repository<Household> householdRepository)
        {
            this.householdRepository = householdRepository;
        }
        public async Task OnGetAsync()
        {
            await householdRepository.SetVisitAsync(this.HttpContext, "Roadmap").ConfigureAwait(false);
        }
    }
}
