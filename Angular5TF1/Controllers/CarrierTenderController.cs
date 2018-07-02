using API.Encryption;
using Extensions;
//using PdfSharp.Pdf;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Web;
using System.Collections.Specialized;
using System.Net;
using System.IO;
//using PdfSharp.Drawing;

namespace EpilutionsWeb.Controllers
{
    [Route("api/[controller]")]
    public class CarrierTenderController : Controller
    {
        [HttpGet("[action]")]
        public List<OrderData> GetOrdersByCarrierCode(string id)
        {
            var carrierCode = Encryption.EncryptDecryptQueryString.Decrypt(id, "r0b1nr0y");
            var carrier = new DatamanagementDLL.Repository.CarrierRepository().GetCarrierByCarrierCode(carrierCode.ToSafeString());

            if (carrier == null) return null;

            var contactRepo = new DatamanagementDLL.Repository.ContactRepository();
            var offerRepo = new DatamanagementDLL.Repository.OfferRepository();
            var orders = new DatamanagementDLL.Repository.QuoteOrderLineRepository().GetOpenOrdersByCarrierId(carrier.CarrierId);

            return orders.Select(o => new OrderData
            {
                EncryptedId = Encryption.EncryptDecryptQueryString.Encrypt(o.QuoteOrderLineId.ToSafeString(), "r0b1nr0y"),
                OrderNumber = o.OrderNumber,
                OriginCity = o.OCity,
                DestinationCity = o.DCity,
                Consignee = o.Consignee,
                Shipper = o.Shipper,
                LoadType = o.RoundTrip.ToBool() ? "Round Trip" : "One-Way",
                PickupDate = o.OriginalPickupDate,
                Driver1 = contactRepo.GetContactByContactId(o.DriverId.ToInt()),
                TenderData = new TenderData
                {
                    Accepted = offerRepo.GetAwardedOfferByQuoteOrderLineID(o.QuoteOrderLineId).CarrierAccepted.ToBool()
                }
            }).ToList();
        }

        [HttpGet("[action]")]
        public TenderData GetTenderData(string id)
        {
            var decryptedId = Encryption.EncryptDecryptQueryString.Decrypt(id, "r0b1nr0y");
            var contactRepo = new DatamanagementDLL.Repository.ContactRepository();
            var tenderMaint = new DatamanagementDLL.Repository.TenderMaintenanceRepository().GetTenderMaintenance();
            var order = new DatamanagementDLL.Repository.QuoteOrderLineRepository().GetQuoteOrderLineById(decryptedId.ToInt());
            var offer = new DatamanagementDLL.Repository.OfferRepository().GetAwardedOfferByQuoteOrderLineID(decryptedId.ToInt());
            var carrierRep = new DatamanagementDLL.Repository.EmployeeRepository().GetEmployeeByEmployeeId(order.AwardedCarrierRepId.ToInt());
            var trailerType = new DatamanagementDLL.Repository.TrailerTypeRepository().GetTrailerTypeById(order.TrailerTypeId.ToInt());
            var driver1 = contactRepo.GetContactByContactId(order.DriverId.ToInt());
            var driver2 = contactRepo.GetContactByContactId(order.Driver2Id.ToInt());
            var comment = order.CommentId.ToInt() > 0
                ? new DatamanagementDLL.Repository.CommentRepository().GetCommentById(order.CommentId)
                : new DatamanagementDLL.Comment();

            return new TenderData
            {
                QuoteOrderLineId = decryptedId.ToInt(),
                CarrierName = order.Carrier.Name,
                OrderNumber = order.OrderNumber,
                Driver1Cell = driver1 == null ? "" : driver1.Cell,
                Driver1Name = driver1 == null ? "" : driver1.FullName,
                Driver2Cell = driver2 == null ? "" : driver2.Cell,
                Driver2Name = driver2 == null ? "" : driver2.FullName,
                TruckNumber = order.TruckNumber,
                TrailerNumber = order.TrailerNumber,
                Miles = order.Miles,
                LinehaulCharge = order.Cost,
                OtherCharge = order.AccessorialCost.ToDecimal(),
                Comment = comment.CommentText,
                TrailerType = trailerType == null ? "" : trailerType.Description,
                CarrierRepName = carrierRep == null ? "" : carrierRep.FullName,
                CarrierRepPhone = carrierRep == null ? "" : carrierRep.Phone.ToSafeString() + " " + carrierRep.PhoneExt.ToSafeString(),
                CarrierRepCell = carrierRep == null ? "" : carrierRep.Cell.ToSafeString(),
                CarrierRepFax = carrierRep == null ? "" : carrierRep.Fax.ToSafeString(),
                Accepted = offer == null ? false : offer.CarrierAccepted.ToBool(),
                Disclaimer = tenderMaint.Disclaimer.ToSafeString()
            };
        }

        [HttpGet("[action]")]
        public StopData GetStopData(string id)
        {
            var decryptedId = Encryption.EncryptDecryptQueryString.Decrypt(id, "r0b1nr0y");
            var stops = new DatamanagementDLL.Repository.OrderStopRepository().GetOrderStopsByQuoteOrderLineId(decryptedId.ToInt());
            var bmtStop = stops.FirstOrDefault(s => s.EventCode == "BMT");
            var firstStop = stops.OrderBy(s => s.StopSequence).FirstOrDefault(s => s.EventCode != "BMT" && (s.EventCode == "LUL" || s.EventCode == "HLT"));
            var lastStop = stops.OrderByDescending(s => s.StopSequence).FirstOrDefault(s => s.EventCode != "BMT" && (s.EventCode == "LLD" || s.EventCode == "DLT"));
            var bmtCity = bmtStop == null ? null : new DatamanagementDLL.Repository.CityRepository().GetCityById(bmtStop.CityId.ToInt());

            return new StopData
            {
                BMTCity = bmtCity,
                BMTStopDate = bmtStop == null ? (DateTime?)null : bmtStop.ArrivalDate,
                EstimatedArrivalDate = lastStop.ArrivalDate,
                Stops = stops.OrderBy(s => s.StopSequence).ToList()
            };
        }

        [HttpPost("[action]")]
        public bool SaveTenderData([FromBody] PostTenderData data)
        {
            try
            {
                var decoded = HttpUtility.UrlDecode(data.EncryptedId);
                var lineId = Encryption.EncryptDecryptQueryString.Decrypt(decoded, "r0b1nr0y").ToInt();
                var orderRepo = new DatamanagementDLL.Repository.QuoteOrderLineRepository();
                var offerRepo = new DatamanagementDLL.Repository.OfferRepository();
                var stopRepo = new DatamanagementDLL.Repository.OrderStopRepository();
                var orderLine = orderRepo.GetQuoteOrderLineById(lineId);                
                var offer = offerRepo.GetAwardedOfferByQuoteOrderLineID(lineId);
                var stops = stopRepo.GetOrderStopsByQuoteOrderLineId(lineId);
                offer.CarrierAccepted = data.Accepted;
                if (data.Accepted) offer.CarrierAcceptedDate = DateTime.Now;
                if (!data.Accepted) offer.CarrierDeclinedDate = DateTime.Now;
                offerRepo.SaveOffer(offer);

                if (!data.Accepted)
                {
                    try
                    {
                        var carrierReturn = API.SystemLink.Public.Custom.SetCarrierOnLegHeader(orderLine.APILoadId.ToInt(), "UNKNOWN");
                        var payDetails = API.SystemLink.Public.PayDetails.GetPayDetailsByLegHeaderNumberOrderNumber(orderLine.APILoadId.ToInt(), orderLine.OrderNumber.ToInt());

                        foreach (var payDetail in payDetails)
                        {
                            API.SystemLink.Public.PayDetails.DeletePayDetailByNumber(payDetail.PayDetailNumber);
                        }
                    }
                    catch(Exception ex)
                    {
                        var ok = ex;
                    }

                    offer.Awarded = false;
                    offer.AwardedDate = null;
                    offer.CarrierDropped = true;
                    offer.CarrierDropReasonID = 3;
                    offerRepo.SaveOffer(offer);
                    
                    orderLine.ERPLoadStatus = "AVL";
                    orderLine.ERPAssignedTo = "AAVAILABLE";
                    orderLine.CarrierId = 0;
                    orderLine.LoadStatusID = 1;
                    orderRepo.SaveQuoteOrderLine(orderLine);

                    var trailerType = new DatamanagementDLL.Repository.TrailerTypeRepository().GetTrailerTypeById(orderLine.TrailerTypeId.ToInt());
                    var empRepo = new DatamanagementDLL.Repository.EmployeeRepository();
                    var csr = empRepo.GetEmployeeByEmployeeId(orderLine.AwardedCarrierRepId.ToInt());
                    var csManagers = empRepo.GetCSManagers();
                    var toAddresses = new Dictionary<string, string>();
                    toAddresses.Add("corey@epilutions.com", "Corey");
                    //toAddresses.Add(csr.Email, csr.FullName);

                    //foreach(var manager in csManagers)
                    //{
                    //    toAddresses.Add(manager.Email, manager.FullName);
                    //}

                    var htmlString = 
                        "<p>Order #" + orderLine.OrderNumber + ", has an offer that has been declined from: " + orderLine.Carrier.CarrierCode + " for " + string.Format("{0:C}", orderLine.Cost) + "</p>" +
                        "<table border=\"1\" cellspacing=\"0\" cellpadding=\"5\">" +
                            "<tr><th>Load Offer</th><th>Origin</th><th>Destination</th><th>Miles</th><th>Equipment</th></tr>" +
                            "<tr>" +
                                "<td>" + offer.AwardedDate.ToSafeString() + "</td>" +
                                "<td>" + orderLine.OriginCityStateZip + "</td>" +
                                "<td>" + orderLine.DestinationCityStateZip + "</td>" +
                                "<td>" + orderLine.Miles.ToSafeString() + "</td>" +
                                "<td>" + trailerType.Description + "</td>" +
                            "</tr>" +
                        "</table>" +
                        "<br/><br/>" +
                        "<table border=\"1\" cellspacing=\"0\" cellpadding=\"5\">" +
                            "<tr><th>Stop #</th><th>Type</th><th>Event</th><th>Earliest</th><th>Latest</th><th>City/St</th><th>Pieces</th><th>Weight</th></tr>";

                    foreach(var stop in stops.OrderBy(s => s.StopSequence))
                    {
                        htmlString +=
                            "<tr>" +
                                "<td>" + stop.StopSequence + "</td>" +
                                "<td>" + stop.StopType + "</td>" +
                                "<td>" + stop.EventCode + "</td>" +
                                "<td>" + stop.EarliestDate.ToSafeString() + "</td>" +
                                "<td>" + stop.LatestDate.ToSafeString() + "</td>" +
                                "<td>" + stop.StopCityST + "</td>" +
                                "<td>" + stop.Pieces + "</td>" +
                                "<td>" + stop.Weight + "</td>" +
                            "</tr>";
                    }

                    htmlString += "</table>";

                    API.AzureServices.Email.SendHTMLEmail("CarrierTenderResponse@epilutions.com", "Tender Response", toAddresses,
                        "Declined: " + orderLine.Carrier.CarrierCode + " Load #" + orderLine.OrderNumber,
                        htmlString);

                    return true;
                }
                
                var contactRepo = new DatamanagementDLL.Repository.ContactRepository();
                
                var bmtStop = stops.FirstOrDefault(s => s.EventCode == "BMT");
                var stopDate = data.BMTArrivalDate.Date;
                stopDate = stopDate.AddHours(data.BMTArrivalHours);
                stopDate = stopDate.AddMinutes(data.BMTArrivalMinutes);

                if (bmtStop == null)
                    bmtStop = new DatamanagementDLL.OrderStop
                    {
                        QuoteOrderLineId = orderLine.QuoteOrderLineId,
                        LegHeaderNumber = orderLine.APILoadId.ToInt(),
                        OrderNumber = orderLine.OrderNumber,
                        EventCode = "BMT",
                        StopType = "NONE",
                        CustomerId = 0,
                        CityId = data.BMTCity.CityID,
                        StopSequence = 0,
                        Pieces = 0,
                        PiecesUnit = "PLT",
                        Weight = 0,
                        WeightUnit = "LBS",
                        CreatedByEmployeeId = -1,
                        CreatedDate = DateTime.Now
                    };

                bmtStop.ArrivalDate = stopDate;
                bmtStop.DepartDate = stopDate;
                bmtStop.EarliestDate = stopDate;
                bmtStop.LatestDate = stopDate;

                try
                {
                    var tmwStop = API.SystemLink.Public.Stops.SaveStopFromEpiStop(bmtStop, data.BMTCity.ERPCityID.ToInt(), "UNKNOWN");
                    if (tmwStop != null) bmtStop.StopNumber = tmwStop.StopNumber;                    
                }
                catch(Exception ex)
                {
                    var ok = ex;
                }

                stopRepo.SaveOrderStop(bmtStop);

                if (data.Driver1Cell.ToSafeString().Trim().Length > 0)
                {
                    var driver1 = contactRepo.GetDriverByCell(data.Driver1Cell);
                    if (driver1 == null)
                        driver1 = new DatamanagementDLL.Contact
                        {
                            DriverInd = true,
                            Title = "Driver",
                            TableID = orderLine.CarrierId.ToInt(),
                            ContactType = "Carrier",
                            CreateDate = DateTime.Now,
                            CreateEmployeeId = -1,
                            EmailBlastIncluded = false
                        };

                    driver1.Cell = data.Driver1Cell;
                    driver1.FirstName = data.Driver1Name.Split(' ')[0].ToSafeString().Trim();
                    driver1.LastName = data.Driver1Name.Replace(driver1.FirstName, "").ToSafeString().Trim();
                    contactRepo.SaveContact(driver1);
                    orderLine.DriverId = driver1.ContactId;
                }

                if (data.Driver2Cell.ToSafeString().Trim().Length > 0)
                {
                    var driver2 = contactRepo.GetDriverByCell(data.Driver2Cell);
                    if (driver2 == null)
                        driver2 = new DatamanagementDLL.Contact
                        {
                            DriverInd = true,
                            Title = "Driver",
                            TableID = orderLine.CarrierId.ToInt(),
                            ContactType = "Carrier",
                            CreateDate = DateTime.Now,
                            CreateEmployeeId = -1,
                            EmailBlastIncluded = false,
                        };

                    driver2.Cell = data.Driver2Cell;
                    driver2.FirstName = data.Driver2Name.Split(' ')[0].ToSafeString().Trim();
                    driver2.LastName = data.Driver2Name.Replace(driver2.FirstName, "").ToSafeString().Trim();
                    contactRepo.SaveContact(driver2);
                    orderLine.Driver2Id = driver2.ContactId;
                }

                orderLine.TruckNumber = data.TruckNumber.ToSafeString().Trim();
                orderLine.TrailerNumber = data.TrailerNumber.ToSafeString().Trim();
                orderRepo.SaveQuoteOrderLine(orderLine);

                return true;
            }
            catch(Exception ex)
            {
                return false;
            }
        }

        [HttpPost("[action]")]
        public void PrintPage(PrintPageData data)
        {
            //PdfDocument pdf = new PdfDocument();
            //pdf.Info.Title = "Created with PDFSharp";
            //PdfPage page = pdf.AddPage();
            //XGraphics gfx = XGraphics.FromPdfPage(page);
            //XFont font = new XFont("Verdana", 20, XFontStyle.BoldItalic);

            //gfx.DrawString("Hello, World!", font, XBrushes.Black, new XRect(0, 0, page.Width, page.Height), XStringFormats.Center);
            //const string filename = "C:\\temp\\HelloWorld.pdf";
            //pdf.Save(filename);
            
        }

        public class OrderData
        {
            public string EncryptedId { get; set; }
            public string OrderNumber { get; set; }
            public DatamanagementDLL.City OriginCity { get; set; }
            public DatamanagementDLL.City DestinationCity { get; set; }
            public DatamanagementDLL.Customer Shipper { get; set; }
            public DatamanagementDLL.Customer Consignee { get; set; }
            public string CardClass { get; set; }
            public TenderData TenderData { get; set; }
            public string LoadType { get; set; }
            public DateTime? PickupDate { get; set; }
            public DatamanagementDLL.Contact Driver1 { get; set; }
        }

        public class TenderData
        {
            public int QuoteOrderLineId { get; set; }
            public string CarrierName { get; set; }
            public string OrderNumber { get; set; }
            public string Driver1Cell { get; set; }
            public string Driver1Name { get; set; }
            public string Driver2Cell { get; set; }
            public string Driver2Name { get; set; }
            public string TruckNumber { get; set; }
            public string TrailerNumber { get; set; }
            public string ContactName { get; set; }
            public string ContactPhone { get; set; }
            public string ContactEmail { get; set; }
            public int Miles { get; set; }
            public decimal LinehaulCharge { get; set; }
            public decimal OtherCharge { get; set; }
            public string Comment { get; set; }
            public string TrailerType { get; set; }
            public string CarrierRepName { get; set; }
            public string CarrierRepPhone { get; set; }
            public string CarrierRepCell { get; set; }
            public string CarrierRepFax { get; set; }
            public bool Accepted { get; set; }
            public string Disclaimer { get; set; }
        }

        public class StopData
        {
            public DatamanagementDLL.City BMTCity { get; set; }
            public DateTime? BMTStopDate { get; set; }
            public DateTime? EstimatedArrivalDate { get; set; }

            public List<DatamanagementDLL.OrderStop> Stops { get; set; }
        }

        public class PostTenderData
        {
            public string EncryptedId { get; set; }
            public DatamanagementDLL.City BMTCity { get; set; }
            public DateTime BMTArrivalDate { get; set; }
            public int BMTArrivalHours { get; set; }
            public int BMTArrivalMinutes { get; set; }
            public string Driver1Cell { get; set; }
            public string Driver1Name { get; set; }
            public string Driver2Cell { get; set; }
            public string Driver2Name { get; set; }
            public string TruckNumber { get; set; }
            public string TrailerNumber { get; set; }
            public bool Accepted { get; set; }
        }

        public class PrintPageData
        {
            public string URL { get; set; }
            public string HTML { get; set; }
        }
    }
}