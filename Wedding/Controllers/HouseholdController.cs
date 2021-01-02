namespace Wedding.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System;
    using System.Threading.Tasks;
    using Wedding.Data;
    using Wedding.Models;

    /// <summary>
    /// The controller that provides household instances
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize("AdminAuthPolicy")]
    public class HouseholdController : ControllerBase
    {
        private readonly Repository<Household> _repository;

        public HouseholdController(Repository<Household> repository)
        {
            this._repository = repository;
        }

        /// <summary>
        /// Gets all Households
        /// </summary>
        [HttpGet]
        public Task<Household[]> Get()
        {
            return this._repository.GetAllAsync();
        }

        /// <summary>
        /// Gets a household by its id
        /// </summary>
        /// <param name="id">The guest id</param>
        [HttpGet("{id}")]
        public async ValueTask<ActionResult<Household>> Get(int id)
        {
            var result = await this._repository.GetByIdAsync(id).ConfigureAwait(false);
            if (result is null)
            {
                return this.NotFound();
            }

            return result;
        }

        /// <summary>
        /// Adds or update a household
        /// </summary>
        /// <param name="value">The household to add or update</param>
        [HttpPost]
        public async Task AddOrUpdate([FromBody] Household value)
        {
            await this._repository.AddOrUpdateAsync(value).ConfigureAwait(false);
        }

        /// <summary>
        /// Deletes a household
        /// </summary>
        /// <param name="id">The household identifier</param>
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await this._repository.RemoveAsync(id).ConfigureAwait(false);
        }
    }
}
