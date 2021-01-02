using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Home
{
    public class Roadmap2Model : PageModel
    {
        private readonly Repository<Household> householdRepository;

        /// <summary>
        /// The phone number to call if someone is lost
        /// </summary>
        public string NoPanickNumber { get; set; }

        public Roadmap2Model(IOptions<ContactOptions> contactOptions, Repository<Household> householdRepository)
        {
            this.NoPanickNumber = contactOptions.Value.NoPanickNumber;
            this.householdRepository = householdRepository;
        }
        public async Task OnGetAsync()
        {
            await householdRepository.SetVisitAsync(this.HttpContext, "Roadmap2").ConfigureAwait(false);
        }
    }
}
