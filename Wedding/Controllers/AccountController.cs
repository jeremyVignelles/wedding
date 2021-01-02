namespace Wedding.Controllers
{
    using Microsoft.AspNetCore.Authentication;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using System;
    using System.Threading.Tasks;
    using Wedding.Data;
    using Wedding.Models;

    /// <summary>
    /// The controller that manages authentication
    /// </summary>
    [Route("/Account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        /// <summary>
        /// Logs a guest out
        /// </summary>
        [HttpGet("Logout")]
        public async Task<RedirectResult> LogoutAsync()
        {
            await this.HttpContext.SignOutAsync("GuestAuth");
            return this.Redirect("/");
        }
    }
}
