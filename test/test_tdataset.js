var db = require("tdataset");

var Db = new db.TServerConnection();
Db.DBName = "test";
Db.DBPort = "3050";
Db.DBUserName = "SYSDBA";
Db.DBServer = "localhost";
Db.DBPassword = "masterkey";

var Connection;

function returnQuery() {
    var Dst = new db.TServerDataSet();
    Dst.Params = undefined;
    Dst.Connection = Connection;
    Dst.SelectSQL = "SELECT * FROM CUSTOMERS";
    Dst.KeyFieldName = "ID";
    Dst.Open(false, 0, 0, function(Result, Err) {
        if (Result) {
            console.log("record count:"+Dst.RecordCount);
            console.log("field count:"+Dst.FieldsCount);
            console.log(Dst.Fields("ID").AsString);
            console.log(Dst.Fields(0).AsString);
            Dst.Edit();
            Dst.Fields("NAME").AsString = "Test";
            Dst.Post(function(Result, Err) {
                console.log("post complete.");

                Dst.Append(function(Result) {
                    Dst.Fields("NAME").AsString = "Test Append";
                    Dst.Post(function(Result, Err) {
                        console.log("append complete");
                    });
                });

            });
        }
    });
}

Db.Connect(function(Status, Db) {
    if (Status) {
        Connection = Db;
        returnQuery();
    }
    else console.log(Db);
});