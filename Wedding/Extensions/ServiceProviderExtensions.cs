namespace Wedding.Extensions
{
    using Microsoft.Extensions.DependencyInjection;
    using Wedding.Data;
    using Wedding.Models;

    /// <summary>
    /// The class that contains extensions for <see cref="IServiceCollection"/>
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Adds the repository for TModel inside the service provider
        /// </summary>
        /// <typeparam name="TModel">The type of model in the repository</typeparam>
        /// <typeparam name="TUpgrader">The upgrader</typeparam>
        public static IServiceCollection AddRepository<TModel, TUpgrader>(this IServiceCollection serviceCollection) where TUpgrader: class,IRepositoryUpgrader<TModel> where TModel: AbstractModel
        {
            return serviceCollection.AddTransient<IRepositoryUpgrader<TModel>, TUpgrader>()
                .AddSingleton<Repository<TModel>>()
                .AddHostedService(sp => sp.GetRequiredService<Repository<TModel>>());
        }
    }
}