using System.Web.Script.Services;
using System.Web.Services;

[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[ScriptService]
public class WebService : System.Web.Services.WebService
{
    [WebMethod]
    public string SearchUser(string address)
    {
        return LuceneAction.SearchLucene(address)[0];
    }
}
