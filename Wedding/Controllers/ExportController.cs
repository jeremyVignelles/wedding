namespace Wedding.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Options;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using Wedding.Data;
    using Wedding.Models;

    /// <summary>
    /// The controller that provides guests instances
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize("AdminAuthPolicy")]
    public class ExportController : ControllerBase
    {
        /// <summary>
        /// Export the invitation card data of all households so that they are imported in Adobe Illustrator
        /// </summary>
        [HttpGet("Invitations.xml")]
        [Produces("text/xml")]
        public async Task<ActionResult> ExportInvitations([FromServices]Repository<Guest> guestRepository, [FromServices]Repository<Household> householdRepository, [FromServices]IOptions<ContactOptions> contact)
        {
            var allHouseholds = await householdRepository.GetAllAsync();
            var allGuests = await guestRepository.GetAllAsync();
            var groupedGuests = allGuests.GroupBy(g => g.HouseholdId).ToDictionary(g => g.Key, g => g.Count());

            var variables = new (string category, string trait, string name)[] {
                ("http://ns.adobe.com/Variables/1.0/", "visibility", "allAccess"),
                ("http://ns.adobe.com/Variables/1.0/", "visibility", "cocktailInvitations"),
                ("http://ns.adobe.com/Flows/1.0/", "textcontent", "l1"),
                ("http://ns.adobe.com/Flows/1.0/", "textcontent", "l2"),
                ("http://ns.adobe.com/Flows/1.0/", "textcontent", "n1"),
                ("http://ns.adobe.com/Flows/1.0/", "textcontent", "n2"),
                ("http://ns.adobe.com/Flows/1.0/", "textcontent", "reference"),
                ("http://ns.adobe.com/Flows/1.0/", "textcontent", "invitationGreeting"),
            };

            var builder = new StringBuilder(@"<?xml version=""1.0"" encoding=""utf-8""?>
<!DOCTYPE svg PUBLIC ""-//W3C//DTD SVG 20001102//EN""    ""http://www.w3.org/TR/2000/CR-SVG-20001102/DTD/svg-20001102.dtd"" [
	<!ENTITY ns_graphs ""http://ns.adobe.com/Graphs/1.0/"">
	<!ENTITY ns_vars ""http://ns.adobe.com/Variables/1.0/"">
	<!ENTITY ns_imrep ""http://ns.adobe.com/ImageReplacement/1.0/"">
	<!ENTITY ns_custom ""http://ns.adobe.com/GenericCustomNamespace/1.0/"">
	<!ENTITY ns_flows ""http://ns.adobe.com/Flows/1.0/"">
<!ENTITY ns_extend ""http://ns.adobe.com/Extensibility/1.0/"">
]>
<svg>
<variableSets  xmlns=""&ns_vars;"">
	<variableSet  locked=""none"" varSetName=""binding1"">
		<variables>");
            foreach(var v in variables)
            {
                builder.AppendLine($"<variable category=\"{v.category}\" trait=\"{v.trait}\" varName=\"{v.name}\"></variable>");
            }
            builder.AppendLine("</variables>");
            builder.AppendLine("<v:sampleDataSets xmlns=\"http://ns.adobe.com/GenericCustomNamespace/1.0/\" xmlns:v=\"http://ns.adobe.com/Variables/1.0/\">");

            // Special case: we have an invite for our wedding planner, with no address
            foreach(var h in allHouseholds.Prepend(new Household { Name = contact.Value.WeddingPlanner, Id = 0, InvitedFor = InvitationType.All}))
            {
                builder.Append($"<v:sampleDataSet dataSetName=\"{h.Name}\">");
                if(h.InvitedFor.HasFlag(InvitationType.All))
                {
                    builder.Append("<cocktailInvitations>false</cocktailInvitations><allAccess>true</allAccess>");
                }
                else if(h.InvitedFor.HasFlag(InvitationType.CocktailPackage))
                {
                    builder.Append("<cocktailInvitations>true</cocktailInvitations><allAccess>false</allAccess>");
                }
                else
                {
                    this.ModelState.AddModelError(h.Name, "The household has an unsupported invitation type : " + h.InvitedFor);
                }
                var password = string.Join("", h.Name.Split(' ', 2).Select(split => char.ToUpper(split[0]))) + h.Id.ToString().PadLeft(2, '0');
                builder.Append($"<l1><p>{password[0]}</p></l1>");
                builder.Append($"<l2><p>{password[1]}</p></l2>");
                builder.Append($"<n1><p>{password[2]}</p></n1>");
                builder.Append($"<n2><p>{password[3]}</p></n2>");

                builder.Append($"<reference><p>{password} - {h.Name}</p></reference>");
                if(!groupedGuests.TryGetValue(h.Id, out var nbGuests)) {// Wedding planner isn't found
                    nbGuests = 1;
                }
                builder.Append($"<invitationGreeting><p>Ce bon, pour {nbGuests} personne{((nbGuests > 1) ? "s" : "")} donne accès :</p></invitationGreeting>");
                builder.AppendLine($"</v:sampleDataSet>");
            }

            if(!this.ModelState.IsValid)
            {
                return this.ValidationProblem();
            }
            builder.AppendLine("</v:sampleDataSets></variableSet></variableSets></svg>");
            return this.Content(builder.ToString(), "text/xml");
        }

        /// <summary>
        /// Export the postal address of all households so that they are imported in Adobe Illustrator
        /// </summary>
        [HttpGet("Mailing.xml")]
        [Produces("text/xml")]
        public async Task<ActionResult> ExportMailing([FromServices]Repository<Household> householdRepository, [FromServices]IOptions<ContactOptions> contact)
        {
            var allHouseholds = await householdRepository.GetAllAsync();

            var variables = new (string category, string trait, string name)[] {
                ("http://ns.adobe.com/Flows/1.0/", "textcontent", "Address"),
                ("http://ns.adobe.com/Variables/1.0/", "fileref", "Stamp"),
            };

            var absolutePathPrefix = "file:///d:/mariage/timbres/";

            var builder = new StringBuilder(@"<?xml version=""1.0"" encoding=""utf-8""?>
<!DOCTYPE svg PUBLIC ""-//W3C//DTD SVG 20001102//EN""    ""http://www.w3.org/TR/2000/CR-SVG-20001102/DTD/svg-20001102.dtd"" [
	<!ENTITY ns_graphs ""http://ns.adobe.com/Graphs/1.0/"">
	<!ENTITY ns_vars ""http://ns.adobe.com/Variables/1.0/"">
	<!ENTITY ns_imrep ""http://ns.adobe.com/ImageReplacement/1.0/"">
	<!ENTITY ns_custom ""http://ns.adobe.com/GenericCustomNamespace/1.0/"">
	<!ENTITY ns_flows ""http://ns.adobe.com/Flows/1.0/"">
<!ENTITY ns_extend ""http://ns.adobe.com/Extensibility/1.0/"">
]>
<svg>
<variableSets  xmlns=""&ns_vars;"">
	<variableSet  locked=""none"" varSetName=""binding1"">
		<variables>");
            foreach(var v in variables)
            {
                builder.AppendLine($"<variable category=\"{v.category}\" trait=\"{v.trait}\" varName=\"{v.name}\"></variable>");
            }
            builder.AppendLine("</variables>");
            builder.AppendLine("<v:sampleDataSets xmlns=\"http://ns.adobe.com/GenericCustomNamespace/1.0/\" xmlns:v=\"http://ns.adobe.com/Variables/1.0/\">");
            var stamp = 1;
            // Special case: we have an invite for our wedding planner, with no address
            foreach(var h in allHouseholds.Prepend(new Household { Name = contact.Value.WeddingPlanner, PostalAddress = ""}))
            {
                builder.Append($"<v:sampleDataSet dataSetName=\"{h.Name}\">");
                if(h.PostalAddress == "")
                {
                    builder.Append($"<Address><p>{h.Name}</p></Address>");
                    builder.Append($"<Stamp>{absolutePathPrefix  + "0_PDFsam_vosTimbres.pdf"}</Stamp>");
                }
                else 
                {
                    builder.Append($"<Address><p>{h.PostalAddress.Replace("\n", "<br />")}</p></Address>");
                    builder.Append($"<Stamp>{absolutePathPrefix  + stamp + "_PDFsam_vosTimbres.pdf"}</Stamp>");
                    stamp++;
                }
                builder.AppendLine($"</v:sampleDataSet>");
            }

            if(!this.ModelState.IsValid)
            {
                return this.ValidationProblem();
            }
            builder.AppendLine("</v:sampleDataSets></variableSet></variableSets></svg>");
            return this.Content(builder.ToString(), "text/xml");
        }

        public const string TsvSeparator = "\t";
        /// <summary>
        /// Export all HouseHolds and guets stats
        /// </summary>
        [HttpGet("Export.tsv")]
        [Produces("application/tsv")]
        public async Task<ActionResult> ExportTsv([FromServices]Repository<Guest> guestRepository, [FromServices]Repository<Household> householdRepository)
        {
            var allHouseholds = await householdRepository.GetAllAsync();
            //récupérer la liste des invités
            var allGuests = await guestRepository.GetAllAsync();
            //grouper les guests par households id
            var groupedGuests = allGuests.GroupBy(g => g.HouseholdId);
            var groupingResults = groupedGuests.Select(gr => {
                var h = allHouseholds.First(h => h.Id == gr.Key);
                return new{
                    Name = h.Name,
                    InvitedBy = h.InvitedBy,
                    InvitedFor = h.InvitedFor,
                    U2 = gr.Count(g => g.Age == Age.U2),
                    U6 = gr.Count(g => g.Age == Age.U6),
                    U10 = gr.Count(g => g.Age == Age.U10),
                    U16 = gr.Count(g => g.Age == Age.U16),
                    Adult = gr.Count(g => g.Age == Age.Adult)
                }; 
            });

            var stringBuilder = new StringBuilder();

            foreach(var r in groupingResults)
            {
                stringBuilder.Append((r.InvitedBy != InvitedBy.Groom) ? "X" : "");
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append((r.InvitedBy != InvitedBy.Bride) ? "X" : "");
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.Name);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.Adult);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.U2);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.U6);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.U10);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.U16); 
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.InvitedFor.HasFlag(InvitationType.TownHall) ? "X" : "");
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.InvitedFor.HasFlag(InvitationType.Cocktail) ? "X" : "");
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.InvitedFor.HasFlag(InvitationType.Dinner) ? "X" : "");
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(r.InvitedFor.HasFlag(InvitationType.Brunch) ? "X" : "");
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append("\n");
            }

            return this.Content(stringBuilder.ToString(), "application/tsv");
        }

        /// <summary>
        /// Exports everyone that comes for the diner
        /// </summary>
        [HttpGet("Cocktail_and_Dinner.tsv")]
        [Produces("application/tsv")]
        public async Task<ActionResult> ExportCocktailAndDinnerTsv([FromServices]Repository<Guest> guestRepository, [FromServices]Repository<Household> householdRepository)
        {
            var allHouseholds = (await householdRepository.GetAllAsync()).ToDictionary(h => h.Id);
            //récupérer la liste des invités
            var allGuests = (await guestRepository.GetAllAsync()).Where(g => g.WillComeFor == null || g.WillComeFor.Value.HasFlag(InvitationType.Cocktail) || g.WillComeFor.Value.HasFlag(InvitationType.Dinner));
            var ageTranslation = new[] {"0-2 ans", "3-6 ans", "7-10 ans", "11-16 ans", "Adulte"};
            var stringBuilder = new StringBuilder();
            stringBuilder.Append('\uFEFF');//BOM
            stringBuilder.Append($"Prénom{TsvSeparator}Nom{TsvSeparator}Age{TsvSeparator}Cocktail{TsvSeparator}Diner{TsvSeparator}Place{TsvSeparator}Alcool{TsvSeparator}Préférences alimentaires\n");

            foreach(var g in allGuests)
            {
                var invitedFor = allHouseholds[g.HouseholdId].InvitedFor;
                stringBuilder.Append(g.FirstName);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(g.LastName);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(ageTranslation[(int)g.Age]);
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(g.WillComeFor == null ? "?" : g.WillComeFor.Value.HasFlag(InvitationType.Cocktail)? "oui" : "non");
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(invitedFor.HasFlag(InvitationType.Dinner)? (g.WillComeFor == null ? "?" : g.WillComeFor.Value.HasFlag(InvitationType.Dinner)? "oui" : "non") : "");
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(invitedFor.HasFlag(InvitationType.Dinner)? "" : "");// TODO : placement de table
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append((g.Alcohol.HasValue) ? ((g.Alcohol == true) ? "oui" : "non") : "?");
                stringBuilder.Append(TsvSeparator);
                stringBuilder.Append(g.FoodInstructions?.Replace('\r', ' ')?.Replace('\n', ' ')?.Replace('\t', ' '));
                stringBuilder.Append("\n");
            }

            return this.Content(stringBuilder.ToString(), "application/tsv", Encoding.UTF8);
        }
    }
}
