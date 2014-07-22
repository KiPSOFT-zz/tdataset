// 
// tarih saat kütüphanesi
//
var moment = require("moment");

moment.lang("tr");

function trDate(DateTime, Format) {
	return moment(DateTime, Format);
}

function FormatDateTime(Format, DateTime) {   
   var m = moment(DateTime);
   return m.format(Format);
}

function dateValid(DateTime, Format) {
	return moment(DateTime, Format).isValid();
}

function getDate() {
	return moment().format("DD.MM.YYYY");
}

exports.FormatDateTime = FormatDateTime;
exports.trDate = trDate;
exports.dateValid = dateValid;
exports.getDate = getDate;