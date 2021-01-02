using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Home
{
    public class InscriptionModel : PageModel
    {
        private readonly ILogger<InscriptionModel> _logger;

        [BindProperty]
        public GuestReply[] Reply { get; set; } = Array.Empty<GuestReply>();

        public bool ReplySent { get; set; }

        public Household Household {get;set;} = new Household();

        
        private readonly Repository<Guest> guestRepository;

        private readonly Repository<Household> householdRepository;

        public InscriptionModel(ILogger<InscriptionModel> logger, Repository<Guest> guestRepository, Repository<Household> householdRepository)
        {
            _logger = logger;
            this.guestRepository = guestRepository;
            this.householdRepository = householdRepository;
        }

        public async Task<ActionResult> OnGetAsync()
        {
            var householdClaim = this.User.FindFirst(c => c.Type == ClaimTypes.NameIdentifier);
            var householdId = int.Parse(householdClaim.Value);
            var h = (await this.householdRepository.GetByIdAsync(householdId));
            if(h is null)
            {
                return this.BadRequest();
            }
            h.LastPageVisit["Inscription"] = DateTime.Now;
            await this.householdRepository.AddOrUpdateAsync(h).ConfigureAwait(false);
            this.Household = h;
            var guests = await this.guestRepository.GetByHouseholdIdAsync(householdId);
            this.Reply = guests.Select(g => new GuestReply {
                Id = g.Id,
                FirstName = g.FirstName,
                LastName = g.LastName,
                TownHall = (g.WillComeFor.HasValue)?g.WillComeFor.Value.HasFlag(InvitationType.TownHall):true,
                Cocktail = (g.WillComeFor.HasValue)?g.WillComeFor.Value.HasFlag(InvitationType.Cocktail):true,
                Dinner = (g.WillComeFor.HasValue)?g.WillComeFor.Value.HasFlag(InvitationType.Dinner):true,
                Brunch = (g.WillComeFor.HasValue)?g.WillComeFor.Value.HasFlag(InvitationType.Brunch):true,
                Alcohol = g.Alcohol ?? false,
                FoodInstructions = g.FoodInstructions
            }).ToArray();

            this.ReplySent = guests.All(g => g.WillComeFor.HasValue);
            return this.Page();
        }

        public async Task<ActionResult> OnPostAsync()
        {
            await Task.CompletedTask;// Disabled writing for public access
            /*
            var householdClaim = this.User.FindFirst(c => c.Type == ClaimTypes.NameIdentifier);
            var householdId = int.Parse(householdClaim.Value);
            var h = (await this.householdRepository.GetByIdAsync(householdId));
            if(h is null)
            {
                return this.BadRequest();
            }
            this.Household = h;
            var guests = await this.guestRepository.GetByHouseholdIdAsync(householdId);

            if(!guests.Select(g => g.Id).SequenceEqual(this.Reply.Select(r => r.Id)))
            {
                return this.BadRequest("You modified the reply in a bad way, little hacker");
            }

            for(int i = 0; i < guests.Length;i++)
            {
                guests[i].Alcohol = this.Reply[i].Alcohol;
                var willComeFor = InvitationType.NotInvited;
                if(this.Reply[i].TownHall)
                {
                    willComeFor |= InvitationType.TownHall;
                }
                if(this.Reply[i].Cocktail)
                {
                    willComeFor |= InvitationType.Cocktail;
                }
                if(this.Reply[i].Dinner)
                {
                    willComeFor |= InvitationType.Dinner;
                }
                if(this.Reply[i].Brunch)
                {
                    willComeFor |= InvitationType.Brunch;
                }
                guests[i].WillComeFor = willComeFor & Household.InvitedFor;
                guests[i].FoodInstructions = this.Reply[i].FoodInstructions;

                await guestRepository.AddOrUpdateAsync(guests[i]);
            }

            this.ReplySent = guests.All(g => g.WillComeFor.HasValue);*/
            return this.Page();
        }
    }
}
