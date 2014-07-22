/*
 server dataset kütüphanesi
*/

var General = require('../lib/general.objects.js');
var Db = require('../lib/data.db.js');
var Fb = require('../lib/node.firebird.js');
var Dt = require('../lib/general.dateutils.js');
var SqlParser = require("sql-parser");

var TLtState = {
	"lsIgnore": 0,
	"lsFromSearch": 1,
	"lsTableSearch": 2,
	"lsNormal": 3,
	"lsAlias": 4,
	"lsField": 5,
	"lsTableAlias": 6
};

var TServerConnection = function() {
		var FDB = null;
		this.DBServer = "localhost";
		this.DBPort = 3305;
		this.DBName = "";
		this.DBUserName = "SYSDBA";
		this.DBPassword = "masterkey";
		this.DBRole = "";
		this.Connect = function(OnResult) {			
			Fb.ConnectDB(this.DBServer, this.DBPort, this.DBName, this.DBUserName, this.DBPassword, this.DBRole, function(DB) {				
				FDB = DB;
				OnResult(true, DB);
			}, function(Err) {
				console.log("burdayım");
				if(OnResult) OnResult(false, Err);
			});
		};
		var getFDB = function() {
				return FDB;
			},
			setFDB = function(Value) {
				FDB = Value;
			};
		Object.defineProperty(this, 'Connection', {
			get: getFDB,
			set: setFDB,
			configurable: true
		});
}

var TServerDataSet = function() {		    
		TServerDataSet.prototype.constructor.call(this); 		
		var FSelectSQL = "",
			FLiteralCount = 0,
			FMasterTable = "",
			FMasterAlias = "",
			FDB = null,
			PlanList = new General.TList(),			
			FKeyFieldSet = false,
			FRawFields = null;				
		this.RawRows = null;
		this.InsertSQL = "";
		this.UpdateSQL = "";
		this.DeleteSQL = "";
		this.CountSQL = "";
		this.GeneratorName = "";
		this.Session = null;
		this.Params = new Array();
		this.Append = function(OnResult) {			
			this.AppendBase();	
			var Self = this;		
			if(this.GeneratorName > '') {
				Fb.Execute(FDB, "Select Gen_Id("+this.GeneratorName+", 1) From RDB$DATABASE", null, 
					function(Rows, Fields) {				
						Self.Fields(Self.KeyFieldName).AsInteger = Rows[0][0]["low_"];
						OnResult();
					});
			}
			else OnResult();
		};
		//OnSuccess(Success:Boolean;Err:Variant);
		this.Delete = function(OnSuccess) {
			//iyt 06.10.2012 09:44
			this.DoBeforeDelete();
			var Prm = new Array(1);
			Prm[0] = this.Fields[KeyFieldName].Value;
			this.prototype.Delete;
			Execute(FDB, this.DeleteSQL, Prm, function(Rows, Fields) {
				OnSuccess(true, null);
				this.DoAfterDelete;
			});
		};
		this.Post = function(OnSuccess) {
			var Prm = null;
			var Self = this;

			function InsertRun() {
				Prm = new Array(this.FieldsCount);
                var J = 0;
				for(var i = 0; i <= Self.FieldsCount - 1; i++) {
                    if(Self.Fields(i).Editable == true) {
					  Prm[J]=Self.Fields(i).AsString;
                      J = J + 1;
                    }
				}
				this.DoBeforePost;
                console.log(Self.InsertSQL);
                console.log(Prm);
				Fb.Execute(FDB, Self.InsertSQL, Prm, function(Rows, Fields) {
					OnSuccess(true, null);
					this.DoAfterPost;
				},
				function(Err) {
					OnSuccess(false, Err.message);
				});
			}						
			if(this.State == Db.TDataSetState.dsInsert) {				
				this.PostBase();
				if(this.GeneratorName == "" && this.Fields(this.KeyFieldName).Value == null) throw new Error('Dataset read only.');
				InsertRun();
			}
			if(this.State == Db.TDataSetState.dsEdit) {
				if(this.UpdateSQL == "") throw new Error('Dataset read only.');
				if(this.Fields(this.KeyFieldName).Value == null) throw new Error('Dataset read only.');
				this.PostBase();
				Prm = [];
				var J = 0;
				for(var i = 0; i <= this.FieldsCount - 1; i++)
					if(this.Fields(i).KeyField == false && this.Fields(i).Editable == true) {
						Prm.push(this.Fields(i).Value);
						J = J + 1;
					}
				Prm.push(this.Fields(this.KeyFieldName).AsString);								
				this.DoBeforePost;					
				Fb.Execute(FDB, this.UpdateSQL, Prm, function(Rows, Fields) {
						OnSuccess(true, null);
						this.DoAfterPost;
				},
				function(Err) {
					OnSuccess(false, Err.message);					
				});				
			}
		};
		this.GenerateRows = function() {
			var Count = Object.keys(FRawRows).length;			
			for(var i = 0; i <= Count - 1; i++) {
				var R = new Db.TRow();				
				R.RecNo = i;
				for(var j = 0; j <= this.FieldsCount - 1; j++) {						
					if(FRawRows[i][j] == null) R.Data.push(null);
					else if(this.Fields(j).FieldType == Db.TFieldType.ftTimeStamp) R.Data.push(Dt.FormatDateTime("L LT", FRawRows[i][j]));
					else if(this.Fields(j).FieldType == Db.TFieldType.ftDateTime) R.Data.push(Dt.FormatDateTime("L LT", FRawRows[i][j]));
					else if(this.Fields(j).FieldType == Db.TFieldType.ftDate) R.Data.push(Dt.FormatDateTime("L", FRawRows[i][j]));
					else if(this.Fields(j).FieldType == Db.TFieldType.ftTime) R.Data.push(Dt.FormatDateTime("LT", FRawRows[i][j]));
					else R.Data.push(FRawRows[i][j]);
				};				
				this.Rows.Add(R);
			}			
			this.State = Db.TDataSetState.dsBrowse;			
			this.First();			
		};
		this.GenerateFields = function() {
			var Count = Object.keys(FRawFields).length;						
			for(var i = 0; i <= Count - 1; i++) {
				var Fld = new Db.TField();
				Fld.DataSet = this;
				Fld.FieldName = FRawFields[i]['alias'];
				Fld.FieldNo = i;					
				switch(FRawFields[i]['type']) {
				case 452:
					Fld.FieldType = Db.TFieldType.ftString;
					break;
				case 448:
					Fld.FieldType = Db.TFieldType.ftString;
					break;
				case 500:
					Fld.FieldType = Db.TFieldType.ftShortint;
					break;
				case 496:
					Fld.FieldType = Db.TFieldType.ftInteger;
					break;
				case 482:
					Fld.FieldType = Db.TFieldType.ftFloat;
					break;
				case 480:
					Fld.FieldType = Db.TFieldType.ftFloat;
					break;
				case 530:
					Fld.FieldType = Db.TFieldType.ftFloat;
					break;
				case 510:
					Fld.FieldType = Db.TFieldType.ftTimeStamp;
					break;
				case 520:
					Fld.FieldType = Db.TFieldType.ftBlob;
					break;
				case 540:
					Fld.FieldType = Db.TFieldType.ftArray;
					break;
				case 550:
					Fld.FieldType = Db.TFieldType.ftLargeint;
					break;
				case 560:
					Fld.FieldType = Db.TFieldType.ftTime;
					break;
				case 570:
					Fld.FieldType = Db.TFieldType.ftDate;
					break;
				case 580:
					Fld.FieldType = Db.TFieldType.ftInteger;
					break;
				case 32764:
					Fld.FieldType = Db.TFieldType.ftBoolean;
					break;
				case 32766:
					Fld.FieldType = Db.TFieldType.ftVariant;
					break;
				}				
				Fld.TableName = FRawFields[i]['relation'];
				if(Fld.TableName == FMasterTable && Fld.FieldName == this.KeyFieldName) {
					Fld.KeyField = true;
					FKeyFieldSet = true;
				}
				if (Fld.TableName == FMasterTable)
					Fld.Editable = true;
				if(FRawFields[i]['nullable'] == 'true') Fld.Nullable = true;
				else Fld.Nullable = false;
				this.AddField(Fld);				
			}			
		};
		this.GenerateSQLs = function() {
			var Yed = "",
				Yed2 = "";
			this.InsertSQL = "INSERT INTO " + FMasterTable + " (";
			for(var i = 0; i <= this.FieldsCount - 1; i++) {
				if(this.Fields(i).TableName == FMasterTable) {
					Yed = Yed + this.Fields(i).FieldName + ", ";
					Yed2 = Yed2 + "?, ";
				}
			}
			this.InsertSQL = this.InsertSQL + Yed.substr(0, Yed.length - 2) + ") VALUES (" + Yed2.substr(0, Yed2.length - 2) + ")";
			Yed = "";
			Yed2 = "";
			this.UpdateSQL = "UPDATE " + FMasterTable + " SET ";
			if(FKeyFieldSet) {
				for(var i = 0; i <= this.FieldsCount - 1; i++) {
					if(this.Fields(i).TableName == FMasterTable && !this.Fields(i).KeyField) Yed = Yed + this.Fields(i).FieldName + " = ? ,";
				}
				this.UpdateSQL = this.UpdateSQL + Yed.substr(0, Yed.length - 2) + " WHERE " + this.KeyFieldName + " = ? ";
				this.DeleteSQL = "DELETE FROM " + FMasterTable + " WHERE " + this.KeyFieldName + " = ? ";
			}
		};
		this.ExecQuery = function(SQL, OnExecute) {
			var Self = this;
			Fb.Execute(FDB, SQL, Self.Params, function(Rows, Fields) {
					if(OnExecute) OnExecute(true, null);
			});			
		};
		this.Open = function(Fetch, Skip, First, OnConnect) {
			var Self = this;
			var SQL = "";						
			function SelfOpen() {					    	
				SQL = FSelectSQL;								
				Fb.Execute(FDB, SQL, Self.Params, function(Rows, Fields) {																			
					FRawRows = Rows;					
					FRawFields = Fields;										
					Self.GenerateFields();										
					Self.GenerateSQLs();
					Self.GenerateRows();															
					if(OnConnect) OnConnect(true, null);					
					Self.DoAfterOpen();					
				}, 
				function(Err) {
					if (OnConnect) OnConnect(false, Err);
				});
			}

			//iyt 30.09.2012 18:53							
			Self.DoBeforeOpen();				
			if(FMasterTable != "") {						
				SQL = "SELECT RDB$INDEX_SEGMENTS.RDB$FIELD_NAME " + " FROM RDB$INDEX_SEGMENTS " + " LEFT JOIN RDB$INDICES ON RDB$INDICES.RDB$INDEX_NAME = " + " RDB$INDEX_SEGMENTS.RDB$INDEX_NAME " + " LEFT OUTER JOIN RDB$RELATION_CONSTRAINTS CO ON CO.RDB$CONSTRAINT_NAME = RDB$INDICES.RDB$INDEX_NAME " + " WHERE UPPER(RDB$INDICES.RDB$RELATION_NAME)= ? " + " AND RDB$INDICES.RDB$UNIQUE_FLAG IS NOT NULL " + " AND CO.RDB$CONSTRAINT_TYPE = 'PRIMARY KEY' ";
				Fb.Execute(FDB, SQL, [FMasterTable], function(Rows, Fields) {												
					if(Object.keys(Rows).length > 0) Self.KeyFieldName = Rows[0].toString().trim().toUpperCase();						
					if(Fetch) {
						SQL = FSelectSQL.substr(1, 6) + ' first ' + First.toString() + ' skip ' + Skip.toString() + ' ' + FSelectSQL.substr(7, FSelectSQL.length - 6);
						Fb.Execute(FDB, CountSQL, Self.Params, function(Rows, Fields) {
							FetchedRecordCount = Rows[0][0];
							Fb.Execute(DB, SQL, Self.Params, function(Rows, Fields) {
								FRawRows = Rows;
								FRawFields = Fields;
								this.GenerateFields();
								this.GenerateSQLs();
								this.GenerateRows();
								if(OnConnect) OnConnect(true, null);
								Self.DoAfterOpen();
							},
							function(Err) {
								if (OnConnect) OnConnect(false, Err);
							});
						},
						function(Err) {
							if (OnConnect) OnConnect(false, Err);
						});
					} else SelfOpen();
				});
			} //FMasterTable bos ise
			else SelfOpen();			
		};
		this.GeneratePlan = function() {
			if(FSelectSQL != "") {				
				var S = FSelectSQL;				
				S = S.replace(/\?/g, "1");								
				Tokens = SqlParser.lexer.tokenize(S);			
				FLiteralCount = Tokens.Count;
				PlanList = new General.TList();
				LtState = TLtState.lsNormal;
				for(var i = 0; i < Object.keys(Tokens).length - 1; i++) {
					LtType = Tokens[i][0];
					if(LtType == "SELECT" && LtState == TLtState.lsNormal) LtState = TLtState.lsFromSearch;
					else if(LtType == "LEFT_PAREN") LtState = TLtState.lsIgnore;
					else if(LtType == "RIGHT_PAREN") LtState = TLtState.lsFromSearch;
					else if(LtState == TLtState.lsFromSearch && LtType == "FROM") LtState = TLtState.lsTableSearch;
					else if(LtState == TLtState.lsTableSearch && LtType == "LITERAL") {
						FMasterTable = Tokens[i][1].toUpperCase();
						LtState = TLtState.lsAlias;
					} else if(LtState == TLtState.lsAlias) {
						if(LtType == "LITERAL") FMasterAlias = Tokens[i][1].toUpperCase();
						LtState = TLtState.lsNormal;
					}
					if(LtState == TLtState.lsTableSearch || LtState == TLtState.lsAlias || LtState == TLtState.lsNormal) if(Tokens[i][0] == "STRING") this.CountSQL = this.CountSQL + " '" + Tokens[i][1] + "'";
					else this.CountSQL = this.CountSQL + " " + Tokens[i][1];
				}
				this.CountSQL = "Select Count(*) " + this.CountSQL;
			}
		};
		var SetSQL = function(Value) {
				//iyt 29.09.2012 23:26
				FSelectSQL = Value;							
				this.GeneratePlan();
			},
			GetSQL = function() {
				return this.FSelectSQL;
			};
		Object.defineProperty(this, 'SelectSQL', {
			get: GetSQL,
			set: SetSQL,
			enumerable: true,
			configurable: true
		});		
		var getFDB = function() {
				return FDB;
			},
			setFDB = function(Value) {
				FDB = Value;
			};
		Object.defineProperty(this, 'Connection', {
			get: getFDB,
			set: setFDB,
			configurable: true
		});
	};

	TServerDataSet.prototype = Object.create(new Db.TDataSet());   

exports.TServerDataSet = TServerDataSet;
exports.TServerConnection = TServerConnection;