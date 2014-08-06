# TDataset for node.js

Delphi programming language is used in the class TDataSet. TDataSet class is the main class which controls all database operations. This class can be used with node.js so I wrote with JavaScript. Firebird support is available now. 

Some of the advantages; 

from the SELECT query, update and insert queries are automatically generated. 

"Key Field" and "master table" in the query is parsed automatically. 

According to the type of field value assignments and readings are performed. 

Please report any errors in the opinions and requests.

[My twitter](http://twitter.com/KiPSOFT)

### Installation

```
  npm install tdataset
```

### Example

```[javascript]
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
```


Class help
---------------

TField
---

class represent Delphi TField class.

TField.Value() 
-----------------------------
this method return field value or set field value.

**Returns**: *, this method return field value or set field value.

TField.AsString() 
-----------------------------
this method return field value as string or set value from string.

**Returns**: string, this method return field value as string or set value from string.

TField.AsInteger() 
-----------------------------
this method return field value as integer or set value from integer.

**Returns**: integer, this method return field value as integer or set value from integer.

TField.AsDate() 
-----------------------------
this method return field value as date or set value from date.

**Returns**: date, this method return field value as date or set value from date.

TDataSet
---

represent from Delphi TDataSet

TDataSet.EOF() 
-----------------------------
if focused record is last record this method return true.

**Returns**: boolean, if focused record is last record this method return true.

TDataSet.BOF() 
-----------------------------
if focused record is first record this method return true.

**Returns**: boolean, if focused record is first record this method return true.

TDataSet.Rows() 
-----------------------------
this method get dataset rows.

**Returns**: TList, this method get dataset rows.

TDataSet.RecNo() 
-----------------------------
this method return focused record number.

**Returns**: integer, this method return focused record number.

TDataSet.RecordCount() 
-----------------------------
this method return record count.

**Returns**: integer, this method return record count.

TDataSet.FieldsCount() 
-----------------------------
this method return field count.

**Returns**: integer, this method return field count.

TDataSet.Fields(Field) 
-----------------------------
this method return TField passed field name or number. Example: TDataSet.Fields("ADI").AsString

**Parameters**

**Field**: integer | string, number or Field name.

**Returns**: {TField]

TDataSet.First() 
-----------------------------
this method focused first record in dataset.


TDataSet.Next() 
-----------------------------
this method focused next record in dataset.


TDataSet.Prior() 
-----------------------------
this method focused prior record in dataset.


TDataSet.Cancel() 
-----------------------------
this method cancel any changes in dataset. this method only run edit or insert mode.


TDataSet.Edit() 
-----------------------------
this method setting dataset mode to Editing


TDataSet.Locate(KeyField, Value) 
-----------------------------
this method search value in key field param.

**Parameters**

**KeyField**: string, name

**Value**: *, this method search value in key field param.

**Returns**: boolean, this method search value in key field param.

TDataSet.Close() 
-----------------------------
this method close dataset and free dataset memory.


---

TServerConnection
---

TServerConnection class. Main DB Connection class.

TServerConnection.Connect(OnResult) 
-----------------------------
Database connection method.

**Parameters**

**OnResult**: callback, connectionCallBack


TServerConnection.Append(OnResult) 
-----------------------------
This method add a new record in dataset.

**Parameters**

**OnResult**: callBack, nothing return any param.


TServerConnection.Delete(OnSuccess) 
-----------------------------
this method delete focused record in database.

**Parameters**

**OnSuccess**: callback, this callback return Result and Err params. Result params boolean, Err params string return value.


TServerConnection.Post(OnSuccess) 
-----------------------------
this method save record to database. this method only calling dataset mode editing or inserting.

**Parameters**

**OnSuccess**: callback, return Result boolean param and Err string param.


TServerConnection.ExecQuery(SQL, OnExecute) 
-----------------------------
this method onyl execute sql not return field or value. Example UPDATA T SET A = 1

**Parameters**

**SQL**: string, this method onyl execute sql not return field or value. Example UPDATA T SET A = 1

**OnExecute**: callback, this method onyl execute sql not return field or value. Example UPDATA T SET A = 1


TServerConnection.Open(Fetch, Skip, First, OnConnect) 
-----------------------------
This method open dataset and dataset mode setting browsing.

**Parameters**

**Fetch**: boolean, this param using fetching limit (limit sql command) setting the true.

**Skip**: integer, skip record size.

**First**: integer, first record size.

**OnConnect**: callback, global return callback.


---

License
-----------
The MIT License (MIT)

Copyright (c) 2014 Serkan KOCAMAN <newkipsoftware@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


Serkan KOCAMAN

**Overview:** Delphi TDataset represent for node.js

**Version:** 0.0.1
