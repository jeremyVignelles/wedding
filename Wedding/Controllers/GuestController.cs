namespace Wedding.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System;
    using System.Threading.Tasks;
    using Wedding.Data;
    using Wedding.Models;

    /// <summary>
    /// The controller that provides guests instances
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize("AdminAuthPolicy")]
    public class GuestController : ControllerBase
    {
        private readonly Repository<Guest> _repository;

        public GuestController(Repository<Guest> repository)
        {
            this._repository = repository;
        }

        /// <summary>
        /// Gets all Guests
        /// </summary>
        [HttpGet]
        public Task<Guest[]> Get()
        {
            return this._repository.GetAllAsync();
        }

        /// <summary>
        /// Gets a guest by its id
        /// </summary>
        /// <param name="id">The guest id</param>
        [HttpGet("{id}")]
        public async ValueTask<ActionResult<Guest>> Get(int id)
        {
            var result = await this._repository.GetByIdAsync(id).ConfigureAwait(false);
            if (result is null)
            {
                return this.NotFound();
            }

            return result;
        }

        /// <summary>
        /// Adds or update a guest
        /// </summary>
        /// <param name="value">The guest to add or update</param>
        [HttpPost]
        public async Task AddOrUpdate([FromBody] Guest value)
        {
            await this._repository.AddOrUpdateAsync(value).ConfigureAwait(false);
        }

        /// <summary>
        /// Deletes a guest
        /// </summary>
        /// <param name="id">The guest identifier</param>
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await this._repository.RemoveAsync(id).ConfigureAwait(false);
        }
    }
}
