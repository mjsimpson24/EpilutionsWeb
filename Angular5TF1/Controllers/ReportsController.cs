using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Telerik.Reporting.Cache.File;
using Telerik.Reporting.Services;
using Telerik.Reporting.Services.AspNetCore;
using Telerik.Reporting.Services.Engine;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EpilutionsWeb.Controllers
{
    [Route("api/[controller]")]
    public class ReportsController : ReportsControllerBase
    {
        public ReportsController(IHostingEnvironment environment)
        {
            var reportsPath = Path.Combine(environment.WebRootPath, "Reports");

            ReportServiceConfiguration = new ReportServiceConfiguration
            {
                HostAppId = "EpilutionsWeb",
                Storage = new FileStorage(),
                ReportResolver = new ReportFileResolver(reportsPath)
            };
        }

        // GET: api/<controller>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
