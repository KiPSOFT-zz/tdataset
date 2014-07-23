"use strict";

/**
 * @overview Delphi TDataset represent for node.js
 * @author Serkan KOCAMAN
 * @version 0.0.1
 */

var General = require("../lib/general.objects.js");
var dateUtils = require("../lib/general.dateutils.js");

var TDataSetEventType = {
    "etDataChanged": 0,
    "etRecordChanged": 1
};

var TFieldType = {
    "ftUnknown": 0,
    "ftString": 1,
    "ftSmallint": 2,
    "ftInteger": 3,
    "ftWord": 4,
    "ftBoolean": 5,
    "ftFloat": 6,
    "ftCurrency": 7,
    "ftBCD": 8,
    "ftDate": 9,
    "ftTime": 10,
    "ftDateTime": 11,
    "ftBytes": 12,
    "ftVarBytes": 13,
    "ftAutoInc": 14,
    "ftBlob": 15,
    "ftMemo": 16,
    "ftGraphic": 17,
    "ftFmtMemo": 18,
    "ftParadoxOle": 19,
    "ftDBaseOle": 20,
    "ftTypedBinary": 21,
    "ftCursor": 22,
    "ftFixedChar": 23,
    "ftWideString": 24,
    "ftLargeint": 25,
    "ftADT": 26,
    "ftArray": 27,
    "ftReference": 28,
    "ftDataSet": 29,
    "ftOraBlob": 30,
    "ftOraClob": 31,
    "ftVariant": 32,
    "ftInterface": 33,
    "ftIDispatch": 34,
    "ftGuid": 35,
    "ftTimeStamp": 36,
    "ftFMTBcd": 37,
    "ftFixedWideChar": 38,
    "ftWideMemo": 39,
    "ftOraTimeStamp": 40,
    "ftOraInterval": 41,
    "ftLongWord": 42,
    "ftShortint": 43,
    "ftByte": 44,
    "ftExtended": 45,
    "ftConnection": 46,
    "ftParams": 47,
    "ftStream": 48,
    "ftTimeStampOffset": 49,
    "ftObject": 50,
    "ftSingle": 51
};

var TDataSetState = {
    "dsInactive": 0,
    "dsBrowse": 1,
    "dsEdit": 2,
    "dsInsert": 3,
    "dsSetKey": 4,
    "dsCalcFields": 5,
    "dsFilter": 6,
    "dsNewValue": 7,
    "dsOldValue": 8,
    "dsCurValue": 9,
    "dsBlockRead": 10,
    "dsInternalCalc": 11,
    "dsOpening": 12
};

var TDataLinkState = {
    "lsActive": 0,
    "lsDataChanged": 1,
    "lsDataEditing": 2,
    "lsRecordChanged": 3
};

var TRow = function() {
        this.RecNo = undefined;
        this.Data = [];
    };


/**
 * class represent Delphi TField class.
 * @module TField
 */
var TField = function() {
        var FValue = null;
        this.FieldNo = -1;
        this.FieldName = "";
        this.FieldType = TFieldType.ftUnknown; //!< this property setting TFieldType
        this.DataSet = undefined;
        this.TableName = "";
        this.KeyField = false; //!< this property if field key field then setting true.
        this.Nullable = false; //!< this field nullable then param setting true.
        this.Modified = false; //!< this field value changing then param setting true.
        this.DataType = this.FieldType; //!< this field datatype type is TFieldType
        this.Editable = false; //!< this field not calculated or key field this property setting true.
        var Self = this;
        var SetValue = function(Value) {
                if(Self.DataSet) {                    
                    if(Self.DataSet.State == TDataSetState.dsInactive) {
                        throw new Error('Dataset is not open.');
                    }
                    if(Self.DataSet.State == TDataSetState.dsEdit || Self.DataSet.State == TDataSetState.dsInsert) {                        
                        //Self.DataSet.Edit();
                        Self.Modified = true;                        
                        if (Self.FieldType == TFieldType.ftDate) Value = dateUtils.trDate(Value, "DD.MM.YYYY").format("YYYY-MM-DD");                                                
                        Self.DataSet.Rows.Get(Self.DataSet.RecNo).Data[Self.FieldNo] = Value;                        
                        Self.DataSet.DataEvent(TDataSetEventType.etDataChanged);
                    }
                }
        },
        GetValue = function() { 
                if(Self.DataSet.State == TDataSetState.dsBrowse || Self.DataSet.State == TDataSetState.dsEdit || Self.DataSet.State == TDataSetState.dsInsert) {
                    return Self.DataSet.Rows.Get(Self.DataSet.RecNo).Data[Self.FieldNo];
                } else {
                    return null;
                }
        },
        GetAsString = function() { 
            var Value = GetValue();
            if (Value!=null) 
                return Value.toString();
            else
                return "";
        },
        SetAsString = function(Value) {
                SetValue(Value);
        },
        GetAsDate = function() {
            var Value = GetValue();              
            if (Value!=null)
                if (Value.toString().indexOf("-")>0)
                    return dateUtils.trDate(Value.toString(), "YYYY-MM-DD").format("DD.MM.YYYY");
                else
                    return Value.toString();
            else return null;
        },
        SetAsDate = function(Value) {
            SetValue(dateUtils.trDate(Value, "DD.MM.YYYY").format("YYYY-MM-DD"));
        };
        /**
         * this method return field value or set field value.
         *@method Value
         *@return {*}
         */
        Object.defineProperty(this, 'Value', {
            get: GetValue,
            set: SetValue,
            enumerable: true,
            configurable: true
        });
        /**
        *this method return field value as string or set value from string.
        *@method AsString
        *@return {string}
        */
        Object.defineProperty(this, 'AsString', {
            get: GetAsString,
            set: SetAsString,
            enumerable: true,
            configurable: true
        });
        /**
        *this method return field value as integer or set value from integer.
        *@method AsInteger
        *@return {integer}
        */
        Object.defineProperty(this, 'AsInteger', {
            get: GetAsString,
            set: SetAsString,
            enumerable: true,
            configurable: true
        });
        /**
         *this method return field value as date or set value from date.
         *@method AsDate
         *@return {date}
         */
        Object.defineProperty(this, 'AsDate', {
            get: GetAsDate,
            set: SetAsDate,
            enumerable: true,
            configurable: true
        });        
    };

var TDataLink = function() {
        var FDataSet = null;
        this.OnDataChange = null;
        this.OnEditingChange = null;
        this.Owner = null;
        this.State = -1;
        var Self = this;
        var SetDataSet = function(DataSet) {
                if(Self.DataSet == FDataSet) {
                    return 0;
                }
            },
            GetDataSet = function() {
                return FDataSet;
            };
        this.DataChanged = function() {
            if(FDataSet == null) {
                return 0;
            }
            if(FDataSet.State == TDataSetState.dsInactive) {
                return 0;
            }
            if(Self.OnDataChange != null) {
                Self.OnDataChange();
            }
        };
        this.DataEditing = function() {
            if(FDataSet == null) {
                return 0;
            }
            if(FDataSet.State == TDataSetState.dsInactive) {
                return 0;
            }
            if(Self.OnEditingChange != null) {
                Self.OnEditingChange();
            }
        };
        this.RecordChanged = function() {};
        Object.defineProperty(this, 'DataSet', {
            get: GetDataSet,
            set: SetDataSet,
            enumerable: true,
            configurable: true
        });
    };

var TFieldDataLink = function() {
        TFieldDataLink.prototype.constructor.call(this);
        var FFieldName = "";
        var Self = this;
        var SetFieldName = function(Value) {
                FFieldName = Value;
                if(Self.DataSet != null) {
                    Self.DataChanged();
                }
            };
        Object.defineProperty(this, "FieldName", {
            get: FFieldName,
            set: SetFieldName,
            enumerable: true,
            configurable: true
        });
    };

TFieldDataLink.prototype = Object.create(new TDataLink());

/**
 *represent from Delphi TDataSet
 *@module TDataSet
 */
var TDataSet = function() {
        var FRows = new General.TList(),
            FRecNo = -1,
            FOldRow = new TRow(),            
            FDataLinks = new General.TList(),
            FFields = new General.TList();
        this.DataEvent = function(EventType) {
                var II = 0;
                for(II = 0; II <= FDataLinks.Count - 1; II = II + 1) {
                    if(FDataLinks.Get(II) != null) {
                        if(FDataLinks.Get(II).DataSet != null) {
                            if(FDataLinks.Get(II).State == TDataLinkState.lsActive) {
                                if(EventType == TDataSetEventType.etDataChanged) {
                                    FDataLinks.Get(II).State = TDataSetState.lsDataChanged;
                                    FDataLinks.Get(II).DataChanged();
                                }
                                if(EventType == TDataSetEventType.etRecordChanged) {
                                    FDataLinks.Get(II).State = TDataSetState.lsRecordChanged;
                                    FDataLinks.Get(II).RecordChanged();
                                }
                                FDataLinks.Get(II).State = TDataSetState.lsActive;
                            }
                        }
                    }
                }
            };
        var GetRows = function() {
                return FRows;
            },
            SetRows = function(Value) {
                FRows = Value;
            },            
            GetRecNo = function() {
                return FRecNo;
            },
            SetRecNo = function(No) {
                if(No > FRows.Count) {
                    return 0;
                }
                if(No < 0) {
                    return 0;
                }
                FRecNo = No;
                this.DataEvent(TDataSetEventType.etRecordChanged);
            },
            GetRecordCount = function() {
                return FRows.Count;
            },
            GetFieldsCount = function() {
                return FFields.Count;
            },
            GetEOF = function() {
                if(FRecNo == FRows.Count) {
                    return true;
                } else {
                    return false;
                }
            },
            GetBOF = function() {
                if(FRecNo == 0) {
                    return true;
                } else {
                    return false;
                }
            };
        this.State = -1;
        this.FetchedRecordCount = -1;
        this.KeyFieldName = "";
        /**
        *if focused record is last record this method return true.
        *@method EOF
        *@return {boolean}
        */
        Object.defineProperty(this, 'EOF', {
            get: GetEOF,
            enumerable: true            
        });
        /**
        *if focused record is first record this method return true.
        *@method BOF
        *@return {boolean}
        */
        Object.defineProperty(this, 'BOF', {
            get: GetBOF,
            enumerable: true,
            configurable: true
        });
        /**
        *this method get dataset rows.
        *@method Rows
        *@return {TList}
        */
        Object.defineProperty(this, 'Rows', {
            get: GetRows,
            set: SetRows,
            enumerable: true,
            configurable: true
        });
        /**
        *this method return focused record number.
        *@method RecNo
        *@return {integer}
        */
        Object.defineProperty(this, 'RecNo', {
            get: GetRecNo,
            set: SetRecNo,
            enumerable: true
        });
        /**
        *this method return record count.
        *@method RecordCount
        *@return {integer}
        */
        Object.defineProperty(this, 'RecordCount', {
            get: GetRecordCount,
            enumerable: true
        });
        /**
        *this method return field count.
        *@method FieldsCount
        *@return {integer}
        */
        Object.defineProperty(this, 'FieldsCount', {
            get: GetFieldsCount,
            enumerable: true
        });
        /**
        * this method return TField passed field name or number. Example: TDataSet.Fields("ADI").AsString
        * @method Fields
        * @param {integer|string} Field number or Field name.
        * @return {TField]
        */
        this.Fields = function(Index, Data) {            
            if(typeof(Data) == "undefined") {
                if(typeof(Index) == "number" || typeof(Index) == "numeric") {
                    return FFields.Get(Index);                    
                } else {                                        
                    for(var i = FFields.Count-1; i >= 0; i--) {
                        if(FFields.Get(i).FieldName == Index.toUpperCase()) return FFields.Get(i);                        
                    }
                }
            } else {
                if(typeof(Index) == "number" || typeof(Index) == "numeric") FFields.Put(Index, Data);
                else {
                    for(var i = FFields.Count - 1; i >= 0; i--) {
                        if(FFields.Get(i).FieldName == Index.toUpperCase()) FFields.Put(i, Data);
                    }
                }
            }
        };
        /*this.Rows = function(Index, Data) {
            if(typeof(Data) == "undefined") return FRows.Get(Index);
            else FRows.Put(Index, Data)
        };*/
        this.DataLinks = function(Index, Data) {
            if(typeof(Data) == "undefined") return FDataLinks.Get(Index);
            else FDataLinks.Put(Index, Data)
        };
        this.BeforeOpen = null;
        this.AfterOpen = null;
        this.BeforeClose = null;
        this.AfterClose = null;
        this.BeforeInsert = null;
        this.AfterInsert = null;
        this.BeforeEdit = null;
        this.AfterEdit = null;
        this.BeforePost = null;
        this.AfterPost = null;
        this.BeforeCancel = null;
        this.AfterCancel = null;
        this.BeforeDelete = null;
        this.AfterDelete = null;
        this.BeforeScroll = null;
        this.AfterScroll = null;
        this.BeforeRefresh = null;
        this.AfterRefresh = null;
        this.OnNewRecord = null;
        this.DoAfterCancel = function() {
                if(this.AfterCancel != null) this.AfterCancel(this);
            };
        this.DoAfterClose = function() {
                if(this.AfterClose != null) this.AfterClose(this);
            };
        this.DoAfterDelete = function() {
                if(this.AfterDelete != null) this.AfterDelete(this);
            };
        this.DoAfterEdit = function() {
                if(this.AfterEdit != null) this.AfterEdit(this);
            };
        this.DoAfterInsert = function() {
                if(this.AfterInsert != null) this.AfterInsert(this);
            };
        this.DoAfterOpen = function() {
                if(this.AfterOpen != null) this.AfterOpen(this);
            };
        this.DoAfterPost = function() {
                if(this.AfterPost != null) this.AfterPost(this);
            };
        this.DoAfterRefresh = function() {
                if(this.AfterRefresh != null) this.AfterRefresh(this);
            };
        this.DoAfterScroll = function() {
                if(this.AfterScroll != null) this.AfterScroll(this);
            };
        this.DoBeforeCancel = function() {
                if(this.BeforeCancel != null) this.BeforeCancel(this);
            };
        this.DoBeforeClose = function() {
                if(this.BeforeClose != null) this.BeforeClose(this);
            };
        this.DoBeforeDelete = function() {
                if(this.BeforeDelete != null) this.BeforeDelete(this);
            };
        this.DoBeforeEdit = function() {
                if(this.BeforeEdit != null) this.BeforeEdit(this);
            };
        this.DoBeforeInsert = function() {
                if(this.BeforeInsert != null) this.BeforeInsert(this);
            };
        this.DoBeforeOpen = function() {
                if(this.BeforeOpen != null) this.BeforeOpen(this);
            };
        this.DoBeforePost = function() {
                if(this.BeforePost != null) this.BeforePost(this);
            };
        this.DoBeforeRefresh = function() {
                if(this.BeforeRefresh != null) this.BeforeRefresh(this);
            };
        this.DoBeforeScroll = function() {
                if(this.BeforeScroll != null) this.BeforeScroll(this);
            };
        this.DoOnNewRecord = function() {
                if(this.OnNewRecord != null) this.OnNewRecord(this);
            };
        this.PostBase = function() {
            if(this.State == TDataSetState.dsEdit) {
                FOldRow = null;
            };
            this.State = TDataSetState.dsBrowse;
            for(var i = FFields.Count - 1; i >= 0; i--) {
                FFields.Get(i).Modified = false;
            };
        };
        /**
        *this method focused first record in dataset.
        *@method First
        */
        this.First = function() {
            this.DoBeforeScroll();
            if(this.State == TDataSetState.dsEdit || this.State == TDataSetState.dsInsert) this.Post();
            FRecNo = 0;
            this.DoAfterScroll();
            this.DataEvent(TDataSetEventType.etRecordChanged);
        };
        /**
         *this method focused next record in dataset.
         *@method Next
        */
        this.Next = function() {
            if(GetEOF()) return 0;
            this.DoBeforeScroll();
            if(this.State == TDataSetState.dsEdit || this.State == TDataSetState.dsInsert) this.Post();
            FRecNo++;
            this.DoAfterScroll();
            this.DataEvent(TDataSetEventType.etRecordChanged);
        };
        /**
        *this method focused prior record in dataset.
        *@method Prior
        */
        this.Prior = function() {
            if(GetBOF()) return 0;
            this.DoBeforeScroll();
            if(this.State == TDataSetState.dsEdit || this.State == TDataSetState.dsInsert) this.Post();
            FRecNo--;
            this.DoAfterScroll();
            this.DataEvent(TDataSetEventType.etRecordChanged);
        };
        /**
         *this method cancel any changes in dataset. this method only run edit or insert mode.
         *@method Cancel
        */
        this.Cancel = function() {
            this.DoBeforeCancel();
            var Dt = [];
            if(this.State == TDataSetState.dsEdit) {
                Dt = FOldRow.Data.slice();
                FRows.Get(FRecNo).Data = Dt;
                FOldRow = null;
            }
            if(this.State == TDataSetState.dsInsert) {
                FRows.Delete(FRecNo);
            }
            this.State = TDataSetState.dsBrowse;
            for(var i = 0; i < FFields.Count - 1; i++) {
                FFields.Get(I).Modified = false;
            };
            this.DoAfterCancel();
            this.DataEvent(TDataSetEventType.etDataChanged);
        };
        this.AppendBase = function() {            
            if(this.State == TDataSetState.dsInactive) throw new Error("Dataset not open.");            
            if(this.State == TDataSetState.dsEdit || this.State == TDataSetState.dsInsert) this.Cancel();            
            this.DoBeforeInsert();            
            var R = new TRow();                                    
            R.Data = new Array(GetFieldsCount()-1);            
            for (var i = 0; i<= GetFieldsCount()-1; i++) 
                R.Data[i] = null;            
            R.RecNo = FRows.Count - 1;
            if (R.RecNo == -1) R.RecNo = 0;
            FRows.Add(R);            
            FRecNo = FRows.Count - 1;
            this.State = TDataSetState.dsInsert;                        
            this.DoAfterInsert();
            this.DoOnNewRecord();
            this.DataEvent(TDataSetEventType.etDataChanged);
        };
        /**
        * this method setting dataset mode to Editing
        * @method Edit
        */
        this.Edit = function() {
            if(this.State != TDataSetState.dsInactive) {
                this.DoBeforeEdit();
                FOldRow = new TRow();
                FOldRow.RecNo = FRecNo;
                var Dt = [];
                Dt = FRows.Get(FRecNo).Data.slice();
                FOldRow.Data = Dt;
                this.State = TDataSetState.dsEdit;
                this.DoAfterEdit();
                this.DataEvent(TDataSetEventType.etDataChanged);
            } else throw new Error("Dataset is not open");
        };
        /**
        * this method search value in key field param.
        * @method Locate
        * @param {string} KeyField name
        * @param {*} Value
        * @return {boolean}
        */
        this.Locate = function(KeyField, Value) {
            var Bookmark = FRecNo;
            this.First();
            while(!GetEOF()) {
                if(this.Fields(KeyField).Value == Value) return true;
                this.Next();
            }
            FRecNo = Bookmark;
            this.DataEvent(TDataSetEventType.etRecordChanged);
        };
        this.ClearFieldList = function() {
            FFields.Clear();
        };
        /**
        *this method close dataset and free dataset memory.
        *@method Close
        */
        this.Close = function() {
            this.DoBeforeClose();
            for(var i = 0; i < FFields.Count - 1; i++) {
                FFields.Put(i, null);
            };
            ClearFieldList();
            for(var i = 0; i < GetRecordCount() - 1; i++) {
                FRows.Get(i, null);
            };
            FRows.Clear();
            this.State = TDataSetState.dsInactive;
            this.DoAfterClose();
        };
        this.AddField = function(F) {
            FFields.Add(F);
        };
    }
exports.TFieldType = TFieldType;    
exports.TRow = TRow;    
exports.TDataSetState = TDataSetState;
exports.TField = TField;
exports.TDataSet = TDataSet;