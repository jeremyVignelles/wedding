using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Home
{
    public class KonamiModel : PageModel
    {
        private readonly Repository<Household> householdRepository;

        public KonamiModel(Repository<Household> householdRepository)
        {
            this.householdRepository = householdRepository;
        }
        public async Task OnGetAsync()
        {
            await householdRepository.SetVisitAsync(this.HttpContext, "Konami").ConfigureAwait(false);
        }
    }
}
