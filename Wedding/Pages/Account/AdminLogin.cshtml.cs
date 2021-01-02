using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Threading.Tasks;
using Wedding.Models;

namespace Wedding.Pages.Account
{
    public class AdminLoginModel : PageModel
    {
        private readonly IConfiguration configuration;
        public AdminLoginModel(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        [BindProperty]
        public string UserName { get; set; } = "";

        [BindProperty, DataType(DataType.Password)]
        public string Password { get; set; } = "";

        public string? Message { get; set; }

        public async Task<IActionResult> OnGet([FromQuery]string returnUrl) {
            var result = await this.HttpContext.AuthenticateAsync("AdminAuth");
            if (result?.Succeeded == true)
            {
                if (Url.IsLocalUrl(returnUrl))
                {
                    return Redirect(returnUrl);
                }
                else
                {
                    return RedirectToPage("/Admin/Index");
                }
            }
            return Page();
        }

        public async Task<IActionResult> OnPost([FromServices]IOptions<AdministratorOptions> admin, [FromQuery]string returnUrl)
        {
            if (UserName == admin.Value.User)
            {
                var passwordHasher = new PasswordHasher<string?>();
                if (passwordHasher.VerifyHashedPassword(null, admin.Value.Password, Password) == PasswordVerificationResult.Success)
                {
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, UserName)
                    };
                    var claimsIdentity = new ClaimsIdentity(claims, "AdminAuth");
                    await HttpContext.SignInAsync("AdminAuth", new ClaimsPrincipal(claimsIdentity));
                    if (Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }
                    else
                    {
                        return RedirectToPage("/Admin/Index");
                    }
                }
            }
            Message = "Invalid attempt";
            return Page();
        }
    }
}