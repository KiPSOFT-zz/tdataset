/* 
node.js firebird kütüphanesi 
*/

var FB = require("node-firebird");

/* OnConnect(Database) OnError(Error) */
var ConnectDB = function(HostName, Port, DBName, UserName, Password, Role, OnConnect, OnError)
{
	var  J = {};
	J.host = HostName;
	J.database = DBName;
	J.user = UserName;
	J.password = Password;
	J.port = Port;
	FB.attach(J, 
		function(Err, Db)
		{
			if (Err!=null)
			{
				if (OnError!=null) OnError(Err);
			}
			else
				if (OnConnect!=null) OnConnect(Db);
		});
};

/* OnResult(Rows, Fields) */
var Execute = function(Db, SQL, Params, OnResult, OnErr)
{	
	Db.execute(SQL, Params, 
		function(Err, Rows, Fields)
		{			
			if (Err!=null)
				if (OnErr!=null && OnErr!=undefined) OnErr(Err);
			else
			 	throw new Error(Err.message);
			else
				if (OnResult!=null) 
					OnResult(Rows, Fields);				
		})
};

exports.ConnectDB = ConnectDB;
exports.Execute = Execute;