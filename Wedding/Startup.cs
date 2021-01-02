using System;
using System.Linq;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Wedding.Data;
using Wedding.Data.Upgraders;
using Wedding.Extensions;
using Wedding.Models;

namespace Wedding
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddRazorPages(options => {
                options.Conventions.AddPageRoute("/Home/Index", "/");
                options.Conventions.AuthorizeFolder("/Admin", "AdminAuthPolicy");
                options.Conventions.AuthorizeFolder("/Home", "GuestAuthPolicy");
            });
            services.Configure<ForwardedHeadersOptions>(options => options.ForwardedHeaders = ForwardedHeaders.All);
            services.AddHealthChecks();
            services.Configure<DataFolderOptions>(this.Configuration);
            services.Configure<AdministratorOptions>(this.Configuration.GetSection("Admin"));
            services.Configure<ContactOptions>(this.Configuration.GetSection("Contact"))
                .PostConfigureAll<ContactOptions>(contactOptions => {
                    contactOptions.PostalAddress = contactOptions.PostalAddress.Replace("\\n", "\n");
                });

            services.AddOpenApiDocument(options =>
            {
                options.DocumentName = "Wedding API";
            });

            services.AddAuthentication()
                        .AddCookie("AdminAuth", options => {
                            options.LoginPath = "/Account/AdminLogin";
                            options.Cookie.Name = "AdminAuth";
                        })
                        .AddCookie("GuestAuth", options => {
                            options.LoginPath = "/Account/Login";
                            options.Cookie.Name = "GuestAuth";
                        });
            services.AddAuthorization(options => {
                options.AddPolicy("AdminAuthPolicy", policy => {
                    policy.AuthenticationSchemes.Add("AdminAuth");
                    policy.RequireAuthenticatedUser();
                });
                options.AddPolicy("GuestAuthPolicy", policy => {
                    policy.AuthenticationSchemes.Add("GuestAuth");
                    policy.RequireAuthenticatedUser();
                });
            });

            // Data
            services.AddRepository<Guest, DefaultUpgrader<Guest>>();
            services.AddRepository<Household, DefaultUpgrader<Household>>();
            services.AddRepository<Table, DefaultUpgrader<Table>>();   
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders();
            // Fix forwarded headers not taken into account, don't know why...
            app.Use(async (context, next) => {
                var opt = context.RequestServices.GetRequiredService<IOptions<ForwardedHeadersOptions>>();
                if(context.Request.Headers.TryGetValue(opt.Value.ForwardedProtoHeaderName, out var values) && values[0] == "https")
                {
                    context.Request.Scheme = "https";
                }
                await next();
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.Headers.Append("Cache-Control", "private,max-age=1800");
                }
            });

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHealthChecks("/health");
                endpoints.MapRazorPages();
            });
            
            app.Use(async (context, next) => {
                if (
                    context.Request.Path.HasValue
                    && context.Request.Path.Value.StartsWith("/swagger", StringComparison.InvariantCultureIgnoreCase))
                {
                    var result = await context.AuthenticateAsync("AdminAuth");
                    if (result?.Succeeded != true)
                    {
                        await context.ChallengeAsync("AdminAuth");
                        return;
                    }
                }
                
                await next();
            });
            app.UseOpenApi().UseSwaggerUi3();
        }
    }
}
