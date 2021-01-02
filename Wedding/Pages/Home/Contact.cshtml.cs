using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Home
{
    public class ContactModel : PageModel
    {
        private readonly Repository<Household> householdRepository;

        public ContactOptions Contact { get; set; }

        public ContactModel(IOptions<ContactOptions> options, Repository<Household> householdRepository)
        {
            this.Contact = options.Value;
            this.householdRepository = householdRepository;
        }

        public async Task OnGetAsync()
        {
            await householdRepository.SetVisitAsync(this.HttpContext, "Contact").ConfigureAwait(false);
        }
    }
}
