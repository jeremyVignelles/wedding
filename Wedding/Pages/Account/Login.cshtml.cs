using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Wedding.Data;
using Wedding.Models;

namespace Wedding.Pages.Account
{
    public class LoginModel : PageModel
    {
        [BindProperty]
        public string Code1 { get; set; } = "";
        [BindProperty]
        public string Code2 { get; set; } = "";
        [BindProperty]
        public string Code3 { get; set; } = "";
        [BindProperty]
        public string Code4 { get; set; } = "";

        public string? Message { get; set; }

        public async Task<IActionResult> OnGet([FromQuery]string returnUrl) {
            var result = await this.HttpContext.AuthenticateAsync("GuestAuth");
            if (result?.Succeeded == true)
            {
                if (Url.IsLocalUrl(returnUrl))
                {
                    return Redirect(returnUrl);
                }
                else
                {
                    return RedirectToPage("/Home/Index");
                }
            }
            return Page();
        }

        public async Task<IActionResult> OnPost([FromServices]Repository<Household> householdRepository, [FromQuery]string returnUrl)
        {
            var login = this.Code1 + this.Code2 + this.Code3 + this.Code4;
            var match = new Regex(@"^([A-Z]{2})(\d{2})$").Match(login.ToUpper());
            if (match.Success)
            {
                var household = await householdRepository.GetByIdAsync(int.Parse(match.Groups[2].Value));
                if(household != null)
                {
                    var passKey = string.Join("", household.Name.Split(' ', 2).Select(split => char.ToUpper(split[0])));
                    if(match.Groups[1].Value == passKey)
                    {
                        var claims = new List<Claim>
                        {
                            new Claim(ClaimTypes.NameIdentifier, household.Id.ToString()),
                            new Claim(ClaimTypes.Name, household.Name)
                        };
                        var claimsIdentity = new ClaimsIdentity(claims, "GuestAuth");
                        await HttpContext.SignInAsync("GuestAuth", new ClaimsPrincipal(claimsIdentity));
                        if (Url.IsLocalUrl(returnUrl))
                        {
                            return Redirect(returnUrl);
                        }
                        else
                        {
                            return RedirectToPage("/Home/Index");
                        }
                    }
                }
            }
            Message = "Login incorrect";
            return Page();
        }
    }
}