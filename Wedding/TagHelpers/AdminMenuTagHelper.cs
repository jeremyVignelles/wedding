using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Wedding.TagHelpers
{
    [HtmlTargetElement("admin-menu")]
    public class AdminMenuTagHelper : TagHelper
    {
        private MenuItem[] _menuItems = {
            new MenuItem { Id = "guests", Url = "/Admin", Text = "Invités" },
            new MenuItem { Id = "dinner", Url = "/Admin/Dinner", Text = "Dîner" },
            new MenuItem { Id = "tablemap", Url = "/Admin/TableMap", Text = "Plan de table" },
            new MenuItem { Id = "households", Url = "/Admin/Households", Text = "Foyers" },
            new MenuItem { Id = "visits", Url = "/Admin/Visits", Text = "Visites" },
        };

        public string ActivePage { get; set; } = "";

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = "nav";
            output.Attributes.SetAttribute("class", "admin-nav");
            output.Content.SetHtmlContent("<ul>");
            foreach(var menu in _menuItems)
            {
                if (menu.Id == this.ActivePage)
                {
                    output.Content.AppendHtml($"<li class=\"active\">{menu.Text}</li>");
                }
                else
                {
                    output.Content.AppendHtml($"<li><a href=\"{menu.Url}\">{menu.Text}</a></li>");
                }
            }
            output.Content.AppendHtml($"</ul>");
        }
    }

    public class MenuItem
    {
        public string Id {get;set;} = "";
        public string Url {get;set;} = "";
        public string Text {get;set;} = "";
    }
}