using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Admin
{
    public class TableMapModel : PageModel
    {
        private readonly ILogger<TableMapModel> _logger;
        private readonly Repository<Guest> guestRepository;
        private readonly Repository<Table> tableRepository;
        private readonly Repository<Household> householdRepository;

        public Guest[] Guests { get; set; } = Array.Empty<Guest>();

        public Table[] Tables { get; set; } = Array.Empty<Table>();

        public TableMapModel(ILogger<TableMapModel> logger, Repository<Guest> guestRepository, Repository<Table> tableRepository, Repository<Household> householdRepository)
        {
            _logger = logger;
            this.guestRepository = guestRepository;
            this.tableRepository = tableRepository;
            this.householdRepository = householdRepository;
        }

        public async Task OnGet()
        {
            var households = (await this.householdRepository.GetAllAsync()).ToDictionary(h => h.Id);

            this.Guests = (await this.guestRepository.GetAllAsync())
                .Where(g => (g.WillComeFor.HasValue && g.WillComeFor.Value.HasFlag(InvitationType.Dinner))
                    || (!g.WillComeFor.HasValue && households[g.HouseholdId].InvitedFor.HasFlag(InvitationType.Dinner)))
                .OrderBy(g => g.HouseholdId)
                .ToArray();

            this.Tables = await this.tableRepository.GetAllAsync();
        }

        public async Task OnPost()
        {
            // Disabled writing for public access
            /*
            var form = this.HttpContext.Request.Form;
            for(int i = 0; i < form["guest-id[]"].Count; i++)
            {
                if(!int.TryParse(form["guest-id[]"][i], out var guestId))
                {
                    continue;
                }

                var guest = await this.guestRepository.GetByIdAsync(guestId);
                if(guest is null)
                {
                    continue;
                }

                // The checks are very light, because it's only the admin part, only used by us, and we are limited on time

                if(form["table-select[]"][i] == "null" || form["seat-select[]"][i] == "null")
                {
                    guest.TableId = null;
                    guest.SeatNumber = null;
                }
                else
                {
                    guest.TableId = int.Parse(form["table-select[]"][i]);
                    guest.SeatNumber = int.Parse(form["seat-select[]"][i]);
                }

                await this.guestRepository.AddOrUpdateAsync(guest);
            }*/
            await this.OnGet();
        }
    }
}
