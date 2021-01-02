namespace Wedding.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System;
    using System.Threading.Tasks;
    using Wedding.Data;
    using Wedding.Models;

    /// <summary>
    /// The controller that provides tables instances
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize("AdminAuthPolicy")]
    public class TableController : ControllerBase
    {
        private readonly Repository<Table> _repository;

        public TableController(Repository<Table> repository)
        {
            this._repository = repository;
        }

        /// <summary>
        /// Gets all Tables
        /// </summary>
        [HttpGet]
        public Task<Table[]> Get()
        {
            return this._repository.GetAllAsync();
        }

        /// <summary>
        /// Gets a Table by its id
        /// </summary>
        /// <param name="id">The table id</param>
        [HttpGet("{id}")]
        public async ValueTask<ActionResult<Table>> Get(int id)
        {
            var result = await this._repository.GetByIdAsync(id).ConfigureAwait(false);
            if (result is null)
            {
                return this.NotFound();
            }

            return result;
        }

        /// <summary>
        /// Adds or update a table
        /// </summary>
        /// <param name="value">The Table to add or update</param>
        [HttpPost]
        public async Task AddOrUpdate([FromBody] Table value)
        {
            await this._repository.AddOrUpdateAsync(value).ConfigureAwait(false);
        }

        /// <summary>
        /// Deletes a table
        /// </summary>
        /// <param name="id">The table identifier</param>
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await this._repository.RemoveAsync(id).ConfigureAwait(false);
        }
    }
}
