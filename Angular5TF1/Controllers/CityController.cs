using Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using API.Encryption;

namespace EpilutionsWeb.Controllers
{
    [Route("api/[controller]")]
    public class CityController : Controller
    {
        [HttpGet("[action]")]
        public List<CityDropdown> GetCitiesDropdown()
        {
            return new DatamanagementDLL.Repository.CityRepository().GetCitiesWithoutDupes()
                .Select(c => new CityDropdown
                {
                    CityId = c.CityID,
                    CityStateZip = c.Name.ToSafeString() + ", " + c.STAbbr.ToSafeString() + " " + c.Zip.ToSafeString()
                })
                .ToList();
        }

        [HttpGet("[action]")]
        public List<CityDropdown> GetBMTCitiesByLineId(string id)
        {
            var decryptedId = Encryption.EncryptDecryptQueryString.Decrypt(id, "r0b1nr0y").ToInt();
            var stops = new DatamanagementDLL.Repository.OrderStopRepository().GetOrderStopsByQuoteOrderLineId(decryptedId);
            var lldStop = stops.OrderBy(s => s.StopSequence).FirstOrDefault(s => s.EventCode == "LLD" || s.EventCode == "HLT");

            return new DatamanagementDLL.Repository.CityRepository().GetCitiesByStateId(lldStop.City == null ? 0 : lldStop.City.StateID.ToInt())
                .Where(c => c.UseCityForDupCitySTZip3Ind == true)
                .Select(c => new CityDropdown
                {
                    CityId = c.CityID,
                    CityStateZip = c.CityStateZip
                })
                .ToList();
        }

        public class CityDropdown
        {
            public long CityId { get; set; }
            public string CityStateZip { get; set; }
        }
    }
}