using Microsoft.AspNet.Builder;
using Microsoft.AspNet.StaticFiles;

namespace EvolvingImage
{
	public class Startup
	{
		public void Configure(IApplicationBuilder app)
		{
			//app.UseBrowserLink();
			app.UseStaticFiles();
			app.UseFileServer(new FileServerOptions
			{
				EnableDefaultFiles = true
			});
		}
	}
}