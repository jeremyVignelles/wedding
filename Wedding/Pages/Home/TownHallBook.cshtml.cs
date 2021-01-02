using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Home
{
    public class TownHallBookModel : PageModel
    {
        private readonly Repository<Household> householdRepository;

        public TownHallBookModel(Repository<Household> householdRepository)
        {
            this.householdRepository = householdRepository;
        }
        public async Task OnGetAsync()
        {
            await householdRepository.SetVisitAsync(this.HttpContext, "TownHallBook").ConfigureAwait(false);
        }
    }
}
